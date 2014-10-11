/**
 * Grids Builder
 */
var path = require('path'),
  fs = require('fs-extra'),
  _ = require('underscore'),
  _replaceQuotedProperties   = require('./mixin')._replaceQuotedProperties,
  _replaceUnQuotedProperties = require('./mixin')._replaceUnQuotedProperties,
  _generateFontsFromRequest = require('./mixin')._generateFontsFromRequest;

/////////////////
///////////////////////////////////
// Our main `build` method ////////
///////////////////////////////////

function buildGrids(request, module, next) {

  // $unicorn-grid-num-columns: 12 !default;
  // 'grid-num-columns': '24',


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

  // $unicorn-grid-fixed-grid-size: 960px !default;
  // $unicorn-grid-fixed-margin: 10px !default;
  // $unicorn-grid-fluid-gutter: 6 !default;
  // $unicorn-grid-responsive: 'enabled' !default;
  // $unicorn-grid-small-breakpoint: 480px !default;
  // $unicorn-grid-tablet-breakpoint: 900px !defau

  // 'grid-fixed-grid-size': '1234px',
  // 'grid-fixed-margin': '15px',
  // 'grid-responsive': 'enabled',
  // 'grid-small-breakpoint': '567px',
  // 'grid-tablet-breakpoint': '9876px'


  request.optionsScss = {
    'grids-bgcolor': "#abc"
  }
  next();

  // var fonts = _generateFontsFromRequest(request);
  // var colors = _generateColorsFromRequest(request);
  // var types = request.query.types;

  //Must have all of these or we kick in our error middleware
  // if ( !types || _.isEmpty(types) || !fonts || _.isEmpty(fonts) || !colors || _.isEmpty(colors) || !module || _.isEmpty(module)) {
  //     return next(new Error('types, fonts, colors, module must be provided'));
  // }

  //First we have to update the Grids.scss file with types requested
  // _updateGrids(request, module, types, function() {

  //     //Next we update the options partial
  //     _updateOptions(request, module, types, fonts, colors, next);
  // });
}

// function _updateOptions(request, module, types, fonts, colors, next) {
//     console.log("_updateOptions entered...");
//     var optionsFile = path.resolve(__dirname + path.sep + '..' + path.sep + '..' + path.sep + module + '/scss/_options.scss');

//     fs.readFile(optionsFile, 'utf8', function (err, data) {
//         if (err) {
//             console.log(err);
//             return next(new Error('Issue reading in '+optionsFile));
//         }

//         //Replace options with new values
//         _replaceOptions(request, data, types, fonts, colors, function(optionsScss) {

//             // Write out our new options
//             fs.writeFile(optionsFile, optionsScss, function(err) {
//                 if(err) {
//                     console.log(err);
//                     return next(new Error('Issue writing file'));
//                 }
//                 // Save our updated _options.scss in request
//                 request.optionsScss = optionsScss;

//                 // Since compass middleware is next in "chain", it will compile our scss
//                 next();
//             });
//         }, next);
//     });
// }


// function _replaceOptions(request, data, types, fonts, colors, fn, next) {
//     console.log("_replaceOptions entered...");

//     // Replace font family
//     var optionsScss = data.replace(/\$ubtn\-font\-family:.*;/g, fonts);

//     // Replace colors
//     optionsScss = optionsScss.replace(/\$ubtn\-colors:.*;/g, colors);

//     // Replace special cases of quoted / unquoted CSS values
//     var i = 0, property,
//         unquoted = ['btn-font-color', 'btn-font-size', 'btn-font-weight'],
//         quoted = ['btn-namespace'];

//     // Replace the rest of the simple unquoted properties
//     for (i = 0; i < unquoted.length; i++) {
//         property = unquoted[i];
//         optionsScss = _replaceSimpleOption(request, property, optionsScss, false);
//         if (!optionsScss) {
//             // if missing required property we call next middleware and bail out of here
//             return next(new Error(property + ' is required'));
//         }
//     }
//     // Replace the rest of the simple quoted properties
//     for (i = 0; i < quoted.length; i++) {
//         property = quoted[i];
//         optionsScss = _replaceSimpleOption(request, property, optionsScss, true);
//         if (!optionsScss) {
//             // if missing required property we call next middleware and bail out of here
//             return next(new Error(property + ' is required'));
//         }
//     }

//     fn(optionsScss);
// }



// function _generateFontsFromRequest(request) {
//     // Generic fonts must be left unquoted so the engine doesn't literally look
//     // for something like 'monospace' etc.
//     // http://www.w3.org/TR/CSS2/fonts.html#generic-font-families
//     // initial and default are reserved for future use
//     var genericFontFamilies = ['serif', 'sans-serif', 'cursive', 'fantasy', 'monospace', 'initial', 'default'];

//     var module = request.workingDirectory;
//     if (module.indexOf('Grids') > -1 && request.query['btn-font-family']) {
//         var fontFams = request.query['btn-font-family'];
//         var str = '';
//         _.each(fontFams, function(font) {
//             // Check if this is a generic font like serif cursive etc...
//             if (_.indexOf(genericFontFamilies, font) > -1) {
//                 // Generic font families must by unquoted
//                 str += font + ', ';
//             } else {
//                 // Quote all non generic font families
//                 str += '"' + font + '", ';
//             }
//         });
//         //create full css rule in key: val form
//         //also: remove leftover trailing space/comma at end and add semi-colon
//         str = '$ubtn-font-family: ' + str.substr(0, str.length-2);
//         str += ';';
//         return str;
//     } else if (module === 'grids') {//TODO / NOP
//     } else {}
// }

// function _generateColorsFromRequest(request) {
//     console.log("_generateColorsFromRequest entered...");
//     var GridsColors = '',
//         module = request.workingDirectory;

//     if (module.indexOf('Grids') > -1 && request.query['btn-colors']) {
//         var colors = request.query['btn-colors'];
//         _.each(colors, function (color) {
//             GridsColors += "('" +color.name+ "' " +color.background+" "+color.color+ ") ";
//         });
//         GridsColors += ';';
//         GridsColors = '$ubtn-colors: ' + GridsColors;
//         return GridsColors;
//     } else if (module === 'grids') {//TODO / NOP
//     } else {}
//     // TODO: Throw a 404 if none of these match
// }



module.exports.build = buildGrids;
