/*jshint multistr: true */
var express = require('express'),
    path = require('path'),
    fs = require('fs'),
    _ = require('underscore'),
    exec = require('child_process').exec,
    spawn = require('child_process').spawn,
    child,
    app = express();

app.configure(function() {
    'use strict';
    app.use(express.logger());
    app.use(express.compress());
    app.use(express.bodyParser());
    app.use(logErrors);
    app.use(clientErrorHandler);
    app.use(errorHandler);
    //app.use('/', express.static(path.join(__dirname, 'public')));
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

function generateOptionsFromRequest(request) {
    var module = request.params.module;
    if (module === 'buttons' && request.query._options) {
        return request.query._options;
    } else if (module === 'grids') {
        // TODO
        // return generateOptionsForGrids(request);
    } else if (module === 'another_cool_module_we_introduce') {
        // TODO
    }
    // TODO: Throw a 404 if none of these match
}

// Custom middleware to create our _options.scss partial. Must go before compass middleware!
function createOptionsMiddleware(request, response, next) {
    var module = request.params.module;
    // Essentially parses query params into an _options.scss string
    var optionsScss = generateOptionsFromRequest(request);
    var dest = path.resolve('.', module + '/scss/partials/_options.scss');
    fs.writeFile(dest, optionsScss, function(err) {
        if(err) {
            console.log(err);
            next(new Error('Issue writing file'));
        }
        request.optionsScss = optionsScss;
        // Since compass middleware is next in "chain", it will compile our scss
        console.log('In createOptionsMiddleware ... before calling next()');
        next();
    });
}

function compassCompileMiddleware(request, response, next) {
    console.log('In compassCompileMiddleware...');
    var module = request.params.module;
    var sassDir = path.join(__dirname, module+'/scss');
    var cssDir = path.join(__dirname, module+'/css');
    var outputStyle = 'nested';
    var options = ' --sass-dir '+sassDir+' --css-dir '+cssDir+' --force --output-style '+outputStyle;
    var cmd = 'compass compile' + options;

    child = exec(cmd, function (err, stdout, stderr) {
        var cssPath = path.resolve('.', module+'/css/buttons.css');
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

// Custom middleware to control ordering; we need to ensure that the _options.scss
// partial is written out BEFORE the compass middleware does compilation.
var mw = [createOptionsMiddleware, compassCompileMiddleware];

// We use some custom "route-specific middleware" here. See http://www.screenr.com/elL
app.get('/build/:module', mw, function(request, response) {
    var module = request.params.module;
    console.log('GOT IN /build/'+module+' route...');
    var json = {};
    json[module] = request[module].css;
    json.optionsScss = request.optionsScss;
    response.jsonp(json);
});

app.get('/download/:module', mw, function(request, response) {
    'use strict';
    var module = request.params.module;
    console.log('GOT IN /download/'+module+' route...');
    // Note that the second - option is to redirect to stdout
    var moduleDir = module+'/';
    var zip = spawn('zip', ['-r', '-', moduleDir]);
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
            response.end();
        } else {
            response.end();
        }
    });
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
    'use strict';
    console.log('Listening on '+ port);
});

