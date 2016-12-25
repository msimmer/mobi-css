
# mobi-css

[![Build Status](https://img.shields.io/travis/msimmer/mobi-css/master.svg?style=flat)](https://travis-ci.org/msimmer/mobi-css)
[![NPM version](https://badge.fury.io/js/mobi-css.svg)](http://badge.fury.io/js/mobi-css)

Strip out CSS that affects Mobi validation and/or performance. Returns a promise object.

## Install

```
$ npm i -S mobi-css
```

## Usage

```js
import path from 'path'
import mobicss from 'mobi-css'

const options = {
  input: [
    path.join(__dirname, 'css/styles1.css'),
    path.join(__dirname, 'css/styles2.css'),
  ],
  output: 'string' // [string|buffer] default: buffer
}

mobicss.strip(options).catch(err => console.error(err))
```
