/**
* Buttons Module
*/

var ButtonsModule = ButtonsModule || {};

ButtonsModule.buttonDefaultOptions = {
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
  'types': ['shapes', 'sizes', 'border', 'borderless', 'raised', '3d', 'glow', 'dropdown', 'groups', 'wrapper'],
  'btn-height': '40px',
  'btn-bgcolor': '#EEE',
  'btn-font-color': '#666',
  'btn-font-size': '14px',
  'btn-font-weight': '300',
  'btn-font-family': ['Arial', 'sans-serif']
};

ButtonsModule.Model = JsonpModel.extend({
  module: 'buttons',
  defaults: ButtonsModule.buttonDefaultOptions,
  url: function() {
    // return 'http://options-compiler.herokuapp.com/build/buttons';
    return 'http://localhost:5000/build/'+this.module;
  }
});