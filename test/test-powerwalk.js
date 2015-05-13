
var powerwalk = require('../')
var test = require('tape')
var path = require('path')
var fixtures = path.resolve(__dirname, './fixtures')
var through = require('through2')
var fs = require('graceful-fs')

var format = require('format')
var expected = require('./expected')

test('powerwalk', function(t) {
  t.equal(typeof powerwalk, 'function')
  t.end()
})

test('powerwalk(source).pipe(stream)', function(t) {
  var stream = through(write, flush)
  var files = []

  powerwalk(fixtures).pipe(stream)

  function write(buffer, enc, callback){
    files.push(buffer.toString())
    callback()
  }

  function flush() {
    t.same(files, expected.files)
    t.end()
  }
})
