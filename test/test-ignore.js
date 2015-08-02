const powerwalk = require('../')
const test = require('tape')
const helpers = require('./helpers')

test('options - ignore', function(t) {
  var dirname = helpers.resolve('dreams')
  var options = {
    ignore: helpers.resolve('dreams/a-dream/within')
  }

  powerwalk(dirname, options, function(err, results) {
    t.error(err)
    t.equal(results.length, 1)
    t.same(results, [ helpers.resolve('dreams/a-dream/foo.md') ])
    t.end()
  })
})
