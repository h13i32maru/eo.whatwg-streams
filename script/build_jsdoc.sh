#!/bin/bash

mkdir -p out/doc
./node_modules/.bin/jsdoc -c jsdoc.json

echo out/doc/index.html
