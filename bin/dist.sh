# !/usr/bin/env bash

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

# Change the individual sub-text-domain for the included sub-plugins in the main one.
composer install --prefer-dist --no-progress --no-suggest
composer run format-dist -- "./dist/$DIST_FOLDER"
composer install --no-dev --prefer-dist --no-progress --no-suggest

cd dist

# Create a zip file in './artifact' from the filtered files in the './dist'
zip -r "../artifact/$DIST_FOLDER" "./$DIST_FOLDER/"

echo "BUILD GENERATED: $BUILD_NAME"

cd -

BUILD_NAME="otter-pro"
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

cp -r build/pro dist/$DIST_FOLDER

cd dist

mv $DIST_FOLDER/pro $DIST_FOLDER/build/pro

zip -r "../artifact/$DIST_FOLDER" "./$DIST_FOLDER/" -x "*.wordpress-org*"

echo "BUILD GENERATED: $BUILD_NAME"

cd -

npm run plugins

plugins=( animation css export-import )

for i in "${plugins[@]}"
do
  BUILD_NAME="blocks-${i}"
  export BUILD_NAME

  if [ ! -z "$1" ] && [ $1 == 'development' ]; then
    DIST_FOLDER="$BUILD_NAME-dev"
  else
    DIST_FOLDER=$BUILD_NAME
  fi

  echo "BUILD_NAME=$BUILD_NAME"

  cd plugins/$BUILD_NAME

  # We install dependencies only if composer.json exists.
  if [ -f "composer.json" ]; then
    composer install --no-dev
  fi

  rsync -rc --exclude-from ".distignore" "./" "../../dist/$DIST_FOLDER"

  cd ../..

  if [ ! -d "dist/$DIST_FOLDER/build" ]; then
    mkdir "dist/$DIST_FOLDER/build"
  fi

  if [ ! -d "dist/$DIST_FOLDER/src" ]; then
    mkdir "dist/$DIST_FOLDER/src"
  fi

  cp -r inc/class-blocks-$i.php build/$i dist/$DIST_FOLDER
  cp -r src/$i dist/$DIST_FOLDER/src/
  cp LICENSE "dist/$DIST_FOLDER/LICENSE"

  cd dist

  mv $DIST_FOLDER/$i $DIST_FOLDER/build/$i

  zip -r "../artifact/$DIST_FOLDER" "./$DIST_FOLDER/" -x "*.wordpress-org*"

  echo "BUILD GENERATED: $BUILD_NAME"

  cd -
done
