/**
* Grids Module
*/

var GridsModule = GridsModule || {};

GridsModule.gridsDefaultOptions = {
  'grid-fixed-grid-size': '1200px'
  // $unicorn-grid-fixed-grid-size: 960px !default;
  // $unicorn-grid-fixed-margin: 10px !default;
};

GridsModule.Model = JsonpModel.extend({
  module: 'Grids',
  defaults: GridsModule.gridsDefaultOptions,
  url: function() {
    // return 'http://options-compiler.herokuapp.com/build/grids';
    return 'http://localhost:5000/build/'+this.module;
  }
});