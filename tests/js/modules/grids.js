/**
* Grids Module
*/

var GridsModule = GridsModule || {};

GridsModule.gridsDefaultOptions = {
	'grid-fixed-grid-size': '1200px',
	'grid-num-columns': '24',
	'grid-fixed-grid-size': '1234px',
	'grid-fixed-margin': '15px',
	'grid-responsive': 'enabled',
	'grid-small-breakpoint': '567px',
	'grid-tablet-breakpoint': '9876px'
};

GridsModule.Model = JsonpModel.extend({
  module: 'grids',
  defaults: GridsModule.gridsDefaultOptions,
  url: function() {
    // return 'http://options-compiler.herokuapp.com/build/grids';
    return 'http://localhost:5000/build/'+this.module;
  }
});