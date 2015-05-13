var debug = require('debug')('powerwalk')
var Transform = require('readable-stream/transform')
var inherits  = require('util').inherits

module.exports = PowerWalk

function PowerWalk(options) {
  if (!(this instanceof PowerWalk)) {
    return new PowerWalk(options)
  }

  var stream = this

  Transform.call(stream, options)
  stream._destroyed = false
}

inherits(PowerWalk, Transform)

PowerWalk.prototype.destroy = function(err) {
  var stream = this

  if (stream._destroyed) {
    return
  }

  stream._destroyed = true

  process.nextTick(function() {
    if (err) {
      stream.emit('error', err)
    }

    stream.emit('close')
  })
}
