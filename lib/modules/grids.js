/**
 * Grids Builder
 */
var path = require('path'),
  fs = require('fs-extra'),
  _ = require('underscore'),
  _replaceQuotedProperties   = require('./mixin')._replaceQuotedProperties,
  _replaceUnQuotedProperties = require('./mixin')._replaceUnQuotedProperties,
  _updateOptions = require('./mixin')._updateOptions;

function buildGrids(request, moduleDirectory, next) {
///////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////
// TODO: WE SHOULD OFFER OPTION TO TOGGLE ONLY FLUID OR FIXED GRID ////////
///////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////
  _updateOptions(request, moduleDirectory, _replaceOptions, next);
}

function _replaceOptions(request, data, fn, next) {
  console.log("_replaceOptions (grids) entered...");
  var optionsScss = data;
  var unquoted = ['grid-num-columns', 'grid-fixed-grid-size', 'grid-fixed-margin', 'grid-small-breakpoint', 'grid-tablet-breakpoint'];
  var quoted = ['grid-responsive'];

  ////////////////////////////////////////////////////////////////////
  // TODO: This needs to be first changed in Grids module to $u and //
  // we won't have to do this anymore!                              //
  ////////////////////////////////////////////////////////////////////
  var gridPrefix = '$unicorn-';


  optionsScss = _replaceQuotedProperties(request, next, optionsScss, quoted, gridPrefix);
  optionsScss = _replaceUnQuotedProperties(request, next, optionsScss, unquoted, gridPrefix);
  fn(optionsScss);
}

module.exports.build = buildGrids;
