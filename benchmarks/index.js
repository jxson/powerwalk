var benchmark = require('./simple-benchmarker')

benchmark('example', 100, function(done) {
  setTimeout(function() {
    done()
  }, Math.random())
})
.on('stats', function(stats) {
  console.log('stats', stats)
})
.on('end', function(average) {
  console.log(average + ' milliseconds per iteration');
})
