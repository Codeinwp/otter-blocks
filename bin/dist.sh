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

cd dist

php -d memory_limit=1024M "$(which wp)" i18n make-pot $DIST_FOLDER $DIST_FOLDER/languages/otter-blocks.pot
cp $DIST_FOLDER/languages/otter-blocks.pot $DIST_FOLDER/languages/otter-blocks.po
"$(which wp)" i18n make-json $DIST_FOLDER/languages/otter-blocks.po --no-purge

# Create a zip file in './artifact' from the filtered files in the './dist'
zip -r "../artifact/$DIST_FOLDER" "./$DIST_FOLDER/"

echo "BUILD GENERATED: $BUILD_NAME"

cd -

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

  rsync -rc --exclude-from ".distignore" "./" "../../dist/$DIST_FOLDER"

  cd ../..

  if [ $i == 'animation' ] && [ ! -d "dist/$DIST_FOLDER/assets" ]; then
    mkdir "dist/$DIST_FOLDER/assets"
  fi

  if [ ! -d "dist/$DIST_FOLDER/build" ]; then
    mkdir "dist/$DIST_FOLDER/build"
  fi

  cp inc/class-blocks-$i.php build/$i dist/$DIST_FOLDER -r

  if [ $i == 'animation' ]; then
    cp assets/animate dist/$DIST_FOLDER/assets -r
  fi

  cd dist

  mv $DIST_FOLDER/$i $DIST_FOLDER/build/$i

  php -d memory_limit=1024M "$(which wp)" i18n make-pot $BUILD_NAME $BUILD_NAME/languages/$BUILD_NAME.pot
  cp $BUILD_NAME/languages/$BUILD_NAME.pot $BUILD_NAME/languages/$BUILD_NAME.po
  "$(which wp)" i18n make-json $BUILD_NAME/languages/$BUILD_NAME.po --no-purge

  zip -r "../artifact/$DIST_FOLDER" "./$DIST_FOLDER/" -x "*.wordpress-org*"

  echo "BUILD GENERATED: $BUILD_NAME"

  cd -
done

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

cp build/pro dist/$DIST_FOLDER -r

cd dist

mv $DIST_FOLDER/pro $DIST_FOLDER/build/pro

php -d memory_limit=1024M "$(which wp)" i18n make-pot $DIST_FOLDER $DIST_FOLDER/languages/otter-pro.pot
cp $DIST_FOLDER/languages/otter-pro.pot $DIST_FOLDER/languages/otter-pro.po
"$(which wp)" i18n make-json $DIST_FOLDER/languages/otter-pro.po --no-purge

zip -r "../artifact/$DIST_FOLDER" "./$DIST_FOLDER/" -x "*.wordpress-org*"

echo "BUILD GENERATED: $BUILD_NAME"

cd -
