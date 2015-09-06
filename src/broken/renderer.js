define(['d3', 'jquery', 'common/render', 'broken/builds', 'common/util'], function (d3, $, render, data) {
  var my = {};

  var buildName = function (build) {
    return build.name;
  };

  my.renderFailedTests = function () {
    var unstableNodes = data.builds
      .filter(function (build) {
        return (build.status === "unstable");
      });

    var unstableProjects = d3.select("#projects").selectAll(".unstableProject").data(unstableNodes, buildName);

    unstableProjects.enter()
      .append("div")
      .attr("class", "panel panel-default unstableProject")
      .attr("name", function (el) {
        return el.name;
      })
      .html(function (build) {
        return "<div class='panel-heading'>" +   '<div class="row">' +
          "<div class='col-md-8'><h2 class='panel-title'><a class='h2' href='" + build.url + "'>" + build.name +
          "</a>, <span class='h3'>" + build.date.toLocaleString('de-DE', render.dateTimeFormat) +
          "</span></h2></div>" +
            '<div class="col-md-4">' + render.formatClaim(build.claim) + '</div>' +
            '</div>' +
          "</div>" +
          "<div class='testResults panel-body'></div>";
      });

    unstableProjects.order();

    unstableProjects.exit().remove();

    render.renderTestresults(unstableProjects.select(".testResults"));

    d3.selectAll("#projects .loading").remove();
  };

  var claimTest = function (testCase, claim)  {
    $.post(testCase.url  + '/claim/claim', {
        Submit: "Claim",
        json: JSON.stringify(claim)
      }
    );
  };

  var unclaimTest = function (testCase)  {
    $.post(testCase.url  + '/claim/unclaim');
  };

  my.initFormSubmit = function () {
    selectedTestCases = function() {
      var selected = $('input.testCaseSelect:checked');
      var ids = $.makeArray(selected.map(function () {
        return $(this).data('testcaseid');
      }));
      var testCases = ids.map(function (id) {
        return data.testCaseForId(id);
      });
      return testCases;
    };

    $('#claimForm').submit(function (event) {
      try {
        var testCases = selectedTestCases();
        var claim = { };
        $(this).serializeArray().forEach(function (field) {
          claim[field.name] = field.value;
        });
        testCases.forEach(function (testCase) {
          claimTest({
            url: testCase.url
          }, claim);
        });
      } catch (err) {
        console.log(err);
      }
      event.preventDefault();
    });

    $('#dropClaimsForm').submit(function (event) {
      try {
        var testCases = selectedTestCases();
        testCases.forEach(unclaimTest);
      } catch (err) {
        console.log(err);
      }
      event.preventDefault();
    });
  };

  my.renderLoop = function () {
    render.renderLoop(data, data.event, my.renderFailedTests);
  };

  return my;
});