/**
* Mixin of shared functionality
*/

var _ = require('underscore');


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
}

function _replaceSimpleOption(request, property, optionsScss, isQuoted, unicornPrefix) {
	// Grab the value
	var val = request.query[property];

	// Require all properties to have values, and namespace can't
	// be just a dot '.'
	if (!val || (property === 'btn-namespace' && val === '.')) {
	    return false;
	}

	// Convert unicorn namespaced property key .. defaults to $u
	var unicorn = unicornPrefix ? unicornPrefix + property : '$u' + property;

	// Safely escape the hyphens for regex preparation
	// Essentially, finds whole line matching rule to semi-colon (escapes $)
	var regex = new RegExp('\\'+unicorn+':.*;', 'g');
	// Replaces appropriate line with new value sent up
	var newval = isQuoted ? unicorn +': "' + val + '";' : unicorn +': ' + val + ';';
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

module.exports._replaceQuotedProperties = _replaceQuotedProperties;
module.exports._replaceUnQuotedProperties = _replaceUnQuotedProperties;
module.exports._replaceSimpleOption = _replaceSimpleOption;
module.exports._generateFontsFromRequest = _generateFontsFromRequest;

