var path = require('path'),
    utils = require(path.join(__dirname, '../lib/', 'utils')).utils;

function buildModule (request, response) {
    var module = request.params.module;
    console.log('GOT IN /build/'+module+' route...');
    var json = {};
    json[module] = request[module].css;
    json.optionsScss = request.optionsScss;
    utils.cleanup(request, function(err) {
        if (!err) {
            response.jsonp(json);
        } else {
            response.status(500);
            response.render('error', { error: err });
        }
    });
}

module.exports.buildModule = buildModule;
