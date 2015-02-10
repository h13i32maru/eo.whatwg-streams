#!/bin/bash

rm -rf out/test
mkdir -p out/test
./node_modules/.bin/6to5 --out-dir out/test/ test/
rm -rf out/test/karma.conf.js

rm -rf out/test-espower
cp -a out/test out/test-espower
for file in $(find out/test/ -name '*Test.js')
do
    out=$(echo $file | sed 's#^out/test/#out/test-espower/#')
    ./node_modules/.bin/espower $file > $out
done
