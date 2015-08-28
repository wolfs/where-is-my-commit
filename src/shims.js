(function (config) {
  if (typeof define === 'function' && define.amd) {
    define('shims', [], function() {
      var dev = ("window" in this || window.whereIsMyCommit === undefined);
      require.config(config("..", dev));
    });
  } else {
    module.exports = config(".", true);
  }
})(function (rootDir, bower) {
  var lib = function (bowerPath, filename) {
    return [rootDir].concat((bower ? ['bower_components', bowerPath] : []), [filename]).join('/');
  };

  return {
    baseUrl: '',
    paths: {
      jquery: lib('jquery/dist', 'jquery.min'),
      d3: lib('d3', 'd3.min'),
      bootstrap :  lib('bootstrap/dist/js', 'bootstrap.min')
    },
    shim: {
      bootstrap : {
        deps :['jquery']
      }
    }
  };
});
