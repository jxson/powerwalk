/*

* paths
* files
* directories
* symlink

*/
var powerwalk = require('../')
var test = require('tape')
var fixtures = require('./fixtures')

test('powerwalk(dirname) - events', function(t) {
  var paths = []
  var files = []
  var directories = []
  var symlinks = []

  powerwalk(fixtures.dirname)
  .on('path', push(paths))
  .on('file', push(files))
  .on('directory', push(directories))
  .on('symlink', push(symlinks))
  .on('finish', function() {
    t.same(paths, fixtures.everything)
    t.same(files, fixtures.files)
    t.same(directories, fixtures.directories)
    // t.same(symlinks, fixtures.symlinks)
    t.end()
  })
})

function push(array) {
  return callback

  function callback(path) {
    array.push(path)
    array.sort()
  }
}
