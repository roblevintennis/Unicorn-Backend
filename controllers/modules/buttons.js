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
  console.log("About to start archiving buttons...");
  var css = path.join(dir, '/css/buttons.css');
  var jsButtons = path.join(dir, '/js/buttons.js');
  var scss = path.join(dir, '/scss/');
  var types = path.join(scss, 'types/');

  //Set up the archive to point to relevant files then return
  archive

  //BASE FILE STREAMS
    .append(fs.createReadStream(dir + 'config.rb'), {
      name: 'config.rb'
    })
    .append(fs.createReadStream(css), {
      name: 'css/buttons.css'
    })
    .append(fs.createReadStream(jsButtons), {
      name: 'js/buttons.js'
    })
    .append(fs.createReadStream(scss + '_base.scss'), {
      name: 'scss/_base.scss'
    })
    .append(fs.createReadStream(scss + '_layout.scss'), {
      name: 'scss/_layout.scss'
    })
    .append(fs.createReadStream(scss + '_mixins.scss'), {
      name: 'scss/_mixins.scss'
    })
    .append(fs.createReadStream(scss + '_options.scss'), {
      name: 'scss/_options.scss'
    })
    .append(fs.createReadStream(scss + 'buttons.scss'), {
      name: 'scss/buttons.scss'
    })

  //TYPES STREAMS
  .append(fs.createReadStream(types + '_3d.scss'), {
      name: 'scss/types/_3d.scss'
    })
    .append(fs.createReadStream(types + '_border.scss'), {
      name: 'scss/types/_border.scss'
    })
    .append(fs.createReadStream(types + '_borderless.scss'), {
      name: 'scss/types/_borderless.scss'
    })
    .append(fs.createReadStream(types + '_dropdown.scss'), {
      name: 'scss/types/_dropdown.scss'
    })
    .append(fs.createReadStream(types + '_glow.scss'), {
      name: 'scss/types/_glow.scss'
    })
    .append(fs.createReadStream(types + '_groups.scss'), {
      name: 'scss/types/_groups.scss'
    })
    .append(fs.createReadStream(types + '_raised.scss'), {
      name: 'scss/types/_raised.scss'
    })
    .append(fs.createReadStream(types + '_shapes.scss'), {
      name: 'scss/types/_shapes.scss'
    })
    .append(fs.createReadStream(types + '_sizes.scss'), {
      name: 'scss/types/_sizes.scss'
    })
    .append(fs.createReadStream(types + '_wrapper.scss'), {
      name: 'scss/types/_wrapper.scss'
    });

	return archive;
}

module.exports.populateArchive = populateArchive;
