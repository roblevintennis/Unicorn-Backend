/**
 * Buttons Builder
 */
var path = require('path'),
  fs = require('fs-extra'),
  _ = require('underscore'),
  _replaceQuotedProperties   = require('./mixin')._replaceQuotedProperties,
  _replaceUnQuotedProperties = require('./mixin')._replaceUnQuotedProperties,
  _generateFontsFromRequest = require('./mixin')._generateFontsFromRequest,
  _generateListFromRequest = require('./mixin')._generateListFromRequest,
  _updateOptions = require('./mixin')._updateOptions,
  _updateIncludedTypes = require('./mixin')._updateIncludedTypes;


/**************************************\
* Our main `build` method which:
* 1. Comments out types not requested
* 2. Updates our options.scss
***************************************/

function buildButtons(request, moduleDirectory, next) {
  //We comment out everything but the requested button types
  var requestedTypes = request.query.types;
  if (!requestedTypes || _.isEmpty(requestedTypes)) {
    return next(new Error('requestedTypes must be provided'));
  }

  //Pass in both "all types" and "requested types"
  var allTypes = ['shapes', 'sizes', 'border', 'borderless', 'raised', '3d', 'glow', 'dropdown', 'groups', 'wrapper'];
  _updateIncludedTypes(request, moduleDirectory, allTypes, requestedTypes, function() {

    //Next we update the options partial
    _updateOptions(request, moduleDirectory, _replaceOptions, next);
  });
}

/**
* This is our Button module's "meatiest" callback that replaces our options.scss
*/

function _replaceOptions(request, data, fn, next) {
  console.log("_replaceOptions entered...");

  //Replace fonts
  var requestedFonts = request.query['btn-font-family'];
  var fonts = _generateFontsFromRequest(request, requestedFonts, '$ubtn-font-family: ');
  var optionsScss = data.replace(/\$ubtn\-font\-family:.*;/g, fonts);

  //Replace colors
  var colorsList = request.query['btn-colors'];
  var colorListKeys = [
    {name:'name', quoted: true},
    {name:'background', quoted: false},
    {name:'color', quoted: false}
  ];
  var colors = _generateListFromRequest(request, colorsList, colorListKeys, '$ubtn-colors: ');
  optionsScss = optionsScss.replace(/\$ubtn\-colors:.*;/g, colors);

  if (!fonts || _.isEmpty(fonts) || !colors || _.isEmpty(colors)) {
    return next(new Error('fonts and colors must be provided'));
  }

  // Replace the rest of our quoted and unquoted sass key/values
  var unquoted = ['btn-font-color', 'btn-font-size', 'btn-font-weight'];
  var quoted = ['btn-namespace'];
  optionsScss = _replaceQuotedProperties(request, next, optionsScss, quoted);
  optionsScss = _replaceUnQuotedProperties(request, next, optionsScss, unquoted);

  fn(optionsScss);
}

module.exports.build = buildButtons;
