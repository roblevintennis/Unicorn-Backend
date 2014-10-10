var path = require('path'),
    exec = require('child_process').exec,
    utils = require(path.join(__dirname, 'utils')).utils;

/**
 * Just copies our module directory over for safety since we mutate options partial etc.
 */
function createSandbox(request, response, next) {
    console.log("createSandbox entered...");
    var module = request.params.module;

    // Remove any trailing forward slash as in buttons/
    module = module ? module.replace(/\/$/, '') : null;
    if (!module) {
        next(new Error('createSandbox: no module provided'));
    }

    // This will be our new relative working directory where module is copied over to
    var relativeOutputDir = module.toLowerCase() +'-'+utils.datestamp(new Date());

    // Use our unicorn-utils script to do a "copy only"
    var cmd = 'scripts/unicorn-utils.sh';
    cmd += ' --copy-only --module-dir ' + module + '/ --output-dir ' + relativeOutputDir;

    // Execute the shell script
    exec(cmd, function (err, stdout, stderr) {
        if (err) {
            console.log(err);
            next(new Error('Issue copying directory in createSandbox'));
        } else {
            console.log('createSandbox: copied directory successfully to: '+relativeOutputDir);
            request.workingDirectory = relativeOutputDir + path.sep;
            next();
        }
    });
}
module.exports.createSandbox = createSandbox;
