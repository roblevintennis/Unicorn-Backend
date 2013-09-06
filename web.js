/*jshint multistr: true */
var express = require('express'),
    path = require('path'),
    fs = require('fs'),
    _ = require('underscore'),
    exec = require('child_process').exec,
    spawn = require('child_process').spawn,
    child,
    app = express(),
    styleguide = require('./lib/styleguide').styleguide,
    compassCompileMiddleware = require('./lib/compiler').compassCompileMiddleware,
    createOptionsMiddleware = require('./lib/options').createOptionsMiddleware,
    restoreOptions = require('./lib/options').restoreOptions;

app.configure(function() {
    'use strict';
    app.use(express.logger());
    app.use(express.compress());
    app.use(express.bodyParser());
    app.use(logErrors);
    app.use(clientErrorHandler);
    app.use(errorHandler);
});
// app.configure('development', function(){})
// app.configure('production', function(){})
app.enable('jsonp callback');

//TODO: These are from docs ... rework later
function logErrors(err, req, res, next) {
    console.error(err.stack);
    next(err);
}
function clientErrorHandler(err, req, res, next) {
    if (req.xhr) {
        res.send(500, { error: 'Something blew up!' });
    } else {
        next(err);
    }
}
function errorHandler(err, req, res, next) {
    res.status(500);
    res.render('error', { error: err });
}

// Custom middleware - ensure that the _options.scss partial is written out
// BEFORE the compass middleware does compilation.
var customMiddleware = [
        //Ordering here is top to bottom
        createOptionsMiddleware,
        compassCompileMiddleware
    ];

// **** ROUTES **** //
var buildModule = require('./controllers/build').buildModule;
app.get('/build/:module', customMiddleware, buildModule);

var downloadModule = require('./controllers/download').downloadModule;
app.get('/download/:module', customMiddleware, downloadModule);

var port = process.env.PORT || 5000;
app.listen(port, function() {
    'use strict';
    console.log('Listening on '+ port);
});

