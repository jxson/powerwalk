
var through = require('through')
  , glob = require('glob')
  , fs = require('graceful-fs')
  , path = require('path')

module.exports = function(dirname){
  var walker = through(write, end)
    , options = { cwd: dirname
      , strict: true
      , nosort: true
      }
    , queue = []
    , globin = true

  fs.exists(dirname, function(exists){
    if (! exists) {
      return walker.emit('error', new Error(dirname + ' does not exist'))
    }

    // NOTE: this used to intentionally wait until the glob end event, there is some
    // clean up that happens there which prevents things like double entries etc.
    // see glob option nounique if this becomes an issue again.
    glob('**', options)
    .on('error', function(err){ walker.emit('error', err) })
    .on('match', stat)
    .on('end', function(){ globin = false })
  })

  return walker

  function stat(match){
    // don't stat empty strings
    if (match.length === 0) return

    var pathname = path.resolve(options.cwd, match)

    queue.push(pathname)

    fs.stat(pathname, function(err, stats){
      if (err) return walker.emit('error', err)

      if (stats.isFile()) {
        var file = { filename: pathname
            , stats: stats
            }

        walker.queue(pathname) // for the through pipe
        walker.emit('file', pathname)

        if (wants('stat')) walker.emit('stat', file)

        if (wants('read')) read(file)
        else finish(pathname)

      } else finish(pathname)
    })
  }

  function finish(pathname){
    queue.splice(queue.indexOf(pathname), 1)

    if (queue.length === 0 && !globin) {
      walker.emit('end')
    }
  }

  function wants(event){
    return walker.listeners(event).length > 0
  }

  function read(file){
    fs.readFile(file.filename, 'utf8', function(err, data){
      if (err) return walker.emit('error', err)

      file.data = data

      walker.emit('read', file)
      finish(file.filename)
    })
  }
}

// noop for now
function write(data){}

function end(){}
