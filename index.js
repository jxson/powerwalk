var debug = require('debug')('powerwalk')
var through = require('through2')
var path = require('path')
var fs = require('fs')
var stat = fs.lstat
var read = fs.readdir

module.exports = walk

function walk(dirname, options, callback) {
  dirname = path.resolve(dirname || '')

  options = {
    highWaterMark: 16
  }

  var stream = through(options, transform, flush)

  stream.queue = []

  debug('starting walk at %s', dirname)

  stream.dirs = []

  stream.on('directory', function(directory) {
    stream.dirs.push(directory)
  })


  fs.exists(dirname, function(exists) {
    if (! exists) {
      throw new Error('TODO: non-exisitng dir error')
    } else {
      stream.write(dirname)
    }
  })

  return stream
}

function transform(buffer, enc, callback) {
  debug('transform %s', buffer)

  var stream = this
  var pathname = buffer.toString()

  debug('queue %s', pathname)
  this.queue.push(pathname)

  stat(pathname, function(err, stats) {
    if (err) return callback(err)

    debug('stat %s - %o', pathname, stats)

    stream.emit('stat', pathname, stats)
    stream.emit(type(stats), pathname)

    if (type(stats) === 'directory') {
      debug('directory: %s', pathname)

      read(pathname, function(err, results) {
        if (err) return callback(err)

        each(results, function(item) {
          stream.write(path.resolve(pathname, item))
        })

        callback()
        done(pathname)
      })
    }

    if (type(stats) === 'file') {
      debug('file: %s', pathname)
      callback(null, pathname)
      done(pathname)
    }
  })

  function dequeue(pathname) {
    var start = stream.queue.indexOf(pathname)
    var deleteCount = 1
    stream.queue.splice(start, deleteCount)
  }

  function done(pathname) {
    debug('dequeue %s', pathname)
    dequeue(pathname)

    if (stream.queue.length === 0) {
      stream.end()
    }
  }
}

function flush(callback) {
  debug('_flush')
  callback()
}

var methods = [
  {
    type: 'file',
    fn: 'isFile'
  },
  {
    type: 'directory',
    fn: 'isDirectory'
  },
  {
    type: 'blockdevice',
    fn: 'isBlockDevice'
  },
  {
    type: 'symlink',
    fn: 'isSymbolicLink'
  },
  {
    type: 'socket',
    fn: 'isSocket'
  },
  {
    type: 'fifo',
    fn: 'isFIFO'
  },
  {
    type: 'characterdevice',
    fn: 'isCharacterDevice'
  },
  {
    type: 'directory',
    fn: 'isDirectory'
  }
]

function type(stats) {
  var value

  each(methods, function iterator(method, index, array) {
    if (stats[method.fn]()) {
      value = method.type
    }
  })

  return value
}

function resolve(from, to) {
  stream = this

  return path.resolve(stream._start, from, to)
}

function each(array, iterator) {
  for (var i = 0; i < array.length; i++) {
    iterator(array[i], i, array)
  }
}
