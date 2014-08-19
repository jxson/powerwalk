# powerwalk

[![NPM](https://nodei.co/npm/powerwalk.png)](https://nodei.co/npm/powerwalk/)

> Recursively walks a directory and streams filenames.

[![Build Status](https://travis-ci.org/jxson/powerwalk.png?branch=master)](https://travis-ci.org/jxson/powerwalk)
[![Dependency Status](https://david-dm.org/jxson/powerwalk.png)](https://david-dm.org/jxson/powerwalk)

I keep writing and re-writing this code in one form or another for most of my projects. I thought it might be useful to some of you. There are a few similar packages on npm already but none seem to have either a narrow focus, support streams, or use straight `fs` calls which can be harsh when EMFILE happens.

# EXAMPLES

Walk a directory named `content` and `console.log` the filenames:

    powerwalk('./content')
    .on('data', function(filename){
      console.log(filename.toString())
    })

Or pipe the filenames through a stream:

    var through = require('through')
    var stream = through2(write, flush)

    powerwalk('./content').pipe(stream)

# LICENSE (MIT)

Copyright (c) Jason Campbell ("Author")

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
