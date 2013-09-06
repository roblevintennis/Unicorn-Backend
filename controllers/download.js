var spawn = require('child_process').spawn,
    path = require('path'),
    styleguide = require(path.join(__dirname, '../lib/styleguide')).styleguide,
    restoreOptions = require(path.join(__dirname, '../lib/options')).restoreOptions;

function downloadModule(request, response) {
    'use strict';
    var module = request.params.module;
    console.log('GOT IN /download/'+module+' route...');

    // Only creates a styleguide if build_styleguide flag in request
    styleguide(request, module, function(moduleDir) {

        console.log('Called back from styleguide with: ' + moduleDir);
        // Zip options:
        // single dash ("-") used as file name will write to stdout
        // the -x is shorthand for --exclude
        var opts = ['-r', '-', moduleDir, '-x'];
        // Now push all excluded files
        opts.push(moduleDir + '*.git*');
        opts.push(moduleDir + '.gitignore');
        opts.push(moduleDir + '*.sass-cache*');
        opts.push(moduleDir + 'Buttons-Custom.zip');
        opts.push(moduleDir + 'Gruntfile.js');
        opts.push(moduleDir + 'humans.txt');
        opts.push(moduleDir + '*dist*');
        opts.push(moduleDir + 'package.json');
        opts.push(moduleDir + 'index.html');
        opts.push(moduleDir + 'index.dev.html');
        opts.push(moduleDir + 'README.md');

        // Zip moduleDir recursively
        var zip = spawn('zip', opts);
        response.contentType('zip');
        // Keep writing stdout to response
        zip.stdout.on('data', function (data) {
            response.write(data);
        });
        // zip.stderr.on('data', function (data) {
        //     console.log('zip stderr: ' + data);
        // });

        // Once we're done zipping, respond
        zip.on('exit', function (code) {
            if(code !== 0) {
                response.statusCode = 200;
                console.log('zip process exited with code ' + code);
                restoreOptions(request, module);
                response.end();
            } else {
                restoreOptions(request, module);
                response.end();
            }
        });
    });
}

module.exports.downloadModule = downloadModule;
