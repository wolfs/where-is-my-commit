define({
  getQueryVariable: function (variable) {
    var query = window.location.search.substring(1),
      results = query.split("&").map(function (el) {
        return el.split("=")
      }).filter(function (el) {
        return (el[0] === variable);
      }).map(function (el) {
        return el[1];
      });
    return results.length === 0 ? false : results[0];
  }
});