var powerwalk = require('../')
var test = require('tape')
var helpers = require('./helpers')
var push = helpers.push
var error = helpers.error
var noop = helpers.noop

test('follow symlinks', function(t) {
  var dirname = helpers.resolve('nightmares/mirrors')
  var expected = helpers.expected('nightmares/mirrors')
  var paths = []
  var symlinks = []
  var files = []
  var directories = []

  powerwalk({ symlinks: true })
  .on('error', error(t))
  .on('data', noop)
  .on('path', push(paths))
  .on('symlink', push(symlinks))
  .on('file', push(files))
  .on('directory', push(directories))
  .on('end', function() {
    t.same(symlinks, expected('symlinks'), 'should emit symlinks')
    t.same(paths, expected(), 'should emit paths')
    t.same(files, expected('files'), 'should emit files')
    t.same(directories, expected('directories'), 'should emit directories')
    t.end()
  })
  .write(dirname)
})

test.skip('follow symlinks - error', function(t) {
  // follow bad symlink
  t.end()
})
