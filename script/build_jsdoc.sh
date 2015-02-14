#!/bin/bash

./node_modules/.bin/6to5 misc/node_modules/spruce-template/index.js --out-file misc/node_modules/spruce-template/out/index.js
./node_modules/.bin/6to5 misc/jsdoc/jsdoc-cloudy/publish.es6.js --out-file misc/jsdoc/jsdoc-cloudy/publish.js

mkdir -p out/doc-new
./node_modules/.bin/jsdoc -c jsdoc.json

echo out/doc/index.html
