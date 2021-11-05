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

echo "BUILD GENERATED: $BUILD_NAME"

cd -

BUILD_NAME="blocks-animation"
export BUILD_NAME

echo "BUILD_NAME=$BUILD_NAME"

cd plugins/$BUILD_NAME

rsync -rc --exclude-from ".distignore" "./" "../../dist/$BUILD_NAME"

cd ../..

if [ ! -d "dist/$BUILD_NAME/assets" ]; then
  mkdir "dist/$BUILD_NAME/assets"
fi

if [ ! -d "dist/$BUILD_NAME/build" ]; then
  mkdir "dist/$BUILD_NAME/build"
fi

cp inc/class-blocks-animation.php build/animation dist/$BUILD_NAME -r

cp assets/animate dist/$BUILD_NAME/assets -r

cd dist

mv $BUILD_NAME/animation $BUILD_NAME/build/animation

zip -r "../artifact/$BUILD_NAME" "./$BUILD_NAME/" -x "*.wordpress-org*"

echo "BUILD GENERATED: $BUILD_NAME"

cd -

BUILD_NAME="blocks-css"
export BUILD_NAME

echo "BUILD_NAME=$BUILD_NAME"

cd plugins/$BUILD_NAME

rsync -rc --exclude-from ".distignore" "./" "../../dist/$BUILD_NAME"

cd ../..

if [ ! -d "dist/$BUILD_NAME/build" ]; then
  mkdir "dist/$BUILD_NAME/build"
fi

cp inc/class-blocks-css.php build/css dist/$BUILD_NAME -r

cd dist

mv $BUILD_NAME/css $BUILD_NAME/build/css

zip -r "../artifact/$BUILD_NAME" "./$BUILD_NAME/" -x "*.wordpress-org*"

echo "BUILD GENERATED: $BUILD_NAME"

cd -

BUILD_NAME="blocks-export-import"
export BUILD_NAME

echo "BUILD_NAME=$BUILD_NAME"

cd plugins/$BUILD_NAME

rsync -rc --exclude-from ".distignore" "./" "../../dist/$BUILD_NAME"

cd ../..

if [ ! -d "dist/$BUILD_NAME/build" ]; then
  mkdir "dist/$BUILD_NAME/build"
fi

cp inc/class-blocks-export-import.php build/export-import dist/$BUILD_NAME -r

cd dist

mv $BUILD_NAME/export-import $BUILD_NAME/build/export-import

zip -r "../artifact/$BUILD_NAME" "./$BUILD_NAME/" -x "*.wordpress-org*"

echo "BUILD GENERATED: $BUILD_NAME"

cd -