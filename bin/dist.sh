#!/usr/bin/env bash

BUILD_VERSION=$(node -pe "require('./package.json').version")
export BUILD_VERSION
BUILD_NAME=$(node -pe "require('./package.json').name")
export BUILD_NAME

echo "::set-env name=BUILD_NAME::$BUILD_NAME"
echo "::set-env name=BUILD_VERSION::$BUILD_VERSION"

if [ ! -d "dist" ]; then
  mkdir "dist"
fi

if [ ! -d "artifact" ]; then
  mkdir "artifact"
fi

rsync -rc --exclude-from ".distignore" "./" "dist/$BUILD_NAME"

cd dist
zip -r "../artifact/$BUILD_NAME" "./$BUILD_NAME/"

echo "BUILD GENERATED: $BUILD_NAME"

cd -

BUILD_VERSION=$(node -pe "require('./plugins/blocks-animation/package.json').version")
export BUILD_VERSION
BUILD_NAME=$(node -pe "require('./plugins/blocks-animation/package.json').name")
export BUILD_NAME

echo "::set-env name=BUILD_NAME::$BUILD_NAME"
echo "::set-env name=BUILD_VERSION::$BUILD_VERSION"

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

BUILD_VERSION=$(node -pe "require('./plugins/blocks-css/package.json').version")
export BUILD_VERSION
BUILD_NAME=$(node -pe "require('./plugins/blocks-css/package.json').name")
export BUILD_NAME

echo "::set-env name=BUILD_NAME::$BUILD_NAME"
echo "::set-env name=BUILD_VERSION::$BUILD_VERSION"

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