#!/bin/bash

# Script to update our git submodule and copy over scss files (but then
# remove _options.scss so we can generate that from server later).
#
# Usage: ./scripts/update_submodules.sh # from root directory

# http://stackoverflow.com/questions/59895/can-a-bash-script-tell-what-directory-its-stored-in
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ROOT="$DIR/.."

# update submodules then bounce back to wherever we were
pushd $ROOT; git submodule update; popd;

# Only care about the scss dir from buttons submodule so we just copy over
# TODO: should later namespace modules like scss/buttons scss/grids etc.
rm -rf $DIR/../scss && mkdir $DIR/../scss
cp -R $DIR/../buttons/scss/* $DIR/../scss
rm $DIR/../scss/partials/_options.scss # Since we're going to build it via server :)
rm $DIR/../scss/main.scss

# Later we'll also do these for grids, etc. etc. like
#cp -R $DIR/../grids/scss/* $DIR/../scss/grids
