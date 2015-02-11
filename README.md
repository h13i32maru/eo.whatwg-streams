[![Build Status](https://travis-ci.org/h13i32maru/eo.whatwg-streams.svg?branch=master)](https://travis-ci.org/h13i32maru/eo.whatwg-streams)

# eo.whatwg-streams
eo.whatwg-streams is WHATWG Streams API implementation based on [reference-implementation](https://github.com/whatwg/streams/tree/master/reference-implementation)

The changes are

- Convert ES6 to ES5 by [6to5](http://6to5.org/)
- Work on browser with [browserify](http://browserify.org/)
- Use the minimum assertion instead of Node.js assertion.

## Install

```sh
mkdir work
cd work
npm install eo.whatwg-streams
```

## Example
### for browser

```html
<script src="./node_modules/eo.whatwg-streams/out/src/index-browser.js"></script>
<script>
    console.log(window.Streams.ReadableStream);
</script>
```

### for Node.js

```js
var Streams = require('eo.whatwg-streams');

console.log(Streams.ReadableStream);
```

## API and Document

- [https://github.com/whatwg/streams](https://github.com/whatwg/streams)
- [https://streams.spec.whatwg.org/](https://streams.spec.whatwg.org/)
- [http://blog.h13i32maru.jp/entry/2015/02/01/120918](http://blog.h13i32maru.jp/entry/2015/02/01/120918)

## LICENSE
MIT

This software includes [whatwg/streams](https://github.com/whatwg/streams)(CC0). commit is [ac47325](https://github.com/whatwg/streams/commit/ac47325f40656f209dc140b256793cf4232b8f17)

----

# Development
## Setup

```sh
git clone git@github.com:h13i32maru/eo.whatwg-streams.git
cd eo.whatwg-streams
npm run init
npm run test
```

## Improve

```sh
vi src/index.js
npm run build
npm run start
open http://localhost:8080/misc/index.html
```
