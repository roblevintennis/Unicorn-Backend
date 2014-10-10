/**
* BASE JSONP MODEL
*/

var JsonpModel = Backbone.Model.extend({

  ///// REQUIRED PROPERTIES ////////
  module: null,
  defaults: null,
  url: function() {},

  ///// ABSTRACT METHODS /////
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
    if (response && response[this.module]) {
      var responseObject = {};
      responseObject[this.module] = response[this.module];
      responseObject.optionsScss = response.optionsScss;

      console.log(this.module+ "--RESPONSE OBJECT: ", responseObject);
      return responseObject;
    }
  }
});
