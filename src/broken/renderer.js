define(['d3', 'common/render', 'broken/builds'], function (d3, render, data) {
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
      .html(function (el) {
        return "<div class='panel-heading'><h2 class='panel-title'><a class='h2' href='" + el.url + "'>" + el.name + "</a></h2></div><div class='testResults panel-body'></div>";
      });

    unstableProjects.order();

    unstableProjects.exit().remove();

    render.renderTestresults(unstableProjects.select(".testResults"));

    d3.selectAll("#projects .loading").remove();
  };

  my.renderLoop = function () {
    render.renderLoop(data, data.event, my.renderFailedTests);
  };

  return my;
});