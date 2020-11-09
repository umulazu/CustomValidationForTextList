#!/bin/bash
set -e
curdir=`basename "$PWD"`

echo "Building $curdir custom question"

(
    cd runtime
    npm install
    npm run build
)

echo "Packing custom question"

rm -rf tmp && mkdir tmp
cp -R runtime/dist/. tmp/runtime
cp -R design/dist/. tmp/design
cp metadata.json tmp/

rm -rf dist && mkdir dist
python -c "import shutil; shutil.make_archive('dist/$curdir', 'zip', 'tmp')"

rm -rf tmp

echo "Done: dist/$curdir.zip created"