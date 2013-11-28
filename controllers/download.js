var spawn = require('child_process').spawn,
    fs = require('fs'),
    path = require('path'),
    utils = require(path.join(__dirname, '../lib/', 'utils')).utils,
    styleguide = require(path.join(__dirname, '../lib/styleguide')).styleguide,
    archiver = require('archiver');

function downloadModule(request, response) {
    'use strict';
    var module = request.workingDirectory;
    console.log('GOT IN /download/'+module+' route...');

    // Only creates a styleguide if build_styleguide flag in request
    styleguide(request, module, function(moduleDir) {
        // Styleguide might have ammended dirname; so reset workingDirectory
        console.log('Called back from styleguide with: ' + moduleDir);

        // Create archiver, pipe to the response stream and append read streams to archiver
        var archive = archiver('zip');
        archive.pipe(response);

        var dir =  path.join(__dirname, '..', moduleDir);
        var css =  path.join(dir, '/css/buttons.css');
        var scss = path.join(dir, '/scss/');
        var partials = path.join(scss, 'partials/');

        archive
          .append(fs.createReadStream(dir + 'config.rb'), { name: 'config.rb' })
          .append(fs.createReadStream(css), { name: 'css/buttons.css' })
          .append(fs.createReadStream(scss+'buttons.scss'), { name: 'scss/buttons.scss' })
          .append(fs.createReadStream(partials+'_options.scss'), { name: 'scss/partials/_options.scss' })
          .append(fs.createReadStream(partials+'_buttons.scss'), { name: 'scss/partials/_buttons.scss' })
          .append(fs.createReadStream(partials+'_glow.scss'), { name: 'scss/partials/_glow.scss' })
          .append(fs.createReadStream(partials+'_danger.scss'), { name: 'scss/partials/_danger.scss' });

        archive.on('error', function(err) {
            console.log('archive error callback: ' + err);
            response.status(500);
            response.render('error', { error: err });
        });

        response.on('finish', function() {
            console.log('response.finish event fired .. doing cleanup next...');
            utils.cleanup(request, function(err) {
                if (err) {
                    //TODO: Not sure there's a meanginful way for user...
                    //this should at least show up in heroku logs ;)
                    console.error('Issue in utils.cleanup: ' + err);
                }
            });
        });
        archive.finalize(function(err, bytes) {
            if (err) {
                console.log('archive finalize callback error: ' + err);
                response.status(500);
                response.render('error', { error: err });
            }
            // console.log(bytes + ' total bytes');
        });
    });
}

module.exports.downloadModule = downloadModule;
