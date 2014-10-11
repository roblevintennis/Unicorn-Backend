var path = require('path'),
  exec = require('child_process').exec;

/**
 * Creates a styleguide sub-directory inside our module. Note that it will
 * place the combined module and styleguide in to ./generated directory. If
 * `build_styleguide` was falsy, we will still copy the module to a new
 * location (for safety purposes), and callback `fn` with that directory path.
 */
function styleguide(request, module, fn) {
  console.log("styleguide entered...");
  // Remove any trailing forward slash as in buttons/
  module = module ? module.replace(/\/$/, '') : null;
  // console.log("styleguide: module - " + module);
  if (!module) {
    fn(new Error('styleguide: no module provided'));
  }

  // If request has a build_styleguide param that's truthy
  var buildStyleguide = request.query.build_styleguide;
  var isStyleguide = (buildStyleguide && buildStyleguide !== 'false') ? true : false;
  var cmd = path.resolve(__dirname + path.sep + '..' + path.sep + 'scripts/unicorn-utils.sh');
  var outputDirectory = module;
  console.log("styleguide: isStyleguide - " + isStyleguide);
  if (isStyleguide) {
    // Note that the forward slash after module is important! Ensures the
    // contents of module/ are copied (not the directory as a whole)
    cmd += ' --module-dir ' + module + '/ --output-dir ' + outputDirectory;
    // Execute the shell script
    exec(cmd, function(err, stdout, stderr) {
      if (err) {
        console.log(err);
        fn(new Error('Issue in styleguide'));
      } else {
        console.log('Styleguide: command executed successfully...');
        fn(outputDirectory + path.sep);
      }
    });
  } else {
    //NOOP if not building styleguide
    console.log("In styleguide -- NOOP...");
    fn(outputDirectory + path.sep);
  }
  //TODO: Commented this out because it was creating a /app/<module>/<module> bug on heroku
  // else {
  //     // Note that the forward slash after module is important! Ensures the
  //     // contents of module/ are copied (not the directory as a whole)
  //     cmd += ' --copy-only --module-dir ' + module + '/ --output-dir ' + outputDirectory;
  // }
}
module.exports.styleguide = styleguide;
