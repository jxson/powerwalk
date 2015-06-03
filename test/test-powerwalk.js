var powerwalk = require('../')
var test = require('tape')
var EventEmitter = require('events').EventEmitter
var Stream = require('stream').Stream

test('var stream = powerwalk(options)', function(t) {
  t.ok(powerwalk() instanceof EventEmitter, 'should be an event emitter')
  t.ok(powerwalk() instanceof Stream, 'should be a stream')
  t.end()
})
