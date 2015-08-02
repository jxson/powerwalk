const debug = require('debug')('powerwalk')
const path = require('path')
const Transform = require('readable-stream/transform')
const eos = require('end-of-stream')
const inherits = require('inherits')
const prr = require('prr')
const fs = require('graceful-fs')
const objectType = require('./object-type')
const extend = require('xtend')
const errno = require('errno')
const format = require('util').format
const defaults = {
  symlinks: false,
  highWaterMark: 16
}

module.exports = walk
module.exports.Powerwalk = Powerwalk

function walk(dirname, options, callback) {
  var length = arguments.length
  for (var i = 0; i < length; i++) {
    switch (typeof arguments[i]) {
      case 'string':
        dirname = arguments[i]
        break;
      case 'object':
        options = arguments[i]
        break;
      case 'function':
        callback = arguments[i]
        break;
    }
  }

  debug('starting walk at %s', dirname)

  var stream = new Powerwalk(options)

  if (callback) {
    var results = []

    stream.on('data', push(results))

    eos(stream, function endofstream(err) {
      if (err) return callback(err)
      else return callback(err, results)
    })
  }

  // maybe do an fs.exisits to provide a non-mysterious error here.
  if (dirname) {
    // TODO: move this resolution into the _transform method
    dirname = path.resolve(dirname || '')
    stream.write(dirname)
  }

  return stream
}

function Powerwalk(options) {
  if (! (this instanceof Powerwalk)) {
    return new Powerwalk(options)
  }

  options = extend(defaults, options)

  if (!(options.ignore instanceof Array)) {
    options.ignore = [ options.ignore ]
  }

  debug('initializing: %o', options)

  var powerwalk = this

  Transform.call(powerwalk, options)

  prr(powerwalk, 'options', options)
  prr(powerwalk, '_q', [])
  prr(powerwalk, '_walked', [])

  powerwalk.on('path', push(powerwalk._walked))
}

inherits(Powerwalk, Transform)

Powerwalk.prototype._transform = function (buffer, enc, callback) {
  debug('transform %s', buffer)

  var powerwalk = this
  var options = powerwalk.options
  var pathname = buffer.toString()

  if (contains(powerwalk.options.ignore, pathname)) {
    debug('ignoring: %s', pathname)

    callback()
    return
  }

  // // before anything setup things on first write
  // // * path resolver
  // if (! powerwalk._started) {
  //   powerwalk._started = true
  // }
  // // end first write setup

  powerwalk.queue(pathname)

  fs.lstat(pathname, function(err, stats) {
    if (err) {
      return callback(error(err, 'lstat', pathname))
    }

    powerwalk.emit('stat', pathname, stats)

    var type = objectType(stats)

    switch (type) {
      case 'directory':
        fs.readdir(pathname, function ondir(err, results) {
          if (err) return callback(err)

          var length = results.length
          for (var i = 0; i < length; i++) {
            var resolved = path.resolve(pathname, results[i])
            powerwalk.write(resolved)
          }

          callback()
          powerwalk.dequeue(pathname, 'directory')
        })

        break
      case 'file':
        callback(null, pathname)
        powerwalk.dequeue(pathname, 'file')
        break
      case 'symlink':
        // On a symlink there are two properties:
        // * The linkname
        // * the actual path of the link
        //
        // For instance one/two-symlink is actually ../two
        //
        // This should be kept track of for each symlink to possilby prevent recurrion
        // loops.
        //
        // Or keep track of emitted paths and DRY
        var walked = powerwalk.walked(pathname)
        var shouldSkip = ! options.symlinks || walked

        debug('shouldSkip: %s', shouldSkip)

        if (shouldSkip) {
          debug('skipping link: %s', pathname)
          callback()
          powerwalk.dequeue(pathname)
          break
        }

        fs.readlink(pathname, function onlinl(err, link) {
          if (err) {
            return callback(error(err, 'readlink', pathname))
          }

          var dirname = path.dirname(pathname)
          var resolved = path.resolve(dirname, link)

          debug('symlink %s', pathname)
          debug('symlink resolved: %s', resolved)
          powerwalk.write(resolved)

          callback()
          powerwalk.dequeue(pathname, 'symlink')
        })

        break
      default:
        callback()
        powerwalk.dequeue(pathname, type)
        break
    }
  })
}

Powerwalk.prototype.walked = function(pathname) {
  return contains(this._walked, pathname)
}

Powerwalk.prototype.queue = function(pathname) {
  this._q.push(pathname)
}

Powerwalk.prototype.dequeue = function(pathname, type) {
  var powerwalk = this
  var start = powerwalk._q.indexOf(pathname)
  var deleteCount = 1
  var removed = powerwalk._q.splice(start, deleteCount)[0]

  if (! removed) {
    var err = new Error('Can not dequeue items that have not been queued.')
    powerwalk.emit('error', err)
    return
  }

  if (! powerwalk.walked(pathname)) {
    powerwalk.emit('path', pathname)

    if (type) {
      powerwalk.emit(type, pathname)
    }
  }

  if (powerwalk._q.length === 0) {
    powerwalk.end()
  }

  return removed
}

Powerwalk.prototype._flush = function(callback) {
  debug('_flush')

  var powerwalk = this

  // Experimental: This might be a bad idea since data events are queued and the
  // read stream might not be hooked up til later.
  // if (powerwalk.listeners('data').length === 0) {
  //   powerwalk.on('data', noop)
  // }

  callback()
}


function contains(array, item) {
  return array.indexOf(item) !== -1
}

function push(array) {
  return callback

  function callback(buffer) {
    array.push(buffer.toString())
  }
}

function noop(){}

function error(err, method, pathname) {
  var code = err.code || -1
  var description = ''

  if (errno.code[code]) {
    description = errno.code[code].description
  } else {
    description = 'unknown error'
  }

  var message = format('%s "%s" failed: %s', method, pathname, description)

  err.message = message
  err.pathname = pathname

  return err
}
