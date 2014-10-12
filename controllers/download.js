var spawn = require('child_process').spawn,
  fs = require('fs'),
  path = require('path'),
  utils = require(path.join(__dirname, '../lib/', 'utils')).utils,
  archiver = require('archiver');

var Modules = {
  'buttons': {
    populateArchive: require(path.join(__dirname, './modules/', 'buttons')).populateArchive
  },
  'grids': {
    populateArchive: require(path.join(__dirname, './modules/', 'grids')).populateArchive
  }
}




function downloadModule(request, response) {
  'use strict';
  var moduleDirectory = request.workingDirectory;
  moduleDirectory = moduleDirectory.replace(/\/$/, '') + path.sep;
  var moduleName = request.params.module;
  console.log('Route: /download/' + moduleDirectory + ' --- moduleName: ' + moduleName);

  // Create archiver, pipe to the response stream and append read streams to archiver
  var dir = path.join(__dirname, '..', moduleDirectory);
  var archive = archiver('zip');

  //Setting content-type explicitly fixes IE issue where there's no .zip extension
  response.contentType('application/zip');

  archive.pipe(response);


  /////////////////////////////////////////////////////////////////////////////
  // POINT TO MODULE'S POPULATE ARCHIVE METHOD ////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////
  var populateArchive = Modules[moduleName] ? Modules[moduleName].populateArchive : null;
  if (populateArchive) {
    archive = populateArchive.call(this, dir, archive);
  } else {
    next(new Error('No populateArchive method for Module: ' + moduleName));
  }



  archive.on('error', function(err) {
    console.log('archive error callback: ' + err);
    response.status(500);
    response.render('error', {
      error: err
    });
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
      response.render('error', {
        error: err
      });
    }
    // console.log(bytes + ' total bytes');
  });
}

module.exports.downloadModule = downloadModule;
