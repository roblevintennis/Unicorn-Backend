/*jshint multistr: true */
var path = require('path'),
    fs = require('fs'),
    _ = require('underscore');

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
function replaceSimpleOption(request, property, optionsScss, isQuoted) {
    // Grab the value
    var val = request.query[property];
    // Convert to $uni namespaced property key
    var uni = '$uni-' + property;
    // Safely escape the hyphens for regex preparation
    // Essentially, finds whole line matching rule to semi-colon (escapes $)
    var regex = new RegExp('\\'+uni+':.*;', 'g');
    // Replaces appropriate line with new value sent up
    var newval = isQuoted ? uni +': "' + val + '";' : uni +': ' + val + ';';
    optionsScss = optionsScss.replace(regex, newval);
    return optionsScss;
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

    var dest = path.resolve(__dirname + path.sep + '..' + path.sep + module + '/scss/partials/_options.scss');
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
            optionsScss = replaceSimpleOption(request, property, optionsScss, false);
        });
        _.each(['btn-namespace', 'btn-glow-namespace'], function(property) {
            optionsScss = replaceSimpleOption(request, property, optionsScss, true);
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

// Write back our original _options.scss
function restoreOptions(request, module) {
    console.log("restoreOptions entered...");
    var dest = path.resolve(__dirname + path.sep + '..' + path.sep + module + '/scss/partials/_options.scss');
    console.log('restoreOptions: writing back original '+dest);
    fs.writeFile(dest, request.originalOptionsScss, function(err) {
        if(err) {
            console.log(err);
            return (new Error('Issue writing '+dest));
        }
        console.log('compassCompileMiddleware: '+dest+' written.');
    });
}

module.exports.createOptionsMiddleware = createOptionsMiddleware;
module.exports.restoreOptions = restoreOptions;
