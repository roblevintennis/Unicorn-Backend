#!/bin/bash

# Script to:
# - copy buttons to a temporary directory
# - run styleguide generator against that directory
# Usage: ./scripts/combine_buttons_and_styleguide.sh --module-dir path/to/modules --output-dir path/to/outputdir

# http://stackoverflow.com/questions/59895/can-a-bash-script-tell-what-directory-its-stored-in
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ROOT="$DIR/.."
TMP="tmp-styleguide"
SG_NAME="styleguide"
GENERATOR_SCRIPT="$ROOT/vendor/Unicorn-styleguide-generator/uni-generate-styleguide.js"

##### HELP ####
function help()
{
    helpInfo="$helpInfo Arguments\n"
    helpInfo="$helpInfo \t--help \t\t\t This info.\n"
    helpInfo="$helpInfo \t--module-dir \t\t\t Path to module directory (MUST INCLUDE TRAILING FORWARD SLASH).\n"
    helpInfo="$helpInfo \t--output-dir \t\t\t Path to output generated styleguide to.\n"
    echo -e $helpInfo
    exit 0;
}

##### PARSE CLI ARGS ####
args=("$@")
function parseCLIArgs()
{
    for ((i=0;i<$#;i++)); do
        # echo " ${args[${i}]}"
        if [ ${args[${i}]} = "--module-dir" ]; then
            i=$i+1
            MODULE_DIR=${args[${i}]}
            [ ! -z "$MODULE_DIR" ] && [[ $MODULE_DIR != -* ]] || die "No Module Directory provided"
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

set -x

##### CREATE TMP DIR ####
# e.g. this creates <root>/tmp-styleguide and copies module over
echo "Creating tmp dir..."
pushd $ROOT;
mkdir "$ROOT/$TMP"
##### COPY MODULE TO TMP DIR ####
cp -R "$ROOT/$MODULE_DIR" "$ROOT/$TMP"


##### RUN STYLEGUIDE GENERATOR_SCRIPT ####
# Run uni-generate-styleguide.js and place in temp dir
echo "Creating styleguide..."
$GENERATOR_SCRIPT -m $ROOT/$MODULE_DIR -o $ROOT/$TMP/$SG_NAME

##### COPY TO OUTPUT DIR AND CLEAN TMP DIR ####
echo "Copying tmp dir to $OUTPUT_DIR"
rm -rf $OUTPUT_DIR # in case exists already
cp -R "$ROOT/$TMP" $OUTPUT_DIR
echo "Cleaning up tmp dir..."
rm -rf $ROOT/$TMP
popd;

echo "All done"
exit 0
