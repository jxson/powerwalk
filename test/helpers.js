const path = require('path')
const expectations = {
  dreams: {
    'dreams': 'directory',
    'dreams/a-dream': 'directory',
    'dreams/a-dream/foo.md': 'file',
    'dreams/a-dream/within': 'directory',
    'dreams/a-dream/within/bar.md': 'file',
    'dreams/a-dream/within/a-dream': 'directory',
    'dreams/a-dream/within/a-dream/baz.md': 'file',
    'dreams/a-dream/within/a-dream/within': 'directory',
    'dreams/a-dream/within/a-dream/within/qux.md': 'file',
    'dreams/a-dream/within/a-dream/within/a-dream': 'directory',
    'dreams/a-dream/within/a-dream/within/a-dream/norf.md': 'file'
  },
  'nightmares/mirrors': {
    'nightmares/mirrors': 'directory',
    'nightmares/mirrors/one': 'directory',
    'nightmares/mirrors/one/README.md': 'file',
    'nightmares/mirrors/one/two-symlink': 'symlink',
    'nightmares/mirrors/two': 'directory',
    'nightmares/mirrors/two/README.md': 'file',
    'nightmares/mirrors/two/one-symlink': 'symlink',
  }
}

module.exports = {
  push: push,
  error: error,
  noop: noop,
  resolve: resolve,
  expected: expected
}

function expected(basedir) {
  var collection = expectations[basedir]
  var keys = Object.keys(collection).sort()

  return get

  function get(type) {
    var results

    switch (type) {
      case undefined:
        results = keys
        break
      case 'files':
        results = keys.filter(filter('file'))
        break
      case 'directories':
        results = keys.filter(filter('directory'))
        break
      case 'symlinks':
        results = keys.filter(filter('symlink'))
        break
      default:
        throw new Error('Unknown object type: ' + type)
    }

    return results.map(resolve)
  }

  function filter(type) {
    return function (key) {
      return collection[key] === type
    }
  }
}

function resolve(pathname) {
  return path.resolve(__dirname, 'fixtures', pathname)
}

// Sorting push to simplify results comparison using `t.same()`.
function push(array) {
  return callback

  function callback(path) {
    array.push(path)
    array.sort()
  }
}

// Test helper to capture errors and finish the async tests and prevent false
// negatives in the test results.
function error(t) {
  return function end(err) {
    t.error(err)
    t.end()
  }
}

function noop(){}
