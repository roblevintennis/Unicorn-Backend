/**
 * Buttons Builder
 */
var path = require('path'),
  fs = require('fs-extra'),
  _ = require('underscore'),
  _replaceQuotedProperties   = require('./mixin')._replaceQuotedProperties,
  _replaceUnQuotedProperties = require('./mixin')._replaceUnQuotedProperties,
  _generateFontsFromRequest = require('./mixin')._generateFontsFromRequest;

///////////////////////////////////
// Our main `build` method ////////
///////////////////////////////////

function buildButtons(request, moduleDirectory, next) {
  //Replace fonts
  var requestedFonts = request.query['btn-font-family'];
  var fonts = _generateFontsFromRequest(request, requestedFonts, '$ubtn-font-family: ');

  //Replace colors
  var colors = _generateColorsFromRequest(request);

  var types = request.query.types;

  //Must have all of these or we kick in our error middleware
  if (!types || _.isEmpty(types) || !fonts || _.isEmpty(fonts) || !colors || _.isEmpty(colors) || !moduleDirectory || _.isEmpty(moduleDirectory)) {
    return next(new Error('types, fonts, colors, moduleDirectory must be provided'));
  }

  //First we have to update the buttons.scss file with types requested
  _updateButtons(request, moduleDirectory, types, function() {

    //Next we update the options partial
    _updateOptions(request, moduleDirectory, types, fonts, colors, next);
  });
}

function _updateButtons(request, moduleDirectory, types, fn) {
  console.log("_updateButtons entered...");

  //Read in buttons file
  var buttonsFile = path.resolve(__dirname + path.sep + '..' + path.sep + '..' + path.sep + moduleDirectory + '/scss/buttons.scss');
  var fileString = fs.readFileSync(buttonsFile).toString();

  //Take all available types less the requested types and uncomment those. For example:
  // _.difference(['glow', '3d', 'shapes', 'sizes'], ['shapes', 'sizes'])
  //would result in glow and 3d getting commented out
  var allTypes = ['shapes', 'sizes', 'border', 'borderless', 'raised', '3d', 'glow', 'dropdown', 'groups', 'wrapper'];
  var typesToCommentOut = _.difference(allTypes, types);

  _.each(typesToCommentOut, function(type) {
    var regex = new RegExp("@import [\'\"]{1}types/" + type + "[\'\"]{1};", 'g');
    fileString = fileString.replace(regex, "// @import 'types/" + type + "';");
  });

  fs.writeFileSync(buttonsFile, fileString);

  fn();
}

function _updateOptions(request, moduleDirectory, types, fonts, colors, next) {
  console.log("_updateOptions entered...");
  var optionsFile = path.resolve(__dirname + path.sep + '..' + path.sep + '..' + path.sep + moduleDirectory + '/scss/_options.scss');

  fs.readFile(optionsFile, 'utf8', function(err, data) {
    if (err) {
      console.log(err);
      return next(new Error('Issue reading in ' + optionsFile));
    }

    //Replace options with new values
    _replaceOptions(request, data, types, fonts, colors, function(optionsScss) {

      // Write out our new options
      fs.writeFile(optionsFile, optionsScss, function(err) {
        if (err) {
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

  // Replace quoted/unquoted CSS values
  var unquoted = ['btn-font-color', 'btn-font-size', 'btn-font-weight'];
  var quoted = ['btn-namespace'];
  _replaceQuotedProperties(request, next, optionsScss, quoted);
  _replaceUnQuotedProperties(request, next, optionsScss, unquoted);

  fn(optionsScss);
}

function _generateColorsFromRequest(request) {
  console.log("_generateColorsFromRequest entered...");
  var buttonsColors = '',
    module = request.workingDirectory;

  var colors = request.query['btn-colors'];
  _.each(colors, function(color) {
    buttonsColors += "('" + color.name + "' " + color.background + " " + color.color + ") ";
  });
  buttonsColors += ';';
  buttonsColors = '$ubtn-colors: ' + buttonsColors;
  return buttonsColors;
}

module.exports.build = buildButtons;
