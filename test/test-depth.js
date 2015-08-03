const powerwalk = require('../')
const test = require('tape')
const helpers = require('./helpers')
const error = helpers.error
const push = helpers.push

test('powerwalk(dirname) - events', function(t) {
  var dirname = helpers.resolve('dreams')
  var expected = helpers.expected('dreams')
  var files = []
  var directories = []
  var options = {
    depth: 3
  }

  powerwalk(dirname, options)
  .on('error', error(t))
  .on('data', push(files))
  .on('directory', push(directories))
  .on('end', function() {
    t.same(directories, expected('directories').slice(0, 3))
    t.end()
  })
})
