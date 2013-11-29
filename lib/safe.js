var path = require('path'),
    exec = require('child_process').exec,
    utils = require(path.join(__dirname, 'utils')).utils;

/**
 * Just copies our module directory over for safety since we mutate options partial etc.
 */
function safetyFirst(request, response, next) {
    console.log("safetyFirst entered...");
    var module = request.params.module;
    // Remove any trailing forward slash as in buttons/
    module = module ? module.replace(/\/$/, '') : null;
    if (!module) {
        next(new Error('safetyFirst: no module provided'));
    }
    // This will be our new relative working directory where module is copied over to
    var relativeOutputDir = module+'-'+utils.datestamp(new Date());
    // Use our unicorn-utils script to do a "copy only"
    var cmd = 'scripts/unicorn-utils.sh';
    cmd += ' --copy-only --module-dir ' + module + '/ --output-dir ' + relativeOutputDir;

    // Execute the shell script
    exec(cmd, function (err, stdout, stderr) {
        if (err) {
            console.log(err);
            next(new Error('Issue copying directory in safetyFirst'));
        } else {
            console.log('safetyFirst: copied directory successfully to: '+relativeOutputDir);
            request.workingDirectory = relativeOutputDir + path.sep;


///// DEBUGGING with a listing of directory:
// exec('ls -al',function(err,stdout,stderr){
            console.log("DEBUGGING-ls of: " + relativeOutputDir + " next...");

            exec('ls -hal ' + relativeOutputDir, function(err, stdout, stderr) {
                console.log("Directory listing stdout: ");
                console.log('stdout: ' + stdout);
                console.log('stderr: ' + stderr);
                if (err !== null) {
                  console.log('exec err: ' + err);
                }
                next();
            });
        }
    });
}
module.exports.safetyFirst = safetyFirst;
