
var assert = require('assert')
  , powerwalk = require('../')
  , path = require('path')
  , fixtures = path.resolve(__dirname, './fixtures')
  , through = require('through')

describe('powerwalk(dir).pipe(dest)', function(){
  var files = []

  before(function(done){

    powerwalk(fixtures)
    .on('error', done)
    .pipe(through(write, done))

    function write(filename){
      files.push(filename)
    }
  })

  it('emits filenames recursively', function(){
    assert.equal(files.length, 4, 'Should emit 4 files')

    files.forEach(function(f){
      assert.equal(typeof f, 'string')
    })
  })
})
