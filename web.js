/*jshint multistr: true */
var express = require('express'),
    // compass = require('node-compass'),
    path = require('path'),
    fs = require('fs'),
    exec = require('child_process').exec,
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

// TODO: This is just a stub ... move to own file w/real _options.scss boiler plate
function getOptionsBoilerPlate(moreRulesArray) {
    'use strict';
    var multiStr = [
        '//////////////////////////////////////////////////////////',
        '//// BASE DEFAULTS /////////////////////////////////////////',
        '////////////////////////////////////////////////////////////',
        '$namespace: ".button"; //prefix for all classes',
        '$glow_namespace: ".glow";',
        '$glow_color: #2c9adb;',
        '$bgcolor: #EEE;',
        '$height: 32px;'
    ];
    if (moreRulesArray) {
        multiStr = multiStr.concat(moreRulesArray);
    }
    return multiStr.join('\n');
}

// Custom middleware to create our _options.scss partial. Must go before compass middleware!
function createOptionsMiddleware(request, response, next) {
    'use strict';
    if (!request.query.primary_color || !request.query.secondary_color) {
        next(new Error('Server no comprende...probably missing required http param'));
    }
    // Parse out the query params
    var primaryColor = request.query.primary_color;
    var secondaryColor = request.query.secondary_color;
    var dynamicCss = [
        '.foo {color: '+ primaryColor+';}',
        '.bar {color: '+ secondaryColor+';}'
    ];
    // Build an _options.scss partial
    var boilerPlate = getOptionsBoilerPlate(dynamicCss);
    var cssObj = {
        css: boilerPlate
    };
    var dest = path.resolve('.', 'scss/partials/_options.scss');
    fs.writeFile(dest, cssObj.css, function(err) {
        if(err) {
            console.log(err);
            next(new Error('Issue writing file'));
        }
        //TODO: This will go away later when we read back in the generated 
        //buttons.css (generated after the compass middleware step)
        request.cssObj = cssObj;

        // Since compass middleware is next in "chain", it will compile our scss
        console.log("In createOptionsMiddleware ... before calling next()");
        next();
    });
}

function compassCompileMiddleware(request, response, next) {
    'use strict';
    console.log("In compassCompileMiddleware...");
    // Now read back in the generated buttons.css file

    // compass compile options
    var sassDir = path.join(__dirname, 'scss');
    var cssDir = path.join(__dirname, 'css');
    var outputStyle = 'nested';
    var options = ' --sass-dir '+sassDir+' --css-dir '+cssDir+' --force --output-style '+outputStyle;
    var cmd = "compass compile" + options;

    console.log("Before exec'ing compass compile...");
    child = exec(cmd, function (err, stdout, stderr) {
        var cssPath = path.resolve('.', 'css/buttons.css');
        if (err) {
            console.log(err);
            next(new Error("Issue compass compiling buttons.css"));
        } else {
            console.log("looks like compass compile worked...reading back buttons.css...");
            fs.readFile(cssPath, 'utf8', function (err, data) {
                if (err) {
                    console.log(err);
                    next(new Error("Issue reading back buttons.css"));
                }
                console.log("buttons.css read: ", data);
                request.buttonsCss = {css: data};
                next();
            });
        }
    });
}

// Custom middleware to control ordering; we need to ensure that the _options.scss
// partial is written out BEFORE the compass middleware does compilation.
var mw = [createOptionsMiddleware, compassCompileMiddleware];

// We use some custom "route-specific middleware" here. See http://www.screenr.com/elL
app.get('/build', mw, function(request, response) {
    'use strict';
    console.log('GOT IN /build route...');
    // compass middleware should have already compiled our scss at this point
    // next we need to read generated buttons.css in to a string
    // TODO: getButtonsCss();
    //
    // here we'll output something like:
    response.jsonp(request.buttonsCss)
    // response.jsonp(request.cssObj);//TODO:This will go away with above
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
    'use strict';
    console.log('Listening on '+ port);
});

