#!/bin/sh

set -e
echo "Enter release version: "
read VERSION

read -p "Releasing $VERSION - are you sure? (y/n)" -n 1 -r
echo    # (optional) move to a new line
if [[ $REPLY =~ ^[Yy]$ ]]
then
  echo "Releasing $VERSION ..."
  
  # build
  VERSION=$VERSION npm run build

  rm -rf docs
  mv dist docs
  mv docs/_assets docs/assets

  node script/changesource.js

  # commit
  git add -A
  git commit -m "[build] $VERSION"

  # publish
  git push origin master
fi