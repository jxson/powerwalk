var EventEmitter = require('events').EventEmitter
var inherits = require('util').inherits

module.exports = Benchmark

// TODO: varience, mean, etc. report
// TODO: harness
function Benchmark(name, iterations, callback) {
  if (!(this instanceof Benchmark)) {
    return new Benchmark(name, iterations, callback)
  }

  var benchmark = this

  EventEmitter.call(benchmark)

  benchmark.runs = iterations
  benchmark.pending = iterations
  benchmark.fn = callback
  benchmark.name = name
  benchmark.stats = []

  benchmark.on('stats', function(stats) {
    this.stats.push(stats)
  })

  benchmark.run()
}

inherits(Benchmark, EventEmitter)

Benchmark.prototype.run = function () {
  var benchmark = this
  var stats = {
    name: benchmark.name,
    run: benchmark.runs - benchmark.pending,
    start: Date.now()
  }

  benchmark.fn(done)

  function done() {
    stats.end = Date.now()
    benchmark.pending--

    benchmark.emit('stats', stats)

    if (benchmark.pending === 0) {
      benchmark.emit('end', average(benchmark.stats))
    } else {
      benchmark.run()
    }
  }
}

function average(stats) {
  return stats.reduce(add, 0) / stats.length

  function add(accumulator, stat) {
    var elapsed = stat.end - stat.start
    return accumulator + elapsed
  }
}
