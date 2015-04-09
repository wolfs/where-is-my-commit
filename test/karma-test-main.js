var allTestFiles = [];
var TEST_REGEXP = /Spec\.js$/;

var pathToModule = function(path) {
  return "../" + path.replace(/^\/base\//, '').replace(/\.js$/, '');
};

Object.keys(window.__karma__.files).forEach(function(file) {
  if (TEST_REGEXP.test(file)) {
    // Normalize paths to RequireJS module names.
    allTestFiles.push(pathToModule(file));
  }
});

require.config(function () {
  'use strict';
  return {
    baseUrl: '/base/src',
    paths: {
      jquery: '../bower_components/jquery/dist/jquery.min',
      d3: '../bower_components/d3/d3.min',
      squire: '../bower_components/squire/src/Squire'
    },

    deps: allTestFiles,

    callback: window.__karma__.start
  };
}());
