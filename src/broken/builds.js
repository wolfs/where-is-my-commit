define([], function () {
  var my = {
    builds: [],
    event: 'change'
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

  my.testCaseForId = function (id) {
    return my.testCases().filter(function (testCase) {
      return testCase.count === id;
    }).pop();
  };

  return my;
});