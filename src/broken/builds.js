define([], function () {
  var my = {
    builds: [],
    event: "change"
  };

  var concat = function (a, b) {
    return a.concat(b);
  };

  my.testCases = function () {
    return my.builds.map(function (build) {
      return build.testResult.failedTests || [];
    }).reduce(concat)
      .map(function (testSuite) {
        return testSuite.cases;
      })
      .reduce(concat);
  };

  var findById = function (id, list) {
    return list.filter(function (objectWithId) {
      return objectWithId.id === id;
    }).pop();
  };

  my.testCaseForId = function (id) {
    return findById(id, my.testCases());
  };

  my.buildForId = function (id) {
    return findById(id, my.builds);
  };

  my.testCasesForSuite = function (url) {
    return my.builds.map(function (build) {
      return build.testResult.failedTests || [];
    }).reduce(concat)
      .filter(function (testSuite) {
        return testSuite.url === url;
      })
      .pop().cases;
  };

  return my;
});