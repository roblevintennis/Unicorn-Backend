/**
* main.js
*/

$(function() {

  var config = {

    //LOCAL TESTING
    url: 'http://localhost:5000/',

    //HEROKU TESTING
    // url: 'http://options-compiler.herokuapp.com/',

    tests: {

      //BUTTONS MODULE
      'buttons': [{
        action: 'download',
        options: ButtonsModule.buttonDefaultOptions,
        model: ButtonsModule.Model
      },{
        action: 'build',
        options: ButtonsModule.buttonDefaultOptions,
        model: ButtonsModule.Model
      }],

      //GRIDS MODULE
      'grids': [{
        action: 'download',
        options: GridsModule.gridsDefaultOptions,
        model: GridsModule.Model
      }, {
        action: 'build',
        options: GridsModule.gridsDefaultOptions,
        model: GridsModule.Model
      }]
    }
  };

  //////////////////////////////////////////
  //MAIN TEST SELECTION DROPDOWN ///////////
  //////////////////////////////////////////

  $(".select-module").change(function () {

    $("select option:selected").each(function() {

      //Expected format is buttons_download, grids_build, etc.
      var testToRun = $(this).attr('value');
      var tokens = testToRun.split('_');
      var module = tokens[0];//e.g. buttons
      var action = tokens[1];//e.g. build

      //Find corresponding spec for module=>action
      var moduleConfig = _.find(config.tests[module], function(spec){ return spec.action == action;});

      var params = $.param(moduleConfig['options']);

      //Model only used for `build` action (download doesn't use backbone model)
      var klass = moduleConfig.model;

      _fireRequest(action, module, params, klass);
    });
  });

  function _fireRequest(action, module, params, moduleModel) {
    var url = config['url'];

    switch (action) {
      case 'download':
        url += 'download/' +module+'?'+ params;
        window.open(url, 'Download');
        break;
      case 'build':
        var model = new moduleModel();
        model.save();
        console.log("Updated "+module+"backbone model: ", model.toJSON());
        break;
      default:
        console.log("Unknown action requested...");
    }
  }

});
