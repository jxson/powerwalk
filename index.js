const debug = require('debug')('powerwalk')
const path = require('path')
const Transform = require('readable-stream/transform')
const inherits = require('inherits')
const prr = require('prr')
const fs = require('graceful-fs')
const objectType = require('./object-type')
const extend = require('xtend')
const defaults = {
  symlinks: false,
  highWaterMark: 16
}

module.exports = function walk(dirname, options, callback) {
  if (typeof dirname === 'object') {
    callback = options
    options = dirname
    dirname = null
  }

  debug('starting walk at %s', dirname)

  var stream = new Powerwalk(options)

  // maybe do an fs.exisits to provide a non-mysterious error here.
  if (dirname) {
    // TODO: move this resolution into the _transform method
    dirname = path.resolve(dirname || '')
    stream.write(dirname)
  }

  return stream
}

module.exports.Powerwalk = Powerwalk

function Powerwalk(options) {
  options = extend(defaults, options)

  debug('initializing: %o', options)

  var powerwalk = this

  Transform.call(powerwalk, options)

  prr(powerwalk, 'options', options)
  prr(powerwalk, '_q', [])
  prr(powerwalk, '_symlinks', [])
  // prr(Powerwalk, '_started', false)

  powerwalk.on('symlink', push(powerwalk._symlinks))
}

inherits(Powerwalk, Transform)

Powerwalk.prototype._transform = function (buffer, enc, callback) {
  debug('transform %s', buffer)

  var powerwalk = this
  var pathname = buffer.toString()

  // // before anything setup things on first write
  // // * path resolver
  // if (! powerwalk._started) {
  //   powerwalk._started = true
  // }
  // // end first write setup

  powerwalk.queue(pathname)

  fs.lstat(pathname, function(err, stats) {
    if (err) return callback(err)

    var type = objectType(stats)

    powerwalk.emit('path', pathname)
    powerwalk.emit('stat', pathname, stats)
    powerwalk.emit(type, pathname)

    switch (type) {
      case 'directory':
        readdir(pathname, powerwalk, callback)
        break;
      case 'file':
        callback(null, pathname)
        powerwalk.dequeue(pathname)
        break;
      case 'symlink':
        readlink(pathname, powerwalk, callback)
        break;
    }
  })
}

Powerwalk.prototype.queue = function(pathname) {
  this._q.push(pathname)
}

Powerwalk.prototype.dequeue = function(pathname) {
  var powerwalk = this
  var start = powerwalk._q.indexOf(pathname)
  var deleteCount = 1
  var removed = powerwalk._q.splice(start, deleteCount)[0]

  if (! removed) {
    var err = new Error('Can not dequeue items that have not been queued.')
    powerwalk.emit('error', err)
    return
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

function readdir(pathname, powerwalk, callback) {
  fs.readdir(pathname, done)

  function done(err, results) {
    if (err) return callback(err)

    var length = results.length
    for (var i = 0; i < length; i++) {
      var resolved = path.resolve(pathname, results[i])
      powerwalk.write(resolved)
    }

    callback()
    powerwalk.dequeue(pathname)
  }
}

// On a symlink there are two properties:
// * The linkname
// * the actual path of the link
//
// For instance one/two-symlink is actuall ../two
//
// This should be kept track of for each symlink to possilby prevent recurrion
// loops.
//
// Or keep track of emitted paths and DRY
function readlink(pathname, powerwalk, callback) {
  debug('readlink %s', pathname, powerwalk.options)

  var walked = powerwalk._symlinks

  if (powerwalk.options.symlinks && !contains(walked, pathname)) {
    fs.readlink(pathname, done)
  } else {
    done()
  }

  function done(err, link) {
    if (err) return callback(err)

    if (link) {
      var dirname = path.dirname(pathname)
      var resolved = path.resolve(dirname, link)

      debug('link %s', link)
      debug('resolved %s', resolved)

      callback(null, pathname)
      powerwalk.write(resolved)
    } else {
      callback()
    }

    powerwalk.dequeue(pathname)
  }
}

function contains(array, item) {
  return array.indexOf(item) !== -1
}

function push(array) {
  return callback

  function callback(pathname) {
    array.push(pathname)
  }
}

function noop(){}
