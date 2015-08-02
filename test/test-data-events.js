const powerwalk = require('../')
const test = require('tape')
const helpers = require('./helpers')


test('options - change emitted data values', function(t) {
  var dirname = helpers.resolve('dreams')
  var expected = helpers.expected('dreams')
  var options = {
    emit: 'directory'
  }

  powerwalk(dirname, options, function(err, results) {
    t.error(err)
    t.same(results.sort(), expected('directories'), 'should callback with directories')
    t.end()
  })
})
