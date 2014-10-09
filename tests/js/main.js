
$(function() {
  var defaultOptions = {
    'btn-namespace': '.robs-buttons',
    'btn-colors': [
      {
          name: 'primary',
          background: '#00A1CB',
          color: '#FFFFFF'
      },
      {
          name: 'action',
          background: '#7db500',
          color: '#FFFFFF'
      },
      {
          name: 'highlight',
          background: '#F18D05',
          color: '#FFFFFF'
      },
      {
          name: 'caution',
          background: '#E54028',
          color: '#FFFFFF'
      },
      {
          name: 'silly',
          background: '#87318C',
          color: '#FFFFFF'
      }
    ],
    'btn-shapes': [
      {
        name: 'pill',
        radius: '200px'
      },
      {
        name: 'rounded',
        radius: '3px'
      }
    ],
    'btn-sizes': [
      {
        name: 'giant',
        multiplier: '2'
      },
      {
        name: 'jumbo',
        multiplier: '1.5'
      },
      {
        name: 'large',
        multiplier: '1.25'
      },
      {
        name: 'normal',
        multiplier: '1'
      },
      {
        name: 'small',
        multiplier: '.75'
      },
      {
        name: 'tiny',
        multiplier: '.5'
      }
    ],
    'types': ['border', 'shapes'],
    // 'btn-name': 'button',
    'btn-height': '40px',
    'btn-bgcolor': '#EEE',
    'btn-font-color': '#666',
    'btn-font-size': '14px',
    'btn-font-weight': '300',
    'btn-font-family': ['Arial', 'sans-serif']
  };


  var JsonpModel = Backbone.Model.extend({
    module: 'buttons',
    defaults: defaultOptions,
    type: null,
    url: function() {
      // return 'http://options-compiler.herokuapp.com/build/buttons';
      return 'http://localhost:5000/build/'+this.module;
    },
    sync: function(method, model, options) {
      var url = model.url()+"?callback=?";
      var data = this.toJSON();
      console.log("URL: ", url);
      var params = _.extend({
        type: 'GET',
        dataType: 'jsonp',
        data: data,
        url: url
      }, options);
      return $.ajax(params);
    },
    parse: function(response) {
      // parse can be invoked for fetch and save, in case of save it can be undefined so check before using
      if (response && response[this.module]) {
        return {
          buttons: response[this.module],
          optionsScss: response.optionsScss
        };
      }
    }
  });

  //Select the module to test from dropdown
  $(".select-module").change(function () {

    $("select option:selected").each(function() {
      var testToRun = $(this).attr('value');
      var tokens = testToRun.split('_');
      var params = $.param(defaultOptions);
      var module = tokens[0];
      var action = tokens[1];
      var url = 'http://localhost:5000/';

      if (testToRun === "buttons_download") {
        url += 'download/' +module+'?'+ params;
        window.open(url, 'Download');

      } else if (testToRun === "buttons_build") {
        var buttons = new JsonpModel();
        buttons.save();
        console.log("Updated Buttons Backbone Model: ", buttons.toJSON());
      } else {
        console.log("We've only done buttons so far :)");
      }
    });
  });
});
