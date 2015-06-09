var powerwalk = require('../')
var test = require('tape')
var helpers = require('./helpers')
var through = require('through2')

test('powerwalk(source).pipe(stream)', function(t) {
  var dirname = helpers.resolve('dreams')
  var expected = helpers.expected('dreams')
  var stream = through(write, flush)
  var files = []

  powerwalk(dirname).pipe(stream)

  function write(buffer, enc, callback){
    files.push(buffer.toString())
    callback(null, buffer)
  }

  function flush() {
    t.same(files.sort(), expected('files'), 'should emit files on data')
    t.end()
  }
})
