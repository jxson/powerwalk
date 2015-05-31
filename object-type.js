var methods = [
  {
    type: 'file',
    fn: 'isFile'
  },
  {
    type: 'directory',
    fn: 'isDirectory'
  },
  {
    type: 'blockdevice',
    fn: 'isBlockDevice'
  },
  {
    type: 'characterdevice',
    fn: 'isCharacterDevice'
  },
  {
    type: 'symlink',
    fn: 'isSymbolicLink'
  },
  {
    type: 'fifo',
    fn: 'isFIFO'
  },
  {
    type: 'socket',
    fn: 'isSocket'
  }
]

var length = methods.length

module.exports = objectType

function objectType(stats) {
  var value

  for (var i = 0; i < length; i++) {
    var method = methods[i]
    if (stats[method.fn]()) {
      value = method.type
    }
  }

  return value
}
