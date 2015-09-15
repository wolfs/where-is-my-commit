define(['d3', 'jquery', 'common/render', 'broken/builds', 'common/util'], function (d3, $, render, data, util) {
  var my = {};

  var buildName = function (build) {
    return build.name;
  };

  my.renderFailedTests = function () {
    var unstableNodes = data.builds
      .filter(function (build) {
        return (build.status === "failure" || build.status === "unstable");
      });

    var unstableProjects = d3.select("#projects").selectAll(".unstableProject").data(unstableNodes, buildName);

    unstableProjects.enter()
      .append("div")
      .attr("class", function (build) {
        return "panel panel-default unstableProject " + build.status;
      })
      .attr("name", function (el) {
        return el.name;
      })
      .html(function (build) {
        return '<div class="input-group panel-default">' +
          '<span class="input-group-addon"><input class="buildSelect" data-buildId="' + build.id + '" type="checkbox"></span>' + "<div class='panel-heading'>" + '<div class="row">' +
          "<div class='col-md-8'><h2 class='panel-title'><a class='h2' href='" + build.url + "'>" + build.name +
          "</a>, <span class='h3'>" + build.date.toLocaleString('de-DE', render.dateTimeFormat) +
          "</span></h2></div>" +
          '<div class="col-md-3 claim"></div>' +
          '<div class="col-md-1"><a data-toggle="collapse" href="#collapseProject' + build.id + '">collapse<span class="caret"></span></a></div>' +
          '</div>' +
          "</div></div>" +
          "<div class='testResults panel-body collapse in' id='collapseProject" + build.id + "'></div>";
      });

    unstableProjects.order();

    unstableProjects.select('.claim').call(render.formatClaim);

    unstableProjects.exit().remove();

    render.renderTestresults(unstableProjects.select(".testResults"));

    d3.selectAll("#projects .loading").remove();

    var suiteSelector = function (event) {
      var checkbox = event.target;
      data.testCasesForSuite($(checkbox).data('suitename')).forEach(function (testCase) {
        $('[data-testcaseid="' + testCase.id + '"]').prop('checked', checkbox.checked);
      });
    };

    var suites = $('[data-suitename]');

    suites.off('change');

    suites.change(suiteSelector);
  };

  my.addUsers = function (users) {
    var userId = function (user) {
      return user.id;
    };
    d3.select('#assignees')
      .selectAll('.user')
      .data(users, userId)
      .enter()
      .append("option")
      .attr("class", "user")
      .attr("value", userId)
      .text(function (user) {
        return user.fullName;
      })
    ;
  };

  my.addViews = function (views) {
    var viewSelection = d3.select('#views').selectAll('.view').data(views);
    viewSelection
      .enter()
      .append("li")
      .attr("role", "presentation")
      .attr("class", "view")
      .append("a")
      .attr("href", function (view) {
        var queryVariables = util.queryVariables();
        queryVariables.view = view.name;
        delete queryVariables.multijob;
        return "?" + $.param(queryVariables);
      })
      .attr("role", "menuitem")
      .attr("name", function (view) {
        return view.name;
      })
      .text(function (view) {
        return view.name;
      });

    viewSelection.order();
    viewSelection.exit().remove();

    var selectedViewName = util.getQueryVariable('view');
    $('#currentView').text(selectedViewName ? selectedViewName : 'Views');
    d3.selectAll("#views .loading").remove();
  };

  my.renderLoop = function () {
    render.renderLoop(data, data.event, my.renderFailedTests);
  };

  return my;
});