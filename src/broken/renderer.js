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
        return '<div class="input-group panel-default">' +
          '<span class="input-group-addon"><input class="buildSelect" data-buildId="' + build.id + '" type="checkbox"></span>' + "<div class='panel-heading'>" +   '<div class="row">' +
          "<div class='col-md-8'><h2 class='panel-title'><a class='h2' href='" + build.url + "'>" + build.name +
          "</a>, <span class='h3'>" + build.date.toLocaleString('de-DE', render.dateTimeFormat) +
          "</span></h2></div>" +
            '<div class="col-md-4 claim"></div>' +
            '</div>' +
          "</div></div>" +
          "<div class='testResults panel-body'></div>";
      });

    unstableProjects.order();

    unstableProjects.select('.claim').html(function (build) {
      return render.formatClaim(build.claim);
    });

    unstableProjects.exit().remove();

    render.renderTestresults(unstableProjects.select(".testResults"));

    d3.selectAll("#projects .loading").remove();
  };

  my.renderLoop = function () {
    render.renderLoop(data, data.event, my.renderFailedTests);
  };

  return my;
});