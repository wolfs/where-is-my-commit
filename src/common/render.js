define(['jquery', 'bootstrap'], function ($) {
  'use strict';
  var my = {};

  my.dateTimeFormat= { year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric' };

  my.formatClaim = function (claim) {
    return (claim.claimed ? '<span class="glyphicon glyphicon-lock"> </span>' + (claim.reason ? (' <span>' + claim.reason + '</span><br /> ') : '') +
    ' <span class="label label-default">' + claim.claimedBy + '</span>' +
    ' <span>' + new Date(claim.claimDate).toLocaleString('de-DE', my.dateTimeFormat) + '</span>'
      : '');
  };


  var appendTestCaseDetails = function(hull, name, description, present, collapse, text) {
    hull
      .filter(present)
      .append("div")
      .html(function (testCase) {
        return '<h6>' +
          '<a data-toggle="collapse" href="#' + name + testCase.count + '">' + description + '<span class="caret"></span></a>' +
          '</h6>';
      })
      .append("div")
      .attr("class", function (testCase) {
        return collapse(testCase) ? "panel-collapse collapse" : "panel-collapse collapse in";
      })
      .attr("id", function (testCase) {
        return name + testCase.count;
      })
      .append("pre")
      .text(function (testCase) {
        return text(testCase);
      });
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

    var hull = suiteResults.selectAll(".testResult").data(function (suite) {
      return suite.cases;
    }, function (testCase) {
      return testCase.name;
    }).enter()
      .append("div")
      .attr("class", "input-group testResult")
      .html('<span class="input-group-addon"><input type="checkbox"></span>')
      .append("div")
      .attr("class", "list-group-item")
      .html(function (testCase) {
        return '<div class="row">' +
          [
            '<div class="h5 col-md-7">',
            '<a href="', testCase.url, '">', testCase.name, '</a> ',
            ' <span class="glyphicon glyphicon-time"></span>',
            '<span class="badge" data-toggle="tooltip" title="age">', testCase.age, '</span>',
            '</div>'].join("") +
          '<div class="col-md-5">' + my.formatClaim(testCase.claim) + '</div>' +
          '</div>';
      });

    appendTestCaseDetails(hull, "details", 'Details',
      function (testCase) {
        return testCase.errorDetails;
      },
      function (testCase) {
        return testCase.errorDetails.length > 1200;
      },
      function (testCase) {
        return testCase.errorDetails.replace(/\[(\d+(, )?)?\]/, "");
      }
    );

    appendTestCaseDetails(hull, "stacktrace", 'Stacktrace',
      function (testCase) {
        return testCase.errorStackTrace;
      },
      function () {
        return true;
      },
      function (testCase) {
        return testCase.errorStackTrace.replace(/\[(\d+(, )?)?\]/, "");
      }
    );

    var warnings = projectSelection.selectAll(".warning").data(function (node) {
      return node.warnings || [];
    });

    appendTestCaseDetails(warnings.enter()
      .append("div")
      .attr("class", "warning")
      .append("div")
      .attr("class", "list-group-item")
      .html(function (warning) {
        return "<h5 class='list-group-item-heading'>" + warning.fileName + "</h5>";
      }), "warning", "Warning", function () { return true; }, function () { return false; }, function (warning) {
      return warning.message;
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