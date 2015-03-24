var whereIsMyBuild = function ($, d3) {
  var my = {
    width: $(window).width() - 25,
    height: 2000,
    jenkinsUrl: "http://localhost:8080",
    startJob: "chain-start",
    updateInterval: 2000,
    commitUpdateInterval: 20000,
    bulkUpdateSize: 10
  };


  var data;
  var changes = {
    commits: []
  };
  var needsUpdate = true;

  changes.commits = [
    {
      commitId: "1234660",
      user: "Menninger Alexander, GF Öffentliche Sicherheit & Ordnung",
      msg: "Some commit"
    },
    {
      commitId: "1234661",
      user: "wolfs",
      msg: "Some other commit"
    },
    {
      commitId: "1234662",
      user: "wolfs",
      msg: "Some other commit"
    },
    {
      commitId: "1234663",
      user: "wolfs",
      msg: "Some other commit"
    },
    {
      commitId: "1234664",
      user: "wolfs",
      msg: "Some other commit"
    },
    {
      commitId: "1234665",
      user: "wolfs",
      msg: "Some other commit"
    },
    {
      commitId: "1234666",
      user: "wolfs",
      msg: "Some other commit"
    },
    {
      commitId: "1234667",
      user: "wolfs",
      msg: "Some other commit"
    },
    {
      commitId: "1234668",
      user: "wolfs",
      msg: "Some other commit"
    },
    {
      commitId: "1234669",
      user: "wolfs",
      msg: "Some other commit"
    },
    {
      commitId: "1234670",
      user: "wolfs",
      msg: "Some other commit"
    },
    {
      commitId: "1234671",
      user: "wolfs",
      msg: "Some other commit"
    },
    {
      commitId: "1234672",
      user: "wolfs",
      msg: "Some other commit"
    },
    {
      commitId: "1234671",
      user: "wolfs",
      msg: "Some other commit"
    },
    {
      commitId: "1234673",
      user: "wolfs",
      msg: "Some other commit"
    },
    {
      commitId: "1234674",
      user: "wolfs",
      msg: "Some other commit"
    }
  ];

  var updateChanges = function () {
    var jobRequest = $.getJSON(
      my.jenkinsUrl + "/job/" + my.startJob + "/api/json?tree=builds[changeSet[*[*]]]{,10}"
    );
    jobRequest.then(function (job) {
      var builds = job.builds;

      //changes.commits = builds.map(function (build) {
      //    return build.changeSet.items;
      //}).reduce(function (a, b) {
      //    return a.concat(b);
      //});

      $(changes).trigger("change");
    });
  };

  var getQueryVariable = function (variable) {
    var query = window.location.search.substring(1),
      results = query.split("&").map(function (el) {
        return el.split("=")
      }).filter(function (el) {
        return (el[0] === variable);
      }).map(function (el) {
        return el[1];
      });
    return results.length === 0 ? false : results[0];
  };

  var baseBuildNode = {
    getNewFailCount: function () {
      if (this.newFailCount) {
        return this.newFailCount;
      }
      return 0;
    }

  };

  var buildNode = function (jobName, revision, url) {
    var n = Object.create(baseBuildNode);
    n.jobName = jobName;
    n.revision = revision;
    n.url = url;
    n.status = "pending";
    n.downstreamProjects = [];

    return n;
  };

  var toUpdate = [];

  var renderer = function (conf, data) {
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
      var nodes = cluster.nodes(data);

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
  };

  var changesRenderer = function (changes) {
    return {
      renderChanges: function () {
        var revisions = d3.select("#commits").selectAll(".revision").data(changes.commits, function (d) {
          return d.commitId;
        });

        revisions.enter()
          .append("a")
          .attr("href", function (el) {
            return "?revision=" + el.commitId
          })
          .attr("name", function (el) {
            return el.commitId
          })
          .attr("class", "revision list-group-item")
          .html(function (el) {
            return "<h4 class='list-group-item-heading'>" + el.commitId + " - " + el.user + "</h4><p class='list-group-item-text'>" + el.msg.replace("\n", "<br />") + "</p>";
          });

        revisions.order();

        revisions.exit().remove();

        d3.selectAll(".loading").remove();
      }
    }
  };

  var buildData = function (nodeToUpdate) {
    var jobName = nodeToUpdate.jobName;
    var resultDef = $.Deferred();
    var findRevision = function (envVars) {
      var revision = envVars["REV"];
      return revision === undefined ? undefined : parseInt(revision, 10);
    };

    var nodeFromProject = function (project) {
      return buildNode(project.name, nodeToUpdate.revision, project.url);
    };

    var buildKeys =
      "number,url,result,actions[triggeredProjects[name,url,downstreamProjects[url,name]],failCount,skipCount,totalCount,urlName]";

    var jobRequest = $.getJSON(
      my.jenkinsUrl + "/job/" + jobName +
      "/api/json?tree=url,downstreamProjects[url,name],lastCompletedBuild[" + buildKeys + "]"
    ).then(function (job) {
        return job;
      });

    var buildDef = jobRequest.then(function (job) {
      if (nodeToUpdate.url === undefined) {
        nodeToUpdate.url = job.url;
        $(data).trigger("change");
      }
      return job.lastCompletedBuild;
    });

    var getEnvVars = function (build) {
      return build === undefined ? undefined : $.getJSON(build.url +
      "injectedEnvVars/api/json?tree=envMap[*]");
    };
    var getRevision = function (build) {
      if (build === undefined) {
        return undefined;
      }
      return getEnvVars(build).then(function (envVars) {
        return findRevision(envVars.envMap)
      })
    };

    var buildUrl = function (buildNumber) {
      return my.jenkinsUrl + "/job/" + nodeToUpdate.jobName + "/" + buildNumber +
        "/api/json?tree=" + buildKeys;
    };

    var getBuildDef = function (buildNumber) {
      return $.getJSON(buildUrl(buildNumber)).then(function (build) {
        return build;
      });
    };

    var getPreviousBuildDef = function (build) {
      if (build === undefined) {
        return undefined;
      }
      return build ? (build.number > 1 ? getBuildDef(build.number - 1) : undefined) : undefined;
    };

    var buildForRevision = function (buildDef, revisionDef) {
      var prevBuildDef = buildDef.then(getPreviousBuildDef);
      var prevRevisionDef = prevBuildDef.then(getRevision);
      return $.when(buildDef, revisionDef, prevBuildDef, prevRevisionDef)
        .then(function (build, revision, prevBuild, prevRevision) {
          if (build === undefined) {
            return undefined;
          }
          if (prevBuild === undefined) {
            prevBuild = build;
          }
          build.revision = revision;
          prevBuild.revision = prevRevision;

          if (revision < nodeToUpdate.revision) {
            if(build.result == "ABORTED") {
              build.prevBuild = prevBuild;
              return build;
            }
            return undefined;
          } else if (revision >= nodeToUpdate.revision && nodeToUpdate.revision > prevRevision && prevBuild.result != "ABORTED") {
              build.prevBuild = prevBuild;
              return build;
          } else {
            return buildForRevision(prevBuildDef, prevRevisionDef)
              .then(function (previousBuild) {
                if (previousBuild === undefined) {
                  return build;
                } else {
                  if(previousBuild.result == "ABORTED")
                  {
                    build.prevBuild = previousBuild.prevBuild;
                    return build;
                  }
                  return previousBuild;
                }
              })
          }
        });
    };

    var getTriggeredProjects = function (build) {
      return build.actions.filter(function (el) {
        return el.triggeredProjects;
      }).map(function (el) {
        return el.triggeredProjects;
      }).reduce(function (a, b) {
        return a.concat(b);
      }, []);
    };

    var getTestResult = function (build) {
      var actions = build.actions;

      var testReports = actions.filter(function (action) {
        return action.urlName === "testReport";
      });

      if (testReports.length > 0) {
        return testReports[0];
      }
      return {
        failCount: 0,
        skipCount: 0,
        totalCount: 0
      };
    };

    var foundBuildDef = buildForRevision(buildDef, buildDef.then(getRevision));

    $.when(foundBuildDef).then(function (build) {
      if (build === undefined) {
        toUpdate.push(nodeToUpdate);
        resultDef.resolve(nodeToUpdate);
      } else {
        nodeToUpdate.status = build.result.toLowerCase();
        nodeToUpdate.revision = build.revision;
        nodeToUpdate.previousRevision = build.prevBuild.revision;
        nodeToUpdate.url = build.url;
        nodeToUpdate.testResult = getTestResult(build);
        if (build.prevBuild !== undefined) {
          var previousTestResult = getTestResult(build.prevBuild);
          nodeToUpdate.newFailCount = nodeToUpdate.testResult.failCount - previousTestResult.failCount;
        }

        var triggeredProjects = getTriggeredProjects(build);
        var children = triggeredProjects.map(function (project) {
          var node = nodeFromProject(project);
          node.downstreamProjects = project.downstreamProjects.map(nodeFromProject);
          return node;
        });

        children.map(buildData);
        nodeToUpdate.downstreamProjects.map(buildData);

        nodeToUpdate.children = children;

        $(data).trigger("change");

        resultDef.resolve(nodeToUpdate);
      }
    }, function () {
      toUpdate.push(nodeToUpdate);
    });

    return resultDef;
  };

  var updateNext = function () {
    if (toUpdate.length > 0) {
      var toUpdateNow = toUpdate.slice(0, my.bulkUpdateSize);
      toUpdate = toUpdate.slice(my.bulkUpdateSize);
      toUpdateNow.map(buildData);
    }
  };

  my.init = function () {
    var revisionString = getQueryVariable("revision"),
      r,
      changesR = changesRenderer(changes);

    if (revisionString) {
      data = buildNode(my.startJob, parseInt(revisionString, 10));
      r = renderer(this, data);
      toUpdate.push(data);


      $(data).bind("change", function () {
        needsUpdate = true;
        setTimeout(function () {
          if (needsUpdate) {
            r.renderData();
            needsUpdate = false;
          }
        }, 0);
      });
      $(data).trigger("change");
      updateNext();
      setInterval(updateNext, my.updateInterval);
    }

    $(changes).bind("change", changesR.renderChanges);
    updateChanges();
    setInterval(updateChanges, my.commitUpdateInterval);

    //setTimeout(function () {
    //  changes.commits.splice(0, 0,
    //    {
    //      commitId: "1234664",
    //      user: "wolfs",
    //      msg: "Some third commit"
    //    },
    //    {
    //      commitId: "1234663",
    //      user: "wolfs",
    //      msg: "Some third commit"
    //    }
    //  );
    //  //changes.commits.pop();
    //}, 5000);
  };

  return my;

}($, d3);