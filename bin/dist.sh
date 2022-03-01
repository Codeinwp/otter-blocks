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

if [ ! -z "$1" ] && [ $1 == 'development' ]; then
  DIST_FOLDER="$BUILD_NAME-dev"
else
  DIST_FOLDER=$BUILD_NAME
fi

# Take all the files, filter the dev ones (e.g. node_modules, src), and save the result to './dist'
rsync -rc --exclude-from ".distignore" "./" "dist/$DIST_FOLDER"

cd dist
# Create a zip file in './artifact' from the filtered files in the './dist'
zip -r "../artifact/$DIST_FOLDER" "./$DIST_FOLDER/"

echo "BUILD GENERATED: $BUILD_NAME"

cd -

BUILD_NAME="blocks-animation"
export BUILD_NAME

if [ ! -z "$1" ] && [ $1 == 'development' ]; then
  DIST_FOLDER="$BUILD_NAME-dev"
else
  DIST_FOLDER=$BUILD_NAME
fi

echo "BUILD_NAME=$BUILD_NAME"

cd plugins/$BUILD_NAME

rsync -rc --exclude-from ".distignore" "./" "../../dist/$DIST_FOLDER"

cd ../..

if [ ! -d "dist/$DIST_FOLDER/assets" ]; then
  mkdir "dist/$DIST_FOLDER/assets"
fi

if [ ! -d "dist/$DIST_FOLDER/build" ]; then
  mkdir "dist/$DIST_FOLDER/build"
fi

cp inc/class-blocks-animation.php build/animation dist/$DIST_FOLDER -r

cp assets/animate dist/$DIST_FOLDER/assets -r

cd dist

mv $DIST_FOLDER/animation $DIST_FOLDER/build/animation

zip -r "../artifact/$DIST_FOLDER" "./$DIST_FOLDER/" -x "*.wordpress-org*"

echo "BUILD GENERATED: $BUILD_NAME"

cd -

BUILD_NAME="blocks-css"
export BUILD_NAME

if [ ! -z "$1" ] && [ $1 == 'development' ]; then
  DIST_FOLDER="$BUILD_NAME-dev"
else
  DIST_FOLDER=$BUILD_NAME
fi

echo "BUILD_NAME=$BUILD_NAME"

cd plugins/$BUILD_NAME

rsync -rc --exclude-from ".distignore" "./" "../../dist/$DIST_FOLDER"

cd ../..

if [ ! -d "dist/$DIST_FOLDER/build" ]; then
  mkdir "dist/$DIST_FOLDER/build"
fi

cp inc/class-blocks-css.php build/css dist/$DIST_FOLDER -r

cd dist

mv $DIST_FOLDER/css $DIST_FOLDER/build/css

zip -r "../artifact/$DIST_FOLDER" "./$DIST_FOLDER/" -x "*.wordpress-org*"

echo "BUILD GENERATED: $BUILD_NAME"

cd -

BUILD_NAME="blocks-export-import"
export BUILD_NAME

if [ ! -z "$1" ] && [ $1 == 'development' ]; then
  DIST_FOLDER="$BUILD_NAME-dev"
else
  DIST_FOLDER=$BUILD_NAME
fi

echo "BUILD_NAME=$BUILD_NAME"

cd plugins/$BUILD_NAME

rsync -rc --exclude-from ".distignore" "./" "../../dist/$DIST_FOLDER"

cd ../..

if [ ! -d "dist/$DIST_FOLDER/build" ]; then
  mkdir "dist/$DIST_FOLDER/build"
fi

cp inc/class-blocks-export-import.php build/export-import dist/$DIST_FOLDER -r

cd dist

mv $DIST_FOLDER/export-import $DIST_FOLDER/build/export-import

zip -r "../artifact/$DIST_FOLDER" "./$DIST_FOLDER/" -x "*.wordpress-org*"

echo "BUILD GENERATED: $BUILD_NAME"

cd -