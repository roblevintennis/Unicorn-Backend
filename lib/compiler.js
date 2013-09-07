var path = require('path'),
    fs = require('fs-extra'),
    exec = require('child_process').exec;

function compassCompileMiddleware(request, response, next) {
    console.log('compassCompileMiddleware entered...');
    var module = request.workingDirectory;
    var sassDir = path.join(__dirname, '..', module+'/scss');
    var cssDir = path.join(__dirname, '..', module+'/css');
    var outputStyle = 'nested';
    var options = ' --sass-dir '+sassDir+' --css-dir '+cssDir+' --force --output-style '+outputStyle;
    var cmd = 'compass compile' + options;

    exec(cmd, function (err, stdout, stderr) {
        var cssPath = path.resolve(__dirname + path.sep + '..' + path.sep + module+'/css/buttons.css');
        console.log('cssPath: ' + cssPath);
        if (err) {
            console.log(err);
            next(new Error('Issue compass compiling '+module+'.css'));
        } else {
            console.log('looks like compass compile worked...reading back '+module+'.css...');
            fs.readFile(cssPath, 'utf8', function (err, data) {
                if (err) {
                    console.log(err);
                    next(new Error('Issue reading back '+module+'.css'));
                }
                request[module] = {css: data};
                next();
            });
        }
    });
}

module.exports.compassCompileMiddleware = compassCompileMiddleware;
