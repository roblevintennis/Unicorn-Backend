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
        fn(new Error('safetyFirst: no module provided'));
    }
    // This will be our new working directory with module copied over
    var outputDirectory = module+'-'+utils.datestamp(new Date());
    // Use our unicorn-utils script to do a copy only
    var cmd = 'scripts/unicorn-utils.sh';
    cmd += ' --copy-only --module-dir ' + module + '/ --output-dir ' + outputDirectory;

    // Execute the shell script
    exec(cmd, function (err, stdout, stderr) {
        if (err) {
            console.log(err);
            next(new Error('Issue copying directory in safetyFirst'));
        } else {
            console.log('safetyFirst: copied directory successfully to: '+outputDirectory);
            request.workingDirectory = outputDirectory + path.sep;
            next();
        }
    });
}
module.exports.safetyFirst = safetyFirst;
