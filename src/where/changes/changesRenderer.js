define(["jquery", "d3", "where/changes/changes", "common/util"], function ($, d3, changes, util) {
  "use strict";
  var my = {};

  my.render = function () {
    var revisions = d3.select("#commits").selectAll(".revision").data(changes.commits, function (d) {
      return d.commitId;
    });

    revisions.enter()
      .append("li")
      .attr("role", "presentation")
      .attr("class", "revision")
      .append("a")
      .attr("href", function (el) {
        var queryParams = util.queryVariables();
        queryParams.revision = el.commitId;
        return "?" + $.param(queryParams);
      })
      .attr("role", "menuitem")
      .attr("name", function (el) {
        return el.commitId;
      })
      .attr("class", "list-group-item")
      .html(function (el) {
        return "<h4 class='list-group-item-heading'>" + el.commitId + " - " + el.user + "</h4><p class='list-group-item-text'>" + el.msg.replace("\n", "<br />") + "</p>";
      });

    revisions.order();

    revisions.exit().remove();

    d3.selectAll("#commits .loading").remove();
  };

  return my;
});