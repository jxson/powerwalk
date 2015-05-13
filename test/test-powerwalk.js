var powerwalk = require('../')
var test = require('tape')
var path = require('path')
var fixtures = path.resolve(__dirname, './fixtures')
var through = require('through2')
var fs = require('graceful-fs')

var format = require('format')
var expected = require('./expected')

var EventEmitter = require('events').EventEmitter
var Transform = require('stream').Duplex

test('var stream = powerwalk(options)', function(t) {
  t.equal(typeof powerwalk, 'function')
  t.ok(new powerwalk() instanceof powerwalk, 'should work with "new"')
  t.ok(powerwalk() instanceof powerwalk, 'should not require "new"')
  t.ok(powerwalk() instanceof EventEmitter, 'should be an event emitter')
  t.end()
})

test.skip('powerwalk(source).pipe(stream)', function(t) {
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
