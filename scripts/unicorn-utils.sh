#!/bin/bash

# Script to:
# - copy buttons to a temporary directory
# - run styleguide generator against that directory
# Usage: ./scripts/combine_buttons_and_styleguide.sh --module-dir path/to/modules --output-dir path/to/outputdir
# Note that if the --copy-only options is used, this script will just copy the module over
# Copy only usage: ./scripts/combine_buttons_and_styleguide.sh --module-dir path/to/modules --output-dir path/to/outputdir --copy-only

# Verbose ... TODO: remove once solid
set -x

# http://stackoverflow.com/questions/59895/can-a-bash-script-tell-what-directory-its-stored-in
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ROOT="$DIR/.."
TMP="tmp-directory"
SG_NAME="styleguide"
STYLEGUIDE_GENERATOR_SCRIPT="$ROOT/vendor/Unicorn-styleguide-generator/uni-generate-styleguide.js"

##### HELP ####
function help()
{
    helpInfo="$helpInfo Arguments\n"
    helpInfo="$helpInfo \t--help \t\t\t This info.\n"
    helpInfo="$helpInfo \t--copy-only\t\t\t This will copy the module directory to output directory but will not create a styleguide.\n"
    helpInfo="$helpInfo \t--module-dir \t\t\t Path to module directory (MUST INCLUDE TRAILING FORWARD SLASH).\n"
    helpInfo="$helpInfo \t--output-dir \t\t\t Path to output generated styleguide to.\n"
    echo -e $helpInfo
    exit 0;
}
COPY_ONLY=0

##### PARSE CLI ARGS ####
args=("$@")
function parseCLIArgs()
{
    for ((i=0;i<$#;i++)); do
        # echo " ${args[${i}]}"
        if [ ${args[${i}]} = "--copy-only" ]; then
            COPY_ONLY=1
        elif [ ${args[${i}]} = "--module-dir" ]; then
            i=$i+1
            MODULE_DIR=${args[${i}]}
            [ ! -z "$MODULE_DIR" ] && [[ $MODULE_DIR != -* ]]
        elif [ ${args[${i}]} = "--output-dir" ]; then
            i=$i+1
            OUTPUT_DIR=${args[${i}]}
            [ ! -z "$OUTPUT_DIR" ] && [[ $OUTPUT_DIR != -* ]] || die "No Output Directory provided"
        elif [ ${args[${i}]} = "--help" ]; then
            help
            exit 0;
        fi
    done
}
parseCLIArgs "$@"


### Only generate styleguide if --copy-only NOT set
if [ $COPY_ONLY -eq 0 ]; then
    set -x
    ##### CREATE TMP DIR ####
    # e.g. this creates <root>/tmp-directory and copies module over
    echo "Creating tmp dir..."
    pushd $ROOT;
    mkdir "$ROOT/$TMP"
    ##### COPY MODULE TO TMP DIR ####
    echo "Copying module to tmp dir..."
    cp -R "$ROOT/$MODULE_DIR" "$ROOT/$TMP"
    ##### RUN STYLEGUIDE STYLEGUIDE_GENERATOR_SCRIPT ####
    # Run uni-generate-styleguide.js and place in temp dir
    echo "Creating styleguide..."
    $STYLEGUIDE_GENERATOR_SCRIPT -m $ROOT/$MODULE_DIR -o $ROOT/$TMP/$SG_NAME
    ##### COPY TO OUTPUT DIR AND CLEAN TMP DIR ####
    echo "Copying tmp dir to $OUTPUT_DIR"
    rm -rf $OUTPUT_DIR # in case exists already
    cp -R "$ROOT/$TMP" $OUTPUT_DIR
    echo "Cleaning up tmp dir..."
    rm -rf $ROOT/$TMP
else
    # Copy only
    rm -rf $OUTPUT_DIR # in case exists already
    echo "Copying module to tmp dir..."
    cp -R "$ROOT/$MODULE_DIR" $OUTPUT_DIR
fi

popd;
echo "All done"
exit 0
