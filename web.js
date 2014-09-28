/*jshint multistr: true */
var express = require('express'),
    path = require('path'),
    fs = require('fs-extra'),
    _ = require('underscore'),
    exec = require('child_process').exec,
    spawn = require('child_process').spawn,
    child,
    app = express(),
    styleguide = require('./lib/styleguide').styleguide,
    compassCompileMiddleware = require('./lib/compiler').compassCompileMiddleware,
    createOptionsMiddleware = require('./lib/options').createOptionsMiddleware,
    createSandbox = require('./lib/safe.js').createSandbox;

app.configure(function() {
    'use strict';
    app.use(express.logger());
    app.use(express.compress());
    app.use(express.bodyParser());

});
// app.configure('development', function(){})
// app.configure('production', function(){})
app.enable('jsonp callback');


// Custom middleware - ensure that the _options.scss partial is written out
// BEFORE the compass middleware does compilation.
var customMiddleware = [
        //Ordering here is top to bottom
        createSandbox,//copy module dir over since we mutate ... safety first :)
        createOptionsMiddleware,
        compassCompileMiddleware
    ];

//////////////////////////////////////////////////////////
///////////////////////// ROUTES /////////////////////////
//////////////////////////////////////////////////////////
var buildModule = require('./controllers/build').buildModule;
app.get('/build/:module', customMiddleware, buildModule);

var downloadModule = require('./controllers/download').downloadModule;
app.get('/download/:module', customMiddleware, downloadModule);

var port = process.env.PORT || 5000;
app.listen(port, function() {
    'use strict';
    console.log('Listening on '+ port);
});


//////////////////////////////////////////////////////////
//////////////////// ERROR MIDDLEWARE ////////////////////
//////////////////////////////////////////////////////////
function logErrors(err, req, res, next) {
    console.error(err.stack);
    next(err);
}
function errorHandler(err, req, res, next) {
    //We purposely use status 200 since using jsonp and let client handle
    res.jsonp(200, {error: true, message: err.message || 'Server Error'});
}
// Add middleware (note this must be added > routes)
app.use(logErrors);
app.use(errorHandler);
