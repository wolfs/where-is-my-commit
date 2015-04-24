require(['my-config'], function()
{});
require.config({
  baseUrl: '',
  paths: {
    jquery: 'jquery.min',
    d3: 'd3.min'
  },
  deps: ['init']
});
