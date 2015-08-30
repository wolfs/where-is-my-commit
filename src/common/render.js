define(function () {
  'use strict';
  var my = {};

  my.renderTestresults = function (projectSelection) {
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

    var hull = suiteResults.selectAll(".testResult").data(function (suite) {
      return suite.cases;
    }, function (testCase) {
      return testCase.name;
    }).enter()
      .append("div")
      .attr("class", "testResult list-group-item")
      .html(function (testCase) {
        return '<h6 class="list-group-item-heading"><a href="' + testCase.url + '">' + testCase.name + '</a>' + (testCase.errorDetails ?
          '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<a data-toggle="collapse" href="#' + "testCase" + testCase.count + '">Details</a>' : '') +
          (testCase.errorStackTrace ?
          '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<a data-toggle="collapse" href="#' + "stackTrace" + testCase.count + '">Stacktrace</a>' : '') +
        '</h6>';
      });

    hull.append("div")
      .attr("class", function (testCase) {
        return (!testCase.errorDetails || testCase.errorDetails.length > 1200) ? "collapse" : "collapse in";
      })
      .attr("id", function (testCase) {
        return "testCase" + testCase.count;
      })
      .append("small")
      .append("pre")
      .text(function (testCase) {
        return testCase.errorDetails === null ? "" : testCase.errorDetails.replace(/\[(\d+(, )?)*\]/, "");
      });

    hull.append("div")
      .attr("class", "collapse")
      .attr("id", function (testCase) {
        return "stackTrace" + testCase.count;
      })
      .append("small")
      .append("pre")
      .text(function (testCase) {
        return testCase.errorStackTrace ? testCase.errorStackTrace.replace(/\[(\d+(, )?)*\]/, "") : "";
      });

    var warnings = projectSelection.selectAll(".warning").data(function (node) {
      return node.warnings || [];
    });

    warnings.enter()
      .append("div")
      .attr("class", "warning")
      .html(function (warning) {
        return "<div class='list-group-item'><h5 class='list-group-item-heading'>" + warning.fileName + "</h5><pre>" + warning.message + "</pre></h5>" +
          "</div>";
      });
  };

  my.renderLoop = function (eventSource, eventName, render) {
    var viewNeedsUpdate = true;
    $(eventSource).bind(eventName, function () {
      viewNeedsUpdate = true;
      setTimeout(function () {
        if (viewNeedsUpdate) {
          render();
          viewNeedsUpdate = false;
        }
      }, 0);
    });
    $(eventSource).trigger(eventName);
  };

  return my;
});