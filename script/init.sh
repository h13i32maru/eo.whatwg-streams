#!/bin/bash

npm install
bower install

type curl > /dev/null 2>&1
if [ $? -eq 0 ]
then
    mkdir -p misc/type
    curl --output misc/type/lib.es6.d.ts https://raw.githubusercontent.com/Microsoft/TypeScript/master/bin/lib.es6.d.ts 2>/dev/null
    curl --output misc/type/lib.dom.d.ts https://raw.githubusercontent.com/Microsoft/TypeScript/master/bin/lib.dom.d.ts 2>/dev/null
fi
