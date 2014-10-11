/**
* Mixin of shared functionality
*/

var path = require('path'),
  fs = require('fs-extra'),
  _ = require('underscore');

//Convenient wrapper methods
function _replaceQuotedProperties(request, next, optionsScss, quoted, unicornPrefix) {
	return _replaceProperties(request, next, optionsScss, null, quoted, unicornPrefix);
}
function _replaceUnQuotedProperties(request, next, optionsScss, unquoted, unicornPrefix) {
	return _replaceProperties(request, next, optionsScss, unquoted, null, unicornPrefix);
}

function _replaceProperties(request, next, optionsScss, unquoted, quoted, unicornPrefix) {
	var i, property;

	if (unquoted) {
	  // Replace the rest of the simple unquoted properties
	  for (i = 0; i < unquoted.length; i++) {
	    property = unquoted[i];
	    optionsScss = _replaceSimpleOption(request, property, optionsScss, false, unicornPrefix);
	    if (!optionsScss) {
	      // if missing required property we call next middleware and bail out of here
	      return next(new Error(property + ' is required'));
	    }
	  }
	}

	if (quoted) {
	  // Replace the rest of the simple quoted properties
	  for (i = 0; i < quoted.length; i++) {
	    property = quoted[i];
	    optionsScss = _replaceSimpleOption(request, property, optionsScss, true, unicornPrefix);
	    if (!optionsScss) {
	      // if missing required property we call next middleware and bail out of here
	      return next(new Error(property + ' is required'));
	    }
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
	var newval = isQuoted ? unicornProperty +': "' + val + '";' : unicornProperty +': ' + val + ';';
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
* This method takes care of much of the file manipulation cruft. The interesting
* inputs are `properties` which is just an object literal of key vals, and
* the `replaceFn` which is a callback you supply to do any property replacements.
* Once your `replaceFn` has munged the desired `optionsScss`, you call us back
* with that and it gets written out appropriately.
*/
function _updateOptions(request, moduleDirectory, properties, replaceFn, next) {
  console.log("_updateOptions entered...");
  var optionsFile = path.resolve(__dirname + path.sep + '..' + path.sep + '..' + path.sep + moduleDirectory + '/scss/_options.scss');

  fs.readFile(optionsFile, 'utf8', function(err, data) {
    if (err) {
      console.log(err);
      return next(new Error('Issue reading in ' + optionsFile));
    }

    //Replace options with new values
    replaceFn(request, data, properties, function(optionsScss) {

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

module.exports._replaceQuotedProperties = _replaceQuotedProperties;
module.exports._replaceUnQuotedProperties = _replaceUnQuotedProperties;
module.exports._replaceSimpleOption = _replaceSimpleOption;
module.exports._generateFontsFromRequest = _generateFontsFromRequest;
module.exports._updateOptions = _updateOptions;
module.exports._generateListFromRequest = _generateListFromRequest;


