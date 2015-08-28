require(['my-config'], function()
{});
require.config({
  baseUrl: '',
  paths: {
    jquery: 'jquery.min',
    d3: 'd3.min',
    bootstrap :  'bootstrap.min'
  },
  shim: {
    bootstrap : {
      deps :['jquery']
    }
  },
  deps: ['init']
});
