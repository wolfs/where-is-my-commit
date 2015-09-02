define(['jquery'], function ($) {
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
      .attr("class", "suiteResult list-group")
      .append("div")
      .attr("class", "list-group-item suite")
      .html(function (test) {
        return "<div class='h4'><a href='" + test.url + "'>" + test.name + "</a></div>";
      });

    var hull = suiteResults.selectAll(".testResult").data(function (suite) {
      return suite.cases;
    }, function (testCase) {
      return testCase.name;
    }).enter()
      .append("div")
      .attr("class", "testResult list-group-item")
      .html(function (testCase) {
        return '<div class="row">' +
          ['<div class="h5 col-md-8">', '<a href="', testCase.url, '">', testCase.name, ' <span class="badge" data-toggle="tooltip" title="age">', testCase.age, '</span></a></div>'].join("") +
          '<div class="col-md-4"><ul class="list-inline pull-right">' + (testCase.errorDetails ?
          '<li><a data-toggle="collapse" href="#' + "testCase" + testCase.count + '">Details</a></li>' : '') +
          (testCase.errorStackTrace ?
          '<li><a data-toggle="collapse" href="#' + "stackTrace" + testCase.count + '">Stacktrace</a></li>' : '') +
          '</ul></div></div>';
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

    $(function () {
      $('[data-toggle="tooltip"]').tooltip();
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