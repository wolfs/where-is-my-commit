define(['jquery', 'bootstrap'], function ($) {
  'use strict';
  var my = {};

  my.dateTimeFormat = {year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric'};

  my.formatClaim = function (el) {
    el.html(function (claimedObject) {
      var claim = claimedObject.claim;
      if (claim.claimed) {
        return '<span class="glyphicon glyphicon-lock"> </span>' + (claim.reason ? (' <span>' + claim.reason + '</span><br /> ') : '') +
          ' <span class="label label-default">' + claim.claimedBy + '</span>' +
          ' <span>' + new Date(claim.claimDate).toLocaleString('de-DE', my.dateTimeFormat) + '</span>';
      } else {
        return '';
      }
    });
  };

  var appendTestCaseDetails = function (name, description, present, collapse, text) {
    return function (hull) {
      hull
        .filter(present)
        .append("div").call(function (div) {
          div.append("h6")
            .append("a")
            .attr("data-toggle", "collapse")
            .attr("href", function (testCase) {
              return "#" + name + testCase.id;
            })
            .text(description)
            .append("span")
            .attr("class", "caret")
          ;
        })
        .append("div")
        .attr("class", function (testCase) {
          return collapse(testCase) ? "panel-collapse collapse" : "panel-collapse collapse in";
        })
        .attr("id", function (testCase) {
          return name + testCase.id;
        })
        .append("pre")
        .text(function (testCase) {
          return text(testCase);
        });
    };
  };

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

    var testResults = suiteResults.selectAll(".testResult").data(function (suite) {
      return suite.cases;
    }, function (testCase) {
      return testCase.name;
    });

    testResults.enter()
      .append("div")
      .attr("class", "input-group testResult")
      .html(function (testCase) {
        return '<span class="input-group-addon"><input class="testCaseSelect" data-testCaseId="' + testCase.id + '" type="checkbox"></span>';
      })
      .append("div")
      .attr("class", "list-group-item")
      .html(function (testCase) {
        return '<div class="row">' +
          [
            '<div class="h5 col-md-7">',
            '<a href="', testCase.url, '">', testCase.name.substring(0, 400), '</a> ',
            ' <span class="glyphicon glyphicon-time"></span>',
            '<span class="badge" data-toggle="tooltip" title="age">', testCase.age, '</span>',
            '</div>'].join("") +
          '<div class="col-md-5 claim"/>' +
          '</div>';
      })
      .call(appendTestCaseDetails("details", 'Details',
        function (testCase) {
          return testCase.errorDetails;
        },
        function (testCase) {
          return testCase.errorDetails.length > 1200;
        },
        function (testCase) {
          return testCase.errorDetails;
          //.substring(0, 1200).replace(/\[\d+, (\d+(, )?)*\]/, "");
        }
      ))
      .call(appendTestCaseDetails("stacktrace", 'Stacktrace',
        function (testCase) {
          return testCase.errorStackTrace;
        },
        function () {
          return true;
        },
        function (testCase) {
          return testCase.errorStackTrace;
          //.replace(/\[\d+, (\d+(, )?)*\]/, "");
        }
      ));

    testResults.select('.claim').call(my.formatClaim);

    var warnings = projectSelection.selectAll(".warning").data(function (node) {
      return node.warnings || [];
    });

    warnings.enter()
      .append("div")
      .attr("class", "warning")
      .append("div")
      .attr("class", "list-group-item")
      .html(function (warning) {
        return "<h5 class='list-group-item-heading'>" + warning.fileName + "</h5>";
      })
      .call(appendTestCaseDetails("warning", "Warning", function () {
        return true;
      }, function () {
        return false;
      }, function (warning) {
        return warning.message;
      }));

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
      }, 20);
    });
    $(eventSource).trigger(eventName);
  };

  return my;
});