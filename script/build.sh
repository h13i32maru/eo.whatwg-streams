#!/bin/bash

rm -rf out/src
mkdir -p out/src

./node_modules/.bin/6to5 --out-dir out/src src
./node_modules/.bin/browserify out/src/index-browser.js --outfile out/src/index-browser.tmp.js
mv out/src/index-browser.tmp.js out/src/index-browser.js
