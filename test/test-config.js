
require.config(function () {
  var logic = document.querySelector('script[data-id="requirejs"]').getAttribute("data-logic");
  return {
    baseUrl: '../src',
    paths: {
      jquery: '../bower_components/jquery/dist/jquery.min',
      d3: '../bower_components/d3/d3.min',
      jasmine: '../bower_components/jasmine/lib/jasmine-core/jasmine',
      jasmineBoot: '../bower_components/jasmine/lib/jasmine-core/boot',
      jasmineHtml: '../bower_components/jasmine/lib/jasmine-core/jasmine-html',
      squire: '../bower_components/squire/src/Squire',
      spec: '../test/spec'
    },
    shim: {
      'jasmineHtml': {
        deps : ['jasmine']
      },
      'jasmineBoot': {
        deps : ['jasmine', 'jasmineHtml']
      }
    },
    deps: [logic]
  }
}());
