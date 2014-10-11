/**
* Buttons Builder
*/

var path = require('path'),
    fs = require('fs-extra'),
    _ = require('underscore');

///////////////////////////////////
// Our main `build` method ////////
///////////////////////////////////

function buildButtons(request, module, next) {
    var fonts = _generateFontsFromRequest(request);
    var colors = _generateColorsFromRequest(request);
    var types = request.query.types;

    //Must have all of these or we kick in our error middleware
    if ( !types || _.isEmpty(types) || !fonts || _.isEmpty(fonts) || !colors || _.isEmpty(colors) || !module || _.isEmpty(module)) {
        return next(new Error('types, fonts, colors, module must be provided'));
    }

    //First we have to update the buttons.scss file with types requested
    _updateButtons(request, module, types, function() {

        //Next we update the options partial
        _updateOptions(request, module, types, fonts, colors, next);
    });
}

function _updateButtons(request, module, types, fn) {
    console.log("_updateButtons entered...");

    //Read in buttons file
    var buttonsFile = path.resolve(__dirname + path.sep + '..' + path.sep + '..' + path.sep + module + '/scss/buttons.scss');
    var fileString = fs.readFileSync(buttonsFile).toString();

    //Take all available types less the requested types and uncomment those. For example:
    // _.difference(['glow', '3d', 'shapes', 'sizes'], ['shapes', 'sizes'])
    //would result in glow and 3d getting commented out
    var allTypes = ['shapes', 'sizes', 'border', 'borderless', 'raised', '3d', 'glow', 'dropdown', 'groups', 'wrapper'];
    var typesToCommentOut = _.difference(allTypes, types);

    _.each(typesToCommentOut, function(type) {
        var regex  = new RegExp("@import [\'\"]{1}types/"+type+"[\'\"]{1};", 'g');
        fileString = fileString.replace(regex, "// @import 'types/" +type+ "';");
    });

    fs.writeFileSync(buttonsFile, fileString);

    fn();
}

function _updateOptions(request, module, types, fonts, colors, next) {
    console.log("_updateOptions entered...");
    var optionsFile = path.resolve(__dirname + path.sep + '..' + path.sep + '..' + path.sep + module + '/scss/_options.scss');

    fs.readFile(optionsFile, 'utf8', function (err, data) {
        if (err) {
            console.log(err);
            return next(new Error('Issue reading in '+optionsFile));
        }

        //Replace options with new values
        _replaceOptions(request, data, types, fonts, colors, function(optionsScss) {

            // Write out our new options
            fs.writeFile(optionsFile, optionsScss, function(err) {
                if(err) {
                    console.log(err);
                    return next(new Error('Issue writing file'));
                }
                // Save our updated _options.scss in request
                request.optionsScss = optionsScss;

                // Since compass middleware is next in "chain", it will compile our scss
                next();
            });
        }, next);
    });
}


function _replaceOptions(request, data, types, fonts, colors, fn, next) {
    console.log("_replaceOptions entered...");

    // Replace font family
    var optionsScss = data.replace(/\$ubtn\-font\-family:.*;/g, fonts);

    // Replace colors
    optionsScss = optionsScss.replace(/\$ubtn\-colors:.*;/g, colors);

    // Replace special cases of quoted / unquoted CSS values
    var i = 0, property,
        unquoted = ['btn-font-color', 'btn-font-size', 'btn-font-weight'],
        quoted = ['btn-namespace'];

    // Replace the rest of the simple unquoted properties
    for (i = 0; i < unquoted.length; i++) {
        property = unquoted[i];
        optionsScss = _replaceSimpleOption(request, property, optionsScss, false);
        if (!optionsScss) {
            // if missing required property we call next middleware and bail out of here
            return next(new Error(property + ' is required'));
        }
    }
    // Replace the rest of the simple quoted properties
    for (i = 0; i < quoted.length; i++) {
        property = quoted[i];
        optionsScss = _replaceSimpleOption(request, property, optionsScss, true);
        if (!optionsScss) {
            // if missing required property we call next middleware and bail out of here
            return next(new Error(property + ' is required'));
        }
    }

    fn(optionsScss);
}



function _generateFontsFromRequest(request) {
    // Generic fonts must be left unquoted so the engine doesn't literally look
    // for something like 'monospace' etc.
    // http://www.w3.org/TR/CSS2/fonts.html#generic-font-families
    // initial and default are reserved for future use
    var genericFontFamilies = ['serif', 'sans-serif', 'cursive', 'fantasy', 'monospace', 'initial', 'default'];

    var module = request.workingDirectory;
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
    str = '$ubtn-font-family: ' + str.substr(0, str.length-2);
    str += ';';
    return str;
}

function _generateColorsFromRequest(request) {
    console.log("_generateColorsFromRequest entered...");
    var buttonsColors = '',
        module = request.workingDirectory;

    var colors = request.query['btn-colors'];
    _.each(colors, function (color) {
        buttonsColors += "('" +color.name+ "' " +color.background+" "+color.color+ ") ";
    });
    buttonsColors += ';';
    buttonsColors = '$ubtn-colors: ' + buttonsColors;
    return buttonsColors;
}

function _replaceSimpleOption(request, property, optionsScss, isQuoted) {
    // Grab the value
    var val = request.query[property];

    // Require all properties to have values, and namespace can't
    // be just a dot '.'
    if (!val || (property === 'btn-namespace' && val === '.')) {
        return false;
    }

    // Convert to $unicorn namespaced property key
    var unicorn = '$u' + property;
    // Safely escape the hyphens for regex preparation
    // Essentially, finds whole line matching rule to semi-colon (escapes $)
    var regex = new RegExp('\\'+unicorn+':.*;', 'g');
    // Replaces appropriate line with new value sent up
    var newval = isQuoted ? unicorn +': "' + val + '";' : unicorn +': ' + val + ';';
    optionsScss = optionsScss.replace(regex, newval);
    return optionsScss;
}

module.exports.build = buildButtons;
