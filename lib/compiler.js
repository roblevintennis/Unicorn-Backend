var path = require('path'),
    fs = require('fs-extra'),
    utils = require(path.join(__dirname, '../lib/', 'utils')).utils,
    exec = require('child_process').exec;

function compassCompileMiddleware(request, response, next) {
    console.log('compassCompileMiddleware entered...');
    var module = request.workingDirectory;
    var moduleName = request.params.module;
    var fileType = '.css';
    console.log('module: ' + module);
    console.log('moduleName: ' + moduleName);
    var sassDir = path.join(__dirname, '..', module+'/scss');
    var cssDir = path.join(__dirname, '..', module+'/css');
    var outputStyle = 'nested';
    var options = ' --sass-dir '+sassDir+' --css-dir '+cssDir+' --force --output-style '+outputStyle;
    var cmd = 'compass compile' + options;

    // console.log("Compass compile: " + cmd);
    exec(cmd, function (err, stdout, stderr) {
        console.log("compilation completed...reading back CSS next");
        var cssPath = path.resolve(cssDir+path.sep+moduleName+fileType);
        console.log('cssPath: ' + cssPath);
        if (err) {
            console.log(err);
            utils.cleanup(request, function(err) {
                console.error("Issue cleaning up after compass compile error (1)");
            });
            next(new Error('Issue compass compiling '+module+'.css'));
        } else {
            console.log('looks like compass compile worked...reading back '+module+moduleName+'.css...');
            fs.readFile(cssPath, 'utf8', function (err, data) {
                if (err) {
                    console.log(err);
                    utils.cleanup(request, function(err) {
                        console.error("Issue cleaning up after compass compile error (2)");
                    });
                    next(new Error('Issue reading back '+module+moduleName+'.css'));
                }
                console.log("*************************************");
                console.log("*************************************");
                console.log("CSS read (after compilation): " + data);
                console.log("*************************************");
                console.log("*************************************");
                request[moduleName] = {css: data};
                next();
            });
        }
    });
}

module.exports.compassCompileMiddleware = compassCompileMiddleware;
