define(['app/config', 'app/nodesData', 'd3'], function (conf, nodesData, d3) {
  var my = {};

  var cluster = d3.layout.tree().nodeSize([200, 200]);
  var diagonal = d3.svg.diagonal()
    .projection(function (d) {
      return [d.x, d.y];
    });

  var canvas = d3.select("body").append("svg")
    .attr("width", conf.width)
    .attr("height", conf.height);

  var svg = canvas
    .append("g")
    .attr("transform", "translate(" + ((conf.width + $("#revs").width()) / 2 )   + ",200)");

  d3.select(self.frameElement).style("height", conf.height + "px");

  var jobName = function (job) {
    return job.jobName;
  };

  var jobUrl = function (job) {
    return job.url;
  };

  var addBuildNode = function (node, radius, cssClass) {
    var arc = d3.svg.arc()
      .innerRadius(radius / 2)
      .outerRadius(radius)
      .startAngle(0)
      .endAngle(Math.PI * 2);

    node.append("circle")
      .attr("r", radius);
    node.append("path")
      .attr("class", cssClass)
      .attr("d", arc);
    node.append("text")
      .style("text-anchor", "middle")
      .attr("dy", "0.3em")
      .attr("class", "testcount");
  };

  my.renderData = function () {
    var nodes = cluster.nodes(nodesData.data);

    var maxY = nodes.reduce(function (acc, current) {
      return Math.max(acc, current.y);
    }, 400);

    canvas.attr("height", (maxY + 400) + "px");

    var links = cluster.links(nodes);

    var link = svg.selectAll(".link")
      .data(links, function (d) {
        return d.source.jobName + "->" + d.target.jobName;
      });

    link.enter().insert("path", ".node")
      .attr("class", "link");

    link.transition().attr("d", diagonal);

    link.exit().remove();

    var node = svg.selectAll(".node")
      .data(nodes, jobName);


    var parentNode = node.enter().append("g")
      .attr("class", "node");

    var coreNode = parentNode
      .append("a");

    var textNode = coreNode
      .append("text")
      .attr("transform", "rotate(10)")
      .attr("class", "core");


    addBuildNode(coreNode, 20, "core");
    var dxChildren = function () {
      return 40;
    };

    textNode
      .append("tspan")
      .text(jobName);

    textNode
      .append("tspan")
      .attr("class", "revision")
      .attr("dy", "1.2em")
      .text(function (d) {
        return d.revision
      });

    var downstreamNodes = node.selectAll(".downstream").data(function (coreNode) {
      return coreNode.downstreamProjects;
    }, jobName);

    var downstreamContainer = downstreamNodes.enter()
      .append("a")
      .attr("class", "downstream")
      .attr("transform", function (d, i) {
        return "rotate(" + (-10 + 35 * i) + ")translate(-40,0)";
      });

    addBuildNode(downstreamContainer, 10, "downstream");

    downstreamContainer
      .append("text")
      .text(function (d) {
        var parentData = d3.select(this.parentNode.parentNode).datum();
        return d.jobName.replace(new RegExp(parentData.jobName + '(-|~~)*'), '')
          .split('-')
          .map(function (s) {
            return s[0]
          })
          .join('');
      })
      .attr("text-anchor", "end")
      .attr("dx", "-15")
      .attr("dy", "0.3em");

    downstreamNodes.exit().remove();

    node.selectAll("a")
      .attr("xlink:href", jobUrl);


    node.selectAll("a text tspan")
      .attr("x", "0")
      .attr("dx", dxChildren);

    node.selectAll("text.testcount")
      .text(function (d) {
        var newFailCount = d.getNewFailCount();
        return newFailCount === 0 ? undefined : (newFailCount > 0 ? '+' + newFailCount : newFailCount);
      })
      .classed('worse', function (d) {
        return d.getNewFailCount() > 0;
      })
      .classed('better', function (d) {
        return d.getNewFailCount() < 0;
      });

    node.selectAll("path")
      .attr("class", function (d) {
        return d.status;
      });

    node.selectAll("a text.core").transition()
      .attr("dy", 0);

    node.selectAll("a text tspan.revision").transition()
      .text(function (d) {
        return d.revision;
      });

    node.selectAll("a").on("mouseenter", function (node) {
      d3.select("#commits").selectAll(".revision").classed("active", function (commit) {
        return node.revision >= commit.commitId && commit.commitId > node.previousRevision;
      });
    });
    node.selectAll("a").on("mouseleave", function () {
      d3.select("#commits").selectAll(".revision").classed("active", false);
    });

    node.transition().attr("transform", function (d) {
      return "translate(" + d.x + "," + d.y + ")";
    });

    node.exit().remove();
  };


  return my;
});
