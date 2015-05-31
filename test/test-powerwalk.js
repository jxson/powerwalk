var powerwalk = require('../')
var test = require('tape')
var path = require('path')
var fixtures = path.resolve(__dirname, './fixtures')
var through = require('through2')
var expected = require('./expected')
var EventEmitter = require('events').EventEmitter
var Stream = require('stream').Stream

test('var stream = powerwalk(options)', function(t) {
  t.ok(powerwalk() instanceof EventEmitter, 'should be an event emitter')
  t.ok(powerwalk() instanceof Stream, 'should be a stream')
  t.end()
})

test('powerwalk(source).pipe(stream)', function(t) {
  var stream = through(write, flush)
  var files = []

  powerwalk(fixtures).pipe(stream)

  function write(buffer, enc, callback){
    files.push(buffer.toString())
    callback(null, buffer)
  }

  function flush() {
    t.same(files, expected.files)
    t.end()
  }
})
