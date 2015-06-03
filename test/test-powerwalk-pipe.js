var powerwalk = require('../')
var test = require('tape')
var fixtures = require('./fixtures')
var through = require('through2')

test('powerwalk(source).pipe(stream)', function(t) {
  var stream = through(write, flush)
  var files = []

  powerwalk(fixtures.dirname).pipe(stream)

  function write(buffer, enc, callback){
    files.push(buffer.toString())
    callback(null, buffer)
  }

  function flush() {
    t.same(files.sort(), fixtures.files)
    t.end()
  }
})
