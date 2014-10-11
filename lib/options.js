/*jshint multistr: true */
var path = require('path'),
    fs = require('fs-extra'),
    _ = require('underscore');


/////////////////////////////////////////////////////
// Modules Map
//
// 1. Define module to support a `build` method (you can
//    call it whatever, just export it as `build`)
//
// 2. require it in to the corresponding module's `build`
//
// How it works:
//
// When `createOptionsMiddleware` gets called, we'll map
// to your module and simply call its `build` method. You
// can do what you need, but it's your responsibility to
// set the `request.optionsScss` property and call `next()`
//
// ```javascript
// request.optionsScss = optionsScss;
// next();
// ```
//

var Modules = {
  'buttons': {
    build: require('./modules/buttons').build
  },
  'grids': {
    build: require('./modules/grids').build
  }
}

// Custom middleware to create our _options.scss partial. Must go before compass middleware!
function createOptionsMiddleware(request, response, next) {
    console.log("createOptionsMiddleware entered...");

    var module = request.workingDirectory;

    //module will be the copied over module directory e.g. buttons-2034023644/
    //so we snip that to get the module's name
    var moduleName = module.split('-')[0];

    var build = Modules[moduleName] ? Modules[moduleName].build : null;

    if (build) {
        build.call(this, request, module, next);
    } else {
        next(new Error('No Module Found: For ' + moduleName));
    }
}


module.exports.createOptionsMiddleware = createOptionsMiddleware;
