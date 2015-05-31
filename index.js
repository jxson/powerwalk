const debug = require('debug')('powerwalk')
const path = require('path')
const Transform = require('readable-stream/transform')
const inherits = require('inherits')
const prr = require('prr')
const fs = require('graceful-fs')
const objectType = require('./object-type')
const extend = require('xtend')
const defaults = {
  highWaterMark: 16
}

module.exports = function walk(dirname, options, callback) {
  // TODO: scrub args
  if (dirname) {
    dirname = path.resolve(dirname || '')
  }

  debug('starting walk at %s', dirname)

  var stream = new Powerwalk(options)

  // maybe do an fs.exisits to provide a non-mysterious error here.
  if (dirname) {
    stream.write(dirname)
  }

  return stream
}

module.exports.Powerwalk = Powerwalk

function Powerwalk(options) {
  options = extend(defaults, options)

  debug('initializing: %o', options)

  var powerwalk = this

  prr(powerwalk, '_q', [])

  Transform.call(powerwalk, options)
}

inherits(Powerwalk, Transform)

Powerwalk.prototype._transform = function (buffer, enc, callback) {
  debug('transform %s', buffer)

  var powerwalk = this
  var pathname = buffer.toString()

  powerwalk.queue(pathname)

  fs.lstat(pathname, function(err, stats) {
    if (err) return callback(err)

    var type = objectType(stats)

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
    }
  })
}

Powerwalk.prototype.queue = function(pathname) {
  this._q.push(pathname)
}

Powerwalk.prototype.dequeue = function(pathname, callback) {
  var powerwalk = this
  var start = powerwalk._q.indexOf(pathname)
  var deleteCount = 1
  var removed = powerwalk._q.splice(start, deleteCount)[0]

  if (! removed) {
    var err = new Error('Can not dequeue items that have not been queued.')
    powerwalk.emit('error', err)
    return
  }

  if (callback) {
    callback(null, pathname)
  }

  if (powerwalk._q.length === 0) {
    powerwalk.end()
  }

  return removed
}

Powerwalk.prototype._flush = function(callback) {
  debug('_flush')
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
