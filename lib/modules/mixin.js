/**
* Mixin of shared functionality
*/

var path = require('path'),
  fs = require('fs-extra'),
  _ = require('underscore');

//Convenient wrapper methods for replacing quoted and unquoted properties
function _replaceQuotedProperties(request, next, optionsScss, quoted, unicornPrefix) {
	return _replaceProperties(request, next, optionsScss, null, quoted, unicornPrefix);
}
function _replaceUnQuotedProperties(request, next, optionsScss, unquoted, unicornPrefix) {
	return _replaceProperties(request, next, optionsScss, unquoted, null, unicornPrefix);
}

/**
* Replaces both quoted and unquoted properites
*/
function _replaceProperties(request, next, optionsScss, unquoted, quoted, unicornPrefix) {
	if (unquoted) {
	  optionsScss = _replaceListOfProperties(request, next, unquoted, optionsScss, false, unicornPrefix);
	}
	if (quoted) {
	  optionsScss = _replaceListOfProperties(request, next, quoted, optionsScss, true, unicornPrefix);
	}
	return optionsScss;
}

/**
* Loops each of the `properties` designated as quoted or unquoted, and replaces with new value
*/
function _replaceListOfProperties(request, next, properties, optionsScss, isQuoted, unicornPrefix) {
	var i, property;

	for (i = 0; i < properties.length; i++) {
		property = properties[i];
		optionsScss = _replaceSimpleOption(request, property, optionsScss, isQuoted, unicornPrefix);
		if (!optionsScss) {
			// if missing required property we call next middleware and bail out of here
			return next(new Error(property + ' is required'));
		}
	}
	return optionsScss;
}

function _replaceSimpleOption(request, property, optionsScss, isQuoted, unicornPrefix) {
	// Grab the value
	var val = request.query[property];

	// Convert unicorn namespaced property key .. defaults to $u
	var unicornProperty = unicornPrefix ? unicornPrefix + property : '$u' + property;

	// Safely escape the hyphens for regex preparation
	// Essentially, finds whole line matching rule to semi-colon (escapes $)
	var regex = new RegExp('\\'+unicornProperty+':.*;', 'g');

	// Replaces appropriate line with new value sent up
	var newval = '';
	if (isQuoted) {
		newval = unicornProperty +': "' + val + '";';
	} else {
		newval = unicornProperty +': ' + val + ';';
	}
	optionsScss = optionsScss.replace(regex, newval);

	return optionsScss;
}

function _generateFontsFromRequest(request, requestedFonts, fontFamilyKey) {
  // Generic fonts must be left unquoted so the engine doesn't literally look
  // for something like 'monospace' etc.
  // http://www.w3.org/TR/CSS2/fonts.html#generic-font-families
  // initial and default are reserved for future use
  var genericFontFamilies = ['serif', 'sans-serif', 'cursive', 'fantasy', 'monospace', 'initial', 'default'];

  var str = '';

  _.each(requestedFonts, function(font) {

    // Check if this is a generic font like serif cursive etc...
    if (_.indexOf(genericFontFamilies, font) > -1) {
      // Generic font families must by unquoted
      str += font + ', ';
    } else {
      // Quote all non generic font families
      str += '"' + font + '", ';
    }
  });

  //Create full css rule in key: val form
  //also: remove leftover trailing space/comma at end and add semi-colon
  str = fontFamilyKey + str.substr(0, str.length - 2) + ';';

  return str;
}

/**
* This method takes care of much of the file manipulation cruft. The `replaceFn`
* is a callback you supply to do any options property replacements. Once your
* `replaceFn` has munged the desired `optionsScss`, you call us back with that
* and we write out the file appropriately.
*/
function _updateOptions(request, moduleDirectory, replaceFn, next) {
  console.log("_updateOptions entered...");
  var optionsFile = path.resolve(__dirname + path.sep + '..' + path.sep + '..' + path.sep + moduleDirectory + '/scss/_options.scss');

  fs.readFile(optionsFile, 'utf8', function(err, data) {
    if (err) {
      console.log(err);
      return next(new Error('Issue reading in ' + optionsFile));
    }

    //Replace options with new values
    replaceFn(request, data, function(optionsScss) {

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

/**
* list - the list passed in on http request
* listKeys - A list of list keys with information on whether to quote or not:
* `[{name: 'foo', quoted: true},{name: 'bar', quoted: false}]`
* key - the CSS key e.g. $ubtn-colors etc.
*
* Returns a sass list like:  ('primary' #00A1CB #FFFFFF) ('action' #7db500 #FFFFFF);
*/
function _generateListFromRequest(request, list, listKeys, key) {
  var sassList = '';

  _.each(list, function(item) {

    sassList += "(";

    _.each(listKeys, function(listkey) {

      if (listkey.quoted) {
        //quote the value
        sassList += "'" + item[listkey.name] + "' ";
      } else {
        sassList += item[listkey.name] + " ";
      }
    });

    sassList += ") ";
  });
  sassList += ';';
  sassList = key + sassList;

  return sassList;
}

/**
* This method takes both `allTypes` (all available types by default), and `requestedTypes`
* (the types passed up from user's selection) and comments out the "un-requested" types
* that are the difference between the two. Then it writes out the module's scss file. This
* file is expected to be on the module's top directory e.g. the `buttons.scss` at top level.
* We also expect that the module's types are in `types/foo` directory location.
*/
function _updateIncludedTypes(request, moduleDirectory, allTypes, requestedTypes, fn) {
  console.log("_updateIncludedTypes entered...");

  //Read in buttons file
  var moduleFile = path.resolve(__dirname + path.sep + '..' + path.sep + '..' + path.sep + moduleDirectory + '/scss/buttons.scss');
  var fileString = fs.readFileSync(moduleFile).toString();

  //Difference all types with the requested types and comment out any leftover
  var typesToCommentOut = _.difference(allTypes, requestedTypes);
  _.each(typesToCommentOut, function(type) {

		//Again, we expect these to be in types/foo!
		var regex = new RegExp("@import [\'\"]{1}types/" + type + "[\'\"]{1};", 'g');
		fileString = fileString.replace(regex, "// @import 'types/" + type + "';");
  });

  fs.writeFileSync(moduleFile, fileString);

  fn();
}

module.exports._replaceQuotedProperties = _replaceQuotedProperties;
module.exports._replaceUnQuotedProperties = _replaceUnQuotedProperties;
module.exports._replaceSimpleOption = _replaceSimpleOption;
module.exports._generateFontsFromRequest = _generateFontsFromRequest;
module.exports._generateListFromRequest = _generateListFromRequest;
module.exports._updateOptions = _updateOptions;
module.exports._updateIncludedTypes = _updateIncludedTypes;


