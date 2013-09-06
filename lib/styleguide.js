var express = require('express'),
    path = require('path'),
    exec = require('child_process').exec,
    app = express();

/**
 * Creates a styleguide sub-directory inside our module. Note that it will
 * place the combined module and styleguide in to ./generated directory.
 */
function styleguide(request, module, fn) {
    console.log("styleguide entered...");
    // Remove any trailing forward slash as in buttons/
    module = module ? module.replace(/\/$/, '') : null;
    // console.log("styleguide: module - " + module);
    if (!module) {
        fn(new Error('styleguide: no module provided'));
    }

    // If request has a build_styleguide param that's truthy
    var isStyleguide = request.query.build_styleguide ? request.query.build_styleguide : false;

    console.log("styleguide: isStyleguide - " + isStyleguide);
    if (isStyleguide) {
        // We'll put our generated module/styleguide stuff in `generated` dir
        var generatedDir = 'generated';
        var cmd = 'scripts/combine_buttons_and_styleguide.sh';
        // Note that the forward slash after module is important! Ensures the
        // contents of module/ are copied (not the directory as a whole)
        cmd += ' --module-dir ' + module + '/ --output-dir ' + generatedDir;
        exec(cmd, function (err, stdout, stderr) {
            if (err) {
                console.log(err);
                fn(new Error('Issue generating styleguide'));
            } else {
                console.log('Styleguide generated');
                fn(generatedDir + path.sep);
            }
        });
    } else {
        // HTTP request did not contain truthy build_styleguide param so
        // return original moduleDir
        // console.log('styleguide: no styleguide requested ... returning: ' + module + path.sep);
        fn(module + path.sep);
    }
}
module.exports.styleguide = styleguide;
