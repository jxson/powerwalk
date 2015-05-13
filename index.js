var debug = require('debug')('powerwalk')

var through2 = require('through2')
  , glob = require('glob')
  , fs = require('graceful-fs')
  , stat = fs.stat
  , path = require('path')

module.exports = function(dirname){
  var stream = through2(write, flush)
    , options = { cwd: dirname
      , strict: true
      , nosort: true
      }
    , queue = []

  fs.exists(dirname, function(exists){
    if (! exists) {
      return stream.emit('error', new Error(dirname + ' does not exist'))
    }

    // NOTE: this used to intentionally wait until the glob end event, there is some
    // clean up that happens there which prevents things like double entries etc.
    // see glob option nounique if this becomes an issue again.
    glob('**', options)
    .on('error', function(err){ stream.emit('error', err) })
    .on('match', onmatch)
  })

  return stream

  function onmatch(match) {
    // don't stat empty strings
    if (match.length === 0) return

    var pathname = path.resolve(options.cwd, match)

    stream.write(pathname)
  }

  function write(chunk, enc, callback) {
    var pathname = chunk.toString()

    queue.push(pathname)

    stat(pathname, function(err, stats) {
      dequeue(pathname)

      if (err) return callback(err)
      if (! stats.isFile()) return callback()

      var file = {
        filename: pathname,
        stats: stats
      }

      if (wants('stat')) stream.emit('stat', file)

      if (wants('read')) read(file, callback)
      else callback(null, pathname)

      if (queue.length === 0) stream.end()
    })
  }

  function flush(callback) {
    debug('flushed')
    callback()
  }

  function wants(event){
    return stream.listeners(event).length > 0
  }

  function dequeue(pathname) {
    queue.splice(queue.indexOf(pathname), 1)
  }

  function read(file, callback){
    fs.readFile(file.filename, 'utf8', function(err, data){
      if (err) return callback(err)

      file.data = data

      stream.emit('read', file)

      callback(null, file.filename)
    })
  }
}
