require.config({
  baseUrl: '',
  paths: {
    jquery: '../bower_components/jquery/dist/jquery.min',
    d3: '../bower_components/d3/d3.min',
    bootstrap :  '../bower_components/bootstrap/dist/js/bootstrap.min'
  },
  shim: {
    bootstrap : {
      deps :['jquery']
    }
  },
  deps: ['init']
});
