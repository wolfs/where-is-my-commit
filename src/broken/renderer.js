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
      .attr("class", "list-group-item unstableProject")
      .attr("name", function (el) {
        return el.name;
      })
      .html(function (el) {
        return "<h3 class='list-group-item-heading'><a href='" + el.url + "'>" + el.name + "</a></h3><div class='testResults'></div>";
      });

    unstableProjects.order();

    unstableProjects.exit().remove();

    render.renderTestresults(unstableProjects.select(".testResults"));

    d3.selectAll("#projects .loading").remove();
  };

  return my;
});