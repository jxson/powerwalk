var test = require('tape')
var powerwalk = require('../')
var path = require('path')
var dirname = path.resolve(__dirname, 'fixtures')
var expected = require('./fixtures/expected')

test('powerwalk.sync(dirname, options)', function(t) {
  var actual = powerwalk.sync(dirname)

  t.same(actual, expected.files)
  t.end()
})
