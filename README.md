# powerwalk

[![NPM](https://nodei.co/npm/powerwalk.png)](https://nodei.co/npm/powerwalk/)

> Recursively walks a directory and emits filenames. Supports additional stat and read events (if you want them).

[![Build Status](https://travis-ci.org/jxson/powerwalk.png?branch=master)](https://travis-ci.org/jxson/powerwalk) [![Dependency Status](https://david-dm.org/jxson/powerwalk.png)](https://david-dm.org/jxson/powerwalk)

I keep writing and re-writing this code in one form or another for most of my projects. I thought it might be useful to some of you. There are a few similar packages on npm already but none seem to have either the narrow focus I wanted or they use straight `fs` calls which can be harsh when EMFILE happens.

# EXAMPLES

Walk a directory named `content` and `console.log` the filenames:

    powerwalk('./content')
    .on('file', function(filename){
      console.log(filename)
    })

Or pipe the filenames through a stream:

    var through = require('through')
      , stream = through(write, end)

    powerwalk('./content').pipe(stream)

# powerwalk(dir)

Performs an async walk, returns an event emitter that will execute file calls and emit events appropriately.

    var walker = powerwalk('my-directory')

## Event: 'error'
`function(error){ }`

Emitted when an error happens

## Event: 'file'
`function(filename){ }`

Everytime a file is found this is emitted with the **absolute path to the file** as filename.

## Event: 'stat'
`function(file){ }`

If there is a listener for the `stat` event an `fs.stat` call will be made and emit this event with a file object

## Event: 'read'
`function(file){ }`

If there is a listener for the `read` event an `fs.readFile` call will be made and emit this event with a file object.

## Event: 'end'
`function(end){ }`

Emitted when the walk is over.

# File Object

Objects emitted from `stat` and and `read` events will have 3 properties:

* `filename` - the absolute pathname for the file
* `stats` - the stats result for the file
* `data` - the contents of the file


# LICENSE (MIT)

Copyright (c) Jason Campbell ("Author")

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
