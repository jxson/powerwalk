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

  powerwalk(dirname, { symlinks: true })
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
})

test('follow symlinks - error: bad symlink', function(t) {
  var dirname = helpers.resolve('nightmares/errors')
  var errno = require('errno')

  powerwalk(dirname, { symlinks: true })
  .on('data', noop)
  .on('error', function(err) {
    t.ok(err.message.match(errno.code.ENOENT), 'should have a nice message')
    t.ok(err.stack, 'should have a stack')
    t.ok(err.errno, 'should preserve errno')
    t.ok(err.code, 'should preserve code')
    t.equal(err.pathname, helpers.resolve('nightmares/errors/does-not-exist'))
    t.end()
  })
})
