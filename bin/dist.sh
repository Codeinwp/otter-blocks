#!/usr/bin/env bash

BUILD_VERSION=$(node -pe "require('./package.json').version")
export BUILD_VERSION
BUILD_NAME=$(node -pe "require('./package.json').name")
export BUILD_NAME

echo "BUILD_NAME=$BUILD_NAME"  >> $GITHUB_ENV
echo "BUILD_VERSION=$BUILD_VERSION"  >> $GITHUB_ENV

if [ ! -d "dist" ]; then
  mkdir "dist"
fi

if [ ! -d "artifact" ]; then
  mkdir "artifact"
fi

# Take all the files, filter the dev ones (e.g. node_modules, src), and save the result to './dist'
rsync -rc --exclude-from ".distignore" "./" "dist/$BUILD_NAME"

cd dist
# Create a zip file in './artifact' from the filtered files in the './dist'
zip -r "../artifact/$BUILD_NAME" "./$BUILD_NAME/"
cd -

