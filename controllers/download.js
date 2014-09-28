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

        //Setting content-type explicitly fixes IE issue where there's no .zip extension
        response.contentType('application/zip');

        archive.pipe(response);

        var dir =  path.join(__dirname, '..', moduleDir);
        var css =  path.join(dir, '/css/buttons.css');
        var jsButtons =  path.join(dir, '/js/buttons.js');
        var scss = path.join(dir, '/scss/');
        var types = path.join(scss, 'types/');

        console.log("About to start archiving...");
        archive
          //BASE FILE STREAMS
          .append(fs.createReadStream(dir + 'config.rb'), { name: 'config.rb' })
          .append(fs.createReadStream(css), { name: 'css/buttons.css' })
          .append(fs.createReadStream(jsButtons), { name: 'js/buttons.js' })
          .append(fs.createReadStream(scss + '_base.scss'), { name: 'scss/_base.scss' })
          .append(fs.createReadStream(scss + '_layout.scss'), { name: 'scss/_layout.scss' })
          .append(fs.createReadStream(scss + '_mixins.scss'), { name: 'scss/_mixins.scss' })
          .append(fs.createReadStream(scss + '_options.scss'), { name: 'scss/_options.scss' })
          .append(fs.createReadStream(scss + 'buttons.scss'), { name: 'scss/buttons.scss' })

          //TYPES STREAMS
          .append(fs.createReadStream(types+ '_3d.scss'), { name: 'scss/types/_3d.scss' })
          .append(fs.createReadStream(types+ '_border.scss'), { name: 'scss/types/_border.scss' })
          .append(fs.createReadStream(types+ '_borderless.scss'), { name: 'scss/types/_borderless.scss' })
          .append(fs.createReadStream(types+ '_dropdown.scss'), { name: 'scss/types/_dropdown.scss' })
          .append(fs.createReadStream(types+ '_glow.scss'), { name: 'scss/types/_glow.scss' })
          .append(fs.createReadStream(types+ '_groups.scss'), { name: 'scss/types/_groups.scss' })
          .append(fs.createReadStream(types+ '_raised.scss'), { name: 'scss/types/_raised.scss' })
          .append(fs.createReadStream(types+ '_shapes.scss'), { name: 'scss/types/_shapes.scss' })
          .append(fs.createReadStream(types+ '_sizes.scss'), { name: 'scss/types/_sizes.scss' })
          .append(fs.createReadStream(types+ '_wrapper.scss'), { name: 'scss/types/_wrapper.scss' });

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
