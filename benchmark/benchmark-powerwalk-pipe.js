var benchmark = require('./')
var powerwalk = require('../')
var path = require('path')
var fixtures = path.resolve(__dirname, '../test/fixtures')
var through = require('through2')

benchmark('example', 100, function(done) {
  var stream = through(write, flush)
  var files = []

  powerwalk(fixtures).pipe(stream)

  function write(buffer, enc, callback){
    files.push(buffer.toString())
    callback(null, buffer)
  }

  function flush(callback) {
    done()
    callback()
  }
})
.on('stats', function(stats) {
  console.log('stats', stats)
})
.on('end', function(average) {
  console.log(average + ' milliseconds per iteration');
})
