var fs = require('fs'),
  path = require('path'),
  archiver = require('archiver');

/**
* Sets up the archive with Button module's files.
*
* dir - the directory where module sandbox is
* archive - archive object
*/
function populateArchive(dir, archive) {
  console.log("About to start archiving grids...");
  var css = path.join(dir, '/css/grids.css');
  var scss = path.join(dir, '/scss/');

console.log(">>>>>>>>>>>>>>>> populateArchive-dir: " +dir+ " -- scss: " + scss);

  //Set up the archive to point to relevant files then return
  archive

  //BASE FILE STREAMS
    .append(fs.createReadStream(dir + 'config.rb'), {
      name: 'config.rb'
    })
    .append(fs.createReadStream(css), {
      name: 'css/grids.css'
    })
    .append(fs.createReadStream(scss + '_responsive.scss'), {
      name: 'scss/_responsive.scss'
    })
    .append(fs.createReadStream(scss + '_mixins.scss'), {
      name: 'scss/_mixins.scss'
    })
    .append(fs.createReadStream(scss + '_options.scss'), {
      name: 'scss/_options.scss'
    })
    .append(fs.createReadStream(scss + 'grids.scss'), {
      name: 'scss/grids.scss'
    })

////////////////////////////////////////////////////////////////
// TODO - FLUID and FIXED SHOULD BE TYPES //////////////////////
////////////////////////////////////////////////////////////////

  //TYPES STREAMS
  // var types = path.join(scss, 'types/');

  // .append(fs.createReadStream(types + '_fluid.scss'), {
  //     name: 'scss/types/_fluid.scss'
  //   })
  //   .append(fs.createReadStream(types + '_fixed.scss'), {
  //     name: 'scss/types/_fixed.scss'
  //   });

	return archive;
}

module.exports.populateArchive = populateArchive;
