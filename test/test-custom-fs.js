const powerwalk = require('../')
const test = require('tape')
const helpers = require('./helpers')
const fs = require('graceful-fs')

test('options - custom fs', function(t) {
  var dirname = helpers.resolve('dreams')
  var expected = helpers.expected('dreams')
  var directories = []
  var options = {
    fs: {
      lstat: fs.lstat,
      readdir: readdir,
      readlink: fs.readlink
    }
  }

  powerwalk(dirname, options, function(err, results) {
    t.error(err, 'powerwalk should not fail', dirname)
    t.same(directories, expected('directories'), 'should call custom fs.readdir')
    t.end()
  })

  function readdir(pathname, callback) {
    directories.push(pathname)
    fs.readdir(pathname, callback)
  }
})
