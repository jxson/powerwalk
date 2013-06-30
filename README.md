# powerwalk [![Build Status](https://travis-ci.org/jxson/powerwalk.png?branch=master)](https://travis-ci.org/jxson/powerwalk)

Recursively walks a directory and emits filenames. Supports additional stat and read events (if you want them).

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
