// Utils
var fs = require('fs-extra'),
    path = require('path');

function datestamp(d){
    function pad(n) {
        return n<10 ? '0'+n : n;
    }
    return d.getUTCFullYear()+
        pad(d.getUTCMonth()+1)+
        pad(d.getUTCDate())+
        pad(d.getUTCHours())+
        pad(d.getUTCMinutes())+
        pad(d.getUTCSeconds());
}
function cleanup(request, fn) {
    console.log("utils.cleanup entered...");
    var dir = request.workingDirectory || null;
    dir = path.resolve(__dirname, '../', dir);

    if (dir) {
        console.log('attempting to remove: ' + dir);
        fs.remove(dir, function(err) {
            if (err) {
                console.error('Issue cleaning up: ' + err);
                fn(err);
            } else {
                console.log('Successfully cleaned up: ' + dir);
                fn();
            }
        });
    } else {
        fn(new Error('In cleanup. No workingDirectory found.'));
    }
}

var utils = {
    datestamp: datestamp,
    cleanup: cleanup
};

module.exports.utils = utils;
