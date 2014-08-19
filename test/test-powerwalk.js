
var powerwalk = require('../')
var test = require('prova')
var path = require('path')
var fixtures = path.resolve(__dirname, './fixtures')
var through2 = require('through2')
var fs = require('graceful-fs')

test('powerwalk(source).pipe(stream)', function(assert) {
  var stream = through2(write)

  assert.plan(8)

  powerwalk(fixtures)
  .pipe(stream)

  function write(chunk, enc, callback){
    var filename = chunk.toString()

    fs.exists(filename, function(exists) {
      assert.ok(exists, 'filename should exist')
      assert.ok(filename.match(/fixtures\/(.*)\.md$/), 'should be a fixture')
    })

    callback()
  }
})
