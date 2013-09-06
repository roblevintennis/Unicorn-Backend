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

function generateTypesFromRequest(request) {
    var module = request.params.module;
    if (module === 'buttons' && request.query.types) {
        // Create a valid $uni-btn-types entry
        var types = '$uni-btn-types: ' + "'" + request.query.types.join("' '") + "';";
        return types;
    } else if (module === 'grids') {
        // TODO
        // return generateOptionsForGrids(request);
    } else if (module === 'another_cool_module_we_introduce') {
        // TODO
    }
    // TODO: Throw a 404 if none of these match
}

function generateFontsFromRequest(request) {
    // Generic fonts must be left unquoted so the engine doesn't literally look
    // for something like 'monospace' etc.
    // http://www.w3.org/TR/CSS2/fonts.html#generic-font-families
    // initial and default are reserved for future use
    var genericFontFamilies = ['serif', 'sans-serif', 'cursive', 'fantasy', 'monospace', 'initial', 'default'];

    var module = request.params.module;
    if (module === 'buttons' && request.query['btn-font-family']) {
        var fontFams = request.query['btn-font-family'];
        var str = '';
        _.each(fontFams, function(font) {
            // Check if this is a generic font like serif cursive etc...
            if (_.indexOf(genericFontFamilies, font) > -1) {
                // Generic font families must by unquoted
                str += font + ', ';
            } else {
                // Quote all non generic font families
                str += '"' + font + '", ';
            }
        });
        //create full css rule in key: val form
        //also: remove leftover trailing space/comma at end and add semi-colon
        str = '$uni-btn-font-family: ' + str.substr(0, str.length-2);
        str += ';';
        return str;
    } else if (module === 'grids') {//TODO / NOP
    } else {}
    // TODO: Throw a 404 if none of these match
}

function generateActionsFromRequest(request) {
    console.log("generateActionsFromRequest entered...");
    var buttonActions = '',
        module = request.params.module;

    if (module === 'buttons' && request.query['btn-actions']) {
        var actions = request.query['btn-actions'];
        console.log("actions from request query: ", actions);
        _.each(actions, function (action) {
            buttonActions += "('" +action.name+ "' " +action.background+" "+action.color+ ") ";
        });
        buttonActions += ';';
        buttonActions = '$uni-btn-actions: ' + buttonActions;
        console.log("buttonActions built: ", buttonActions);
        return buttonActions;
    } else if (module === 'grids') {//TODO / NOP
    } else {}
    // TODO: Throw a 404 if none of these match
}

// Custom middleware to create our _options.scss partial. Must go before compass middleware!
function createOptionsMiddleware(request, response, next) {
    console.log("createOptionsMiddleware entered...");
    var module = request.params.module;
    var types = generateTypesFromRequest(request);
    var fonts = generateFontsFromRequest(request);
    var actions = generateActionsFromRequest(request);

    // Read in _options.scss file
    console.log("createOptionsMiddleware about to read _options...");
    var dest = path.resolve('.', module + '/scss/partials/_options.scss');
    fs.readFile(dest, 'utf8', function (err, data) {
        if (err) {
            console.log(err);
            next(new Error('Issue reading in '+dest));
        }
        // Save the original _options.scss
        request.originalOptionsScss = data;

        // Replace $uni-btn-types line with our generated types
        var optionsScss = data.replace(/\$uni\-btn\-types:.*;/g, types);

        // Replace font family
        optionsScss = optionsScss.replace(/\$uni\-btn\-font\-family:.*;/g, fonts);

        // Replace actions
        optionsScss = optionsScss.replace(/\$uni\-btn\-actions:.*;/g, actions);

        // Replace the rest of the simple unquoted properties
        _.each(['btn-font-color', 'btn-font-size', 'btn-font-weight'], function(property) {
            // Grab the value
            var val = request.query[property];
            // Convert to $uni namespaced property key
            var uni = '$uni-' + property;
            // Safely escape the hyphens for regex preparation
            // Essentially, finds whole line matching rule to semi-colon (escapes $)
            var regex = new RegExp('\\'+uni+':.*;', 'g');
            // Replaces appropriate line with new value sent up
            optionsScss = optionsScss.replace(regex, uni +': ' + val + ';');
        });

        // Write out our new options
        console.log("createOptionsMiddleware about to write new _options with: " + optionsScss +"\n\n");

        fs.writeFile(dest, optionsScss, function(err) {
            if(err) {
                console.log(err);
                next(new Error('Issue writing file'));
            }
            // Save our updated _options.scss in request
            request.optionsScss = optionsScss;

            // Since compass middleware is next in "chain", it will compile our scss
            console.log('createOptionsMiddleware ... before calling next()');

            next();
        });
    });
}

function compassCompileMiddleware(request, response, next) {
    console.log('compassCompileMiddleware entered...');
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

// Write back our original _options.scss
function restoreOptions(request, module) {
    var dest = path.resolve('.', module + '/scss/partials/_options.scss');
    console.log('restoreOptions: writing back original '+dest);
    fs.writeFile(dest, request.originalOptionsScss, function(err) {
        if(err) {
            console.log(err);
            return (new Error('Issue writing '+dest));
        }
        console.log('compassCompileMiddleware: '+dest+' written.');
    });
}
// Custom middleware to control ordering; we need to ensure that the _options.scss
// partial is written out BEFORE the compass middleware does compilation.
var mw = [createOptionsMiddleware, compassCompileMiddleware];


/**
 * Creates a styleguide sub-directory inside our module. Note that it will
 * place the combined module and styleguide in to ./generated directory.
 */
function styleguide(request, module, fn) {
    // console.log("styleguide entered...");
    // Remove any trailing forward slash as in buttons/
    module = module ? module.replace(/\/$/, '') : null;
    // console.log("styleguide: module - " + module);
    if (!module) {
        fn(new Error('styleguide: no module provided'));
    }

    // If request has a build_styleguide param that's truthy
    var isStyleguide = request.query.build_styleguide ? request.query.build_styleguide : false;

    console.log("styleguide: isStyleguide - " + isStyleguide);
    if (isStyleguide) {
        // We'll put our generated module/styleguide stuff in `generated` dir
        var generatedDir = 'generated';
        var cmd = 'scripts/combine_buttons_and_styleguide.sh';
        // Note that the forward slash after module is important! Ensures the
        // contents of module/ are copied (not the directory as a whole)
        cmd += ' --module-dir ' + module + '/ --output-dir ' + generatedDir;
        exec(cmd, function (err, stdout, stderr) {
            if (err) {
                console.log(err);
                fn(new Error('Issue generating styleguide'));
            } else {
                console.log('Styleguide generated');
                fn(generatedDir + path.sep);
            }
        });
    } else {
        // HTTP request did not contain truthy build_styleguide param so
        // return original moduleDir
        // console.log('styleguide: no styleguide requested ... returning: ' + module + path.sep);
        fn(module + path.sep);
    }
}

// We use some custom "route-specific middleware" here. See http://www.screenr.com/elL
app.get('/build/:module', mw, function(request, response) {
    var module = request.params.module;
    console.log('GOT IN /build/'+module+' route...');
    var json = {};
    json[module] = request[module].css;
    json.optionsScss = request.optionsScss;
    restoreOptions(request, module);
    response.jsonp(json);
});


app.get('/download/:module', mw, function(request, response) {
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
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
    'use strict';
    console.log('Listening on '+ port);
});

