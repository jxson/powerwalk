const debug = require('debug')('powerwalk')
const Duplex = require('readable-stream/duplex')
const eos = require('end-of-stream')
const errno = require('errno')
const extend = require('xtend')
const format = require('util').format
const inherits = require('inherits')
const objectType = require('./object-type')
const path = require('path')
const prr = require('prr')

const defaults = {
  symlinks: false,
  highWaterMark: 16,
  emit: 'file',
  fs: require('graceful-fs')
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

  options = options || {}
  options.dirname = path.resolve(dirname || '')

  var stream = new Powerwalk(options)

  if (callback) {
    var results = []

    stream.on('data', push(results))

    // PowerWalk is a Duplex Stream, in the callback case we want to know when
    // the stream is done writing so the results or error can be returned at
    // that time.
    eos(stream, { writable: false }, function endofstream(err) {
      if (err) return callback(err)
      else return callback(err, results)
    })
  }

  // Start the stream if dirname is passed in.
  // TODO: Do an fs.exisits to provide a non-mysterious error here.
  if (dirname) {
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

  // TODO: gaurd against invalid object types so options.emit: 'garabage'
  // doesn't cause problems
  // TODO: assert options.depth is a number

  var powerwalk = this

  Duplex.call(powerwalk, options)

  prr(powerwalk, '_maxDepth', options.depth)
  prr(powerwalk, '_fs', options.fs)
  prr(powerwalk, '_ignore', options.ignore)
  prr(powerwalk, '_emit', options.emit)
  prr(powerwalk, '_symlinks', options.symlinks)

  prr(powerwalk, '_queue', [])
  // TODO: Use an array for the pending items.
  prr(powerwalk, '_walking', {})
  prr(powerwalk, '_symlinked', []);

  // Keep track of symlinks since they can cause recursion cycles.
  // TODO: Remove listener on end.
  powerwalk.on('symlinked', push(  powerwalk._symlinked))
}

inherits(Powerwalk, Duplex)

Powerwalk.prototype._read = function(size) {
  var stream = this
  stream.dequeue()
}

Powerwalk.prototype._write = function(buffer, encoding, callback) {
  var stream = this
  var pathname = buffer.toString()

  // The first pathname will be treated as the _source to help with subsequent
  // path resolution
  if (!stream._source) {
    prr(stream, '_source', pathname)
  }

  stream.enqueue(pathname, callback)
}

Powerwalk.prototype.enqueue = function(pathname, callback) {
  callback = callback || ifError
  var stream = this

  stream._queue.push({
    pathname: pathname,
    callback: callback
  })

  function ifError(err) {
    if (err) stream.emit('error', err)
  }
}

Powerwalk.prototype.dequeue = function() {
  // It's possible for the queue to be empty at this point but with pending
  // async functions.
  var stream = this
  var entry = stream._queue.shift()

  if (!entry) {
    if (Object.keys(stream._walking).length === 0) {
      stream.push(null)
      stream.end()
    }

    return
  }

  var pathname = entry.pathname
  var callback = entry.callback

  stream._walking[pathname] = pathname
  stream.walk(pathname, function(err, type, children) {
    if (err) return callback(err)

    var length = children.length
    for (var i = 0; i < length; i++) {
      stream.enqueue(children[i])
    }

    delete stream._walking[pathname]

    if (!stream.symlinked(pathname)) {
      stream.emit('path', pathname)
    }

    if (type === stream._emit) {
      // If there is a successful push dequeue again, if not the stream is
      // paused and dequeue will resume once the consuming stream triggers a
      // call to _read.
      if (stream.push(pathname)) {
        stream.dequeue()
      }
    } else {
      // Nothing to push into the pipeline, kick of another walk.
      stream.dequeue()
    }

    callback()
  })
}

Powerwalk.prototype.walk = function(pathname, callback) {
  var stream = this
  var children = []

  // Ignore any items in the ignored array.
  if (contains(stream._ignore, pathname)) {
    callback(null, 'ignored', children)
    return
  }

  var _fs = stream._fs

  _fs.lstat(pathname, function(err, stats) {
    if (err) return callback(error(err, 'lstat', pathname))

    stream.emit('stat', pathname, stats)

    var type = objectType(stats)

    switch(type) {
      case 'directory':
        // NOTE: A relative path of "" or "foo" will both have a depth of one
        // giving an incorrect depth. Adding to the depth produces correct
        // results for limiting.
        var relative = path.relative(stream._source, pathname)
        var depth = relative.split(path.sep).length + 1

        // Stop recurrion depth has been reached.
        if (depth === stream._maxDepth) {
          callback(null, type, children)
          break
        }

        if (stream.symlinked(pathname)) {
          debug('symlink relationship already walked')
          callback(null, type, children)
          break
        }

        _fs.readdir(pathname, function ondir(err, results) {
          if (err) return callback(err)

          var length = results.length
          for (var i = 0; i < length; i++) {
            var resolved = path.resolve(pathname, results[i])
            children.push(resolved)
          }

          callback(null, type, children)
        })
        break
      case 'symlink':
        // On a symlink there are two properties, the original pathname and
        // the resolved path of where the symlink links to (it's origin).
        _fs.readlink(pathname, function onlink(err, link) {
          if (err) {
            return callback(error(err, 'readlink', pathname))
          }

          var dirname = path.dirname(pathname)
          var resolved = path.resolve(dirname, link)

          stream.emit('symlinked', resolved)
          callback(null, type, [ resolved ])
        })

        break
      default:
        callback(null, type, children)
        break
    }

    if (!stream.symlinked(pathname)) {
      stream.emit(type, pathname)
    }
  })
}

Powerwalk.prototype.symlinked = function(resolved) {
  return contains(this._symlinked, resolved)
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
