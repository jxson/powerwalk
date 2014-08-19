
var assert = require('assert')
  , powerwalk = require('../')
  , path = require('path')
  , fixtures = path.resolve(__dirname, './fixtures')
  , through2 = require('through2')

describe('powerwalk(dir).pipe(dest)', function(){
  var files = []

  before(function(done){

    powerwalk(fixtures)
    .on('error', done)
    .pipe(through2(write, function(callback) {
      done()
      callback()
    }))

    function write(chunk, enc, callback){
      files.push(chunk.toString())
      callback()
    }
  })

  it('emits filenames recursively', function(){
    assert.equal(files.length, 4, 'Should emit 4 files')

    files.forEach(function(f){
      assert.equal(typeof f, 'string')
    })
  })
})
