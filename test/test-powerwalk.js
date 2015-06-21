var powerwalk = require('../')
var test = require('tape')
var EventEmitter = require('events').EventEmitter
var Stream = require('stream').Stream
var helpers = require('./helpers')

test('var stream = powerwalk(options)', function(t) {
  t.ok(powerwalk() instanceof EventEmitter, 'should be an event emitter')
  t.ok(powerwalk() instanceof Stream, 'should be a stream')
  t.end()
})

test('powerwalk(dirname, callback)', function(t) {
  var dirname = helpers.resolve('dreams')
  var expected = helpers.expected('dreams')

  powerwalk(dirname, function(err, results) {
    t.error(err)
    t.same(results.sort(), expected('files'), 'should callback with files')
    t.end()
  })
})
