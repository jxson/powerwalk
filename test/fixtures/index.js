var path = require('path')
var expected = {
  '': 'directory',
  'index.js': 'file',
  'a-dream': 'directory',
  'a-dream/foo.md': 'file',
  'a-dream/within': 'directory',
  'a-dream/within/bar.md': 'file',
  'a-dream/within/a-dream': 'directory',
  'a-dream/within/a-dream/baz.md': 'file',
  'a-dream/within/a-dream/within': 'directory',
  'a-dream/within/a-dream/within/qux.md': 'file',
  'a-dream/within/a-dream/within/a-dream': 'directory',
  'a-dream/within/a-dream/within/a-dream/norf.md': 'file'
}
var keys = Object.keys(expected).sort()

module.exports = {
  dirname: __dirname,
  everything: keys.map(resolve),
  files: keys.filter(file).map(resolve),
  directories: keys.filter(directory).map(resolve)
}

function file(key) {
  return expected[key] === 'file';
}

function directory(key) {
  return expected[key] === 'directory';
}

function resolve(pathname) {
  return path.resolve(__dirname, pathname)
}
