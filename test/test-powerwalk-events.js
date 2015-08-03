var powerwalk = require('../')
var test = require('tape')
var helpers = require('./helpers')
var push = helpers.push
var error = helpers.error
var noop = helpers.noop

test('powerwalk(dirname) - events', function(t) {
  var dirname = helpers.resolve('dreams')
  var expected = helpers.expected('dreams')
  var paths = []
  var files = []
  var directories = []

  powerwalk(dirname)
  .on('error', error(t))
  .on('data', noop)
  .on('path', push(paths))
  .on('file', push(files))
  .on('directory', push(directories))
  .on('end', function() {
    t.same(paths, expected(), 'should emit paths')
    t.same(files, expected('files'), 'should emit files')
    t.same(directories, expected('directories'), 'should emit directories')
    t.end()
  })
})
