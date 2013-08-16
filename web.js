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

function generateOptionsFromRequest(request) {

console.log("QUERY: ");
console.dir(request.query);

/*
$namespace: '.button'; //prefix for all classes
$glow_namespace: '.glow';
$glow_color: #2c9adb;
$bgcolor: #EEE;
$height: 32px;
$font-color: #666;
$font-size: 14px;
$font-weight: 300;
$font-family: "HelveticaNeue-Light", "Helvetica Neue Light", "Helvetica Neue", Helvetica, Arial, "Lucida Grande", sans-serif;
$button_actions: ('primary' #00A1CB #FFF) ('action' #7db500 #FFF) ('highlight' #F18D05 #FFF)('caution' #E54028 #FFF) ('royal' #87318C #FFF);
$button_styles: 'rounded' 'pill' 'circle';
$button_sizes: 'large' 'small' 'tiny';
$circle-size: 120px; //radius for circle buttons, circles only have one size
$dropdown-background: #fcfcfc;
$dropdown-link-color: #333;
$dropdown-link-hover: #FFF;
$dropdown-link-hover-background: #3c6ab9;
*/
    var css = [];
    // Overly optimistic assumption that all properties are sent.
    // But since we use backbone defaults we should be good but
    // we fallback anyway :)
    var namespace = request.query['$namespace'] || 'button';
    var glowNamespace = request.query['$glow_namespace'] || '.glow';
    var glowColor = request.query['$glow_color'] || '#2c9adb';
    var bgColor = request.query['$bgcolor'] || '#eee';
    var height = request.query['$height'] || '32px';
    var circleSize = request.query['$circle-size'] || '120px';
    var fontColor = request.query['$font-color'] || '#666';
    var fontSize = request.query['$font-size'] || '14px';
    var fontWeight = request.query['$font-weight'] || 300;
    fontWeight = parseInt(fontWeight, 10);
    var fontFamily = request.query['$font-family'] || '"HelveticaNeue-Light", "Helvetica Neue Light", "Helvetica Neue", Helvetica, Arial, "Lucida Grande", sans-serif';
    var dropdownBackground = request.query['$dropdown-background'] || '#fcfcfc';
    var dropdownLinkColor = request.query['$dropdown-link-color'] || '#333';
    var dropdownLinkHover = request.query['$dropdown-link-hover'] || '#fff';
    var dropdownLinkHoverBackground = request.query['$dropdown-link-hover-background'] || '#3c6ab9';

    // $button_actions: ('primary' #00A1CB #FFF) ('action' #7db500 #FFF) ('highlight' #F18D05 #FFF)('caution' #E54028 #FFF) ('royal' #87318C #FFF);
    var buttonActions = '';
    var reqButtonActions = request.query['$button_actions'];
    if (reqButtonActions) {
        Object.keys(reqButtonActions).forEach(function(key) {
            var val = reqButtonActions[key];
            buttonActions += "('" + key + "' " + val + ") ";
        });
        buttonActions += ';';
    } else {
        // Fallback
        buttonActions = " ('primary' #00A1CB #FFF) ('action' #7db500 #FFF) ('highlight' #F18D05 #FFF)('caution' #E54028 #FFF) ('royal' #87318C #FFF);";
    }
    css.push('$button_actions: ', buttonActions);

    var buttonStyles = '';
    var reqButtonStyles = request.query['$button_styles'];
    if (reqButtonStyles) {
        reqButtonStyles.forEach(function(item) {
            buttonStyles += "'" + item + "' ";
        });
        buttonStyles += ';';
    } else {
        // Fallback
        buttonStyles = " 'rounded' 'pill' 'circle';";
    }
    css.push('$button_styles: ', buttonStyles);

    var buttonSizes = '';
    var reqButtonSizes = request.query['$button_sizes'];
    if (reqButtonSizes) {
        reqButtonSizes.forEach(function(item) {
            buttonSizes += "'" + item + "' ";
        });
        buttonSizes += ';';
    } else {
        // Fallback
        buttonSizes = " 'large' 'small' 'tiny';";
    }
    css.push('$button_sizes: ', buttonSizes);

    css.push('$namespace: "' + namespace + '";')
    css.push('$glow_namespace: "' + glowNamespace + '";');
    css.push('$glow_color: ' + glowColor + ';');
    css.push('$bgcolor: ' + bgColor + ';');
    css.push('$height: ' + height + ';');
    css.push('$circle-size: ' + circleSize+ ';');
    css.push('$font-color: ' + fontColor + ';');
    css.push('$font-size: ' + fontSize + ';');
    css.push('$font-weight: ' + fontWeight + ';');
    css.push("$font-family: '" + fontFamily + "';");
    css.push('$dropdown-background: ' + dropdownBackground + ';');
    css.push('$dropdown-link-color: ' + dropdownLinkColor + ';');
    css.push('$dropdown-link-hover: ' + dropdownLinkHover + ';');
    css.push('$dropdown-link-hover-background: ' + dropdownLinkHoverBackground + ';');
    return css.join('\n');
}

// Custom middleware to create our _options.scss partial. Must go before compass middleware!
function createOptionsMiddleware(request, response, next) {
    'use strict';
    // console.log("Dumping request.query...");
    // console.dir(request.query);
    if (!request.query['$button_actions']) {
        next(new Error('Server no comprende...probably missing required http param'));
    }
    // Essentially parses query params into an _options.scss string
    var optionsCss = generateOptionsFromRequest(request);
    // TODO: Make this flexible for any module e.g. grids, buttons, etc.
    // should all use the same code
    var cssObj = {
        css: optionsCss
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

