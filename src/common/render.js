define(function() {
  var my = {};

  my.renderTestresults = function(projectSelection) {
    var suiteResults = projectSelection.selectAll(".suiteResult").data(function (node) {
      return node.testResult.failedTests || [];
    }, function (test) {
      return test.name + "-" + test.className;
    });

    suiteResults.enter()
      .append("div")
      .attr("class", "suiteResult")
      .append("div")
      .attr("class", "list-group-item")
      .html(function (test) {
        return "<h5 class='list-group-item-heading'><a href='" + test.url + "'>" + test.name + "</a></h5>";
      });

    suiteResults.selectAll(".testResult").data(function (suite) {
      return suite.cases;
    }, function (testCase) {
      return testCase.name;
    }).enter()
      .append("div")
      .attr("class", "testResult list-group-item")
      .html(function (testCase) {
        return '<h6 class="list-group-item-heading"><a href="' + testCase.url + '">' + testCase.name + '</a></h6>';
      })
      .append("small")
      .text(function(testCase) { return testCase.errorDetails === null ? "" : testCase.errorDetails; });

    var warnings = projectSelection.selectAll(".warning").data(function (node) {
      return node.warnings || [];
    });

    warnings.enter()
      .append("div")
      .attr("class", "warning")
      .html(function (warning) {
        return "<div class='list-group-item'><h5 class='list-group-item-heading'>" + warning + "</h5>" +
          "</div>";
      });
  };

  return my;
});