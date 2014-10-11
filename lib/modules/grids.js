/**
 * Grids Builder
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

function buildGrids(request, moduleDirectory, next) {

  // Replace quoted/unquoted CSS values
  var unquoted = ['grid-num-columns', 'grid-fixed-grid-size', 'grid-fixed-margin', 'grid-small-breakpoint', 'grid-tablet-breakpoint'];
  var quoted = ['grid-responsive'];
  console.log("************************");
  console.log("************************");
var optionsScss = '';
var temptestQuoted = _replaceQuotedProperties(request, optionsScss, quoted);
console.log("temptestQuoted: ", temptestQuoted);
var temptestUnquoted = _replaceUnQuotedProperties(request, optionsScss, unquoted);
console.log("temptestUnQuoted: ", temptestUnquoted);
  console.log("************************");
  console.log("************************");


  // //Must have all of these or we kick in our error middleware
  // if (!types || _.isEmpty(types) || !fonts || _.isEmpty(fonts) || !colors || _.isEmpty(colors) || !moduleDirectory || _.isEmpty(moduleDirectory)) {
  //   return next(new Error('types, fonts, colors, moduleDirectory must be provided'));
  // }

  // //First we have to update the buttons.scss file with types requested
  // _updateButtons(request, moduleDirectory, types, function() {

  //   //Next we update the options partial
  //   _updateOptions(request, moduleDirectory, types, fonts, colors, next);
  // });



  request.optionsScss = {
    'grids-bgcolor': "#abc"
  }
  next();
}

module.exports.build = buildGrids;
