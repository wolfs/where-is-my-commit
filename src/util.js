define({
  getQueryVariable: function (variable) {
    var search = window.location.search;
    return this.getQueryVariableFromSearch(variable, search)
  },

  getQueryVariableFromSearch: function(variable, search) {
    var query = search.substring(1);
    var results = query.split("&").map(function (el) {
      return el.split("=")
    }).filter(function (el) {
      return (el[0] === variable);
    }).map(function (el) {
      return el[1];
    });
    return results.length === 0 ? false : results[0];
  }
});