var path = require('path'),
    restoreOptions = require(path.join(__dirname, '../lib/options')).restoreOptions;

function buildModule (request, response) {
    console.log("****** NEW BUILD CONTROLLER *****");
    var module = request.params.module;
    console.log('GOT IN /build/'+module+' route...');
    var json = {};
    json[module] = request[module].css;
    json.optionsScss = request.optionsScss;
    restoreOptions(request, module);
    response.jsonp(json);
}

module.exports.buildModule = buildModule;
