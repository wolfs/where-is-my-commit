webpackJsonp([1],[
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(1);
	__webpack_require__(30);


/***/ },
/* 1 */,
/* 2 */,
/* 3 */,
/* 4 */,
/* 5 */,
/* 6 */,
/* 7 */,
/* 8 */,
/* 9 */,
/* 10 */,
/* 11 */,
/* 12 */,
/* 13 */,
/* 14 */,
/* 15 */,
/* 16 */,
/* 17 */,
/* 18 */,
/* 19 */,
/* 20 */,
/* 21 */,
/* 22 */,
/* 23 */,
/* 24 */,
/* 25 */,
/* 26 */,
/* 27 */,
/* 28 */,
/* 29 */,
/* 30 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(31), __webpack_require__(35)], __WEBPACK_AMD_DEFINE_RESULT__ = function (changes, nodes) {
	  'use strict';
	  changes.init();
	  nodes.init();
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 31 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(32), __webpack_require__(33), __webpack_require__(34), __webpack_require__(21), __webpack_require__(15)], __WEBPACK_AMD_DEFINE_RESULT__ = function (changes, renderer, updater, config, $) {
	  'use strict';
	  var my = {};

	  my.init = function () {
	    $(changes).bind("change", renderer.render);
	    updater.update();
	    setInterval(updater.update, config.commitUpdateInterval);
	  };

	  return my;
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ },
/* 32 */
/***/ function(module, exports, __webpack_require__) {

	!(module.exports = {
	  commits: []
	});

/***/ },
/* 33 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(15), __webpack_require__(26), __webpack_require__(32), __webpack_require__(19)], __WEBPACK_AMD_DEFINE_RESULT__ = function ($, d3, changes, util) {
	  'use strict';
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
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ },
/* 34 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(32), __webpack_require__(21), __webpack_require__(15), __webpack_require__(19)], __WEBPACK_AMD_DEFINE_RESULT__ = function (changes, config, $, util) {
	  'use strict';
	  var my = {};

	  my.update = function () {

	    var startJob = util.getQueryVariable("startJob") || config.startJob,
	      jobRequest = $.getJSON(
	      config.jenkinsUrl + "/job/" + startJob + "/api/json?tree=builds[changeSet[*[*]]]{,10}"
	    );
	    jobRequest.then(function (job) {
	      var builds = job.builds;

	      changes.commits = builds.map(function (build) {
	        return build.changeSet.items;
	      }).reduce(function (a, b) {
	        return a.concat(b);
	      });

	      $(changes).trigger("change");
	    });
	  };

	  return my;
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ },
/* 35 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(19), __webpack_require__(36), __webpack_require__(38), __webpack_require__(39), __webpack_require__(21), __webpack_require__(15), __webpack_require__(17)], __WEBPACK_AMD_DEFINE_RESULT__ = function (util, data, renderer, updater, config, $, bs) {
	    'use strict';
	    var my = {};

	    var coreThrottler = util.newThrottler(config.bulkUpdateSize, config.coreUpdateInterval);
	    var throttler = util.newThrottler(config.bulkUpdateSize, config.updateInterval);
	    var updateFunction = updater.updateFunction(coreThrottler.scheduleUpdate, throttler.scheduleUpdate);

	    var changeEvent = "change";

	    my.init = function () {
	      if (data.revision) {
	        renderer.renderLoop();
	        coreThrottler.scheduleUpdate(function () {
	          updateFunction(data.data);
	        });
	      }

	      $(document).ready(function () {
	        var revs = $("#revs");
	        revs.on('show.bs.dropdown', function () {
	          $("#graph").attr("class", "col-md-offset-3 col-md-9");
	          $(data.data).trigger(changeEvent);
	        });
	        revs.on('hide.bs.dropdown', function () {
	          $("#graph").attr("class", "col-md-12");
	          $(data.data).trigger(changeEvent);
	        });
	      });
	    };
	    return my;
	  }.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ },
/* 36 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(37), __webpack_require__(21), __webpack_require__(19)], __WEBPACK_AMD_DEFINE_RESULT__ = function (node, config, util) {
	  'use strict';
	  var my = {};

	  var revisionString = util.getQueryVariable("revision"),
	    startJob = util.getQueryVariable("startJob") || config.startJob;

	  my.revision = parseInt(revisionString, 10);
	  my.data = node.create(startJob, my.revision);
	  my.event = "change";

	  return my;
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 37 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_RESULT__ = function () {
	  'use strict';
	  var my = {};

	  var baseBuildNode = {
	    getNewFailCount: function () {
	      if (this.newFailCount) {
	        return this.newFailCount;
	      }
	      return 0;
	    }

	  };
	  my.create = function (jobName, revision, url) {
	    var n = Object.create(baseBuildNode);
	    n.jobName = jobName;
	    n.revision = revision;
	    n.url = url;
	    n.status = "pending";

	    n.downstreamProjects = [];
	    return n;
	  };

	  return my;
	}.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ },
/* 38 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(21), __webpack_require__(36), __webpack_require__(27), __webpack_require__(26)], __WEBPACK_AMD_DEFINE_RESULT__ = function (conf, nodesData, render, d3) {
	  'use strict';
	  var my = {};

	  var cluster = d3.layout.tree().nodeSize([200, 200]);
	  var diagonal = d3.svg.diagonal()
	    .projection(function (d) {
	      return [d.x, d.y];
	    });

	  var width = ($("#graph").width());

	  var canvas = d3.select("#graph").append("svg")
	    .attr("width", width)
	    .attr("height", conf.height);

	  var svg = canvas
	    .append("g")
	    .attr("transform", "translate(" + (width / 2 ) + ",200)");

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

	  var renderFailedTests = function (nodes) {
	    var unstableNodes = nodes.reduce(function (acc, node) {
	      return acc.concat([node], node.downstreamProjects);
	    }, [])
	      .filter(function (node) {
	        return (node.status === "unstable");
	      });

	    var unstableProjects = d3.select("#projects").selectAll(".unstableProject").data(unstableNodes, jobName);

	    unstableProjects.enter()
	      .append("a")
	      .attr("class", "list-group-item unstableProject")
	      .attr("href", function (el) {
	        return el.url;
	      })
	      .attr("name", function (el) {
	        return el.projectName;
	      })
	      .html(function (el) {
	        return "<h3 class='list-group-item-heading'>" + el.jobName + "</h3><div class='testResults'></div>";
	      });

	    unstableProjects.order();

	    unstableProjects.exit().remove();

	    render.renderTestresults(unstableProjects.select(".testResults"));

	    d3.selectAll("#projects .loading").remove();
	  };

	  my.renderData = function () {
	    var nodes = cluster.nodes(nodesData.data);

	    var maxY = nodes.reduce(function (acc, current) {
	      return Math.max(acc, current.y);
	    }, 400);

	    var width = ($("#graph").width());

	    canvas.attr("height", (maxY + 400) + "px")
	      .attr("width", width);

	    svg.attr("transform", "translate(" + (width / 2 ) + ",200)");

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
	        return d.revision;
	      });

	    var downstreamNodes = node.selectAll(".downstream").data(function (coreNode) {
	      return coreNode.downstreamProjects.map(function (proj) { proj.num = coreNode.downstreamProjects.length; return proj });
	    }, jobName);

	    var downstreamContainer = downstreamNodes.enter()
	      .append("a")
	      .attr("class", "downstream")
	      .attr("transform", function (d, i) {
	        return "rotate(" + (-10 + i * Math.min(35, 360/(Math.max(1,d.num)))) + ")translate(" + (-Math.max(4 * d.num, 40)) + ",0)";
	      });

	    addBuildNode(downstreamContainer, 10, "downstream");

	    downstreamContainer
	      .append("text")
	      .text(function (d) {
	        var parentData = d3.select(this.parentNode.parentNode).datum();
	        return d.jobName.replace(new RegExp(parentData.jobName + '(-|~~)*'), '')
	          .split('-')
	          .map(function (s) {
	            return s[0];
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

	    renderFailedTests(nodes);
	  };

	  my.renderLoop = function () {
	    render.renderLoop(nodesData.data, nodesData.event, my.renderData);
	  };


	  return my;
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 39 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(15), __webpack_require__(37), __webpack_require__(21), __webpack_require__(36), __webpack_require__(24)], __WEBPACK_AMD_DEFINE_RESULT__ = function ($, node, config, nodes, buildInfo) {
	  'use strict';
	  var my = {};

	  my.updateFunction = function (scheduleWork, scheduleLowPrioWork) {
	    var scheduleUpdate = function (node) {
	      scheduleWork(function () {
	        my.updateFunction(scheduleWork, scheduleLowPrioWork)(node);
	      });
	    };

	    return function (nodeToUpdate) {
	      var jobName = nodeToUpdate.jobName;
	      var resultDef = $.Deferred();
	      var findRevision = function (envVars) {
	        var revision = envVars.REV;
	        return revision === undefined ? undefined : parseInt(revision, 10);
	      };

	      var nodeFromProject = function (project) {
	        return node.create(project.name, nodeToUpdate.revision, project.url);
	      };

	      var buildKeys = buildInfo.buildKeys([], ['triggeredProjects[name,url,downstreamProjects[url,name]]']);

	      var jobRequest = $.getJSON(
	        config.jenkinsUrl + "/job/" + jobName +
	        "/api/json?tree=url,downstreamProjects[url,name],lastCompletedBuild[" + buildKeys + "]"
	      ).then(function (job) {
	          return job;
	        });

	      var buildDef = jobRequest.then(function (job) {
	        if (nodeToUpdate.url === undefined) {
	          nodeToUpdate.url = job.url;
	          $(nodes.data).trigger("change");
	        }
	        return job.lastCompletedBuild;
	      });

	      var getEnvVars = function (build) {
	        return build === undefined ? undefined : $.getJSON(build.url +
	        "injectedEnvVars/api/json?tree=envMap[REV]");
	      };
	      var getRevision = function (build) {
	        if (build === undefined) {
	          return undefined;
	        }
	        return getEnvVars(build).then(function (envVars) {
	          return findRevision(envVars.envMap);
	        });
	      };

	      var buildUrl = function (buildNumber) {
	        return config.jenkinsUrl + "/job/" + nodeToUpdate.jobName + "/" + buildNumber +
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
	          .then(function (build, revision, prevBuildParam, prevRevision) {
	            if (build === undefined) {
	              return undefined;
	            }
	            var prevBuild = prevBuildParam === undefined ? build : prevBuildParam;
	            build.revision = revision;
	            prevBuild.revision = prevRevision;

	            if (revision < nodeToUpdate.revision) {
	              if (build.result === "ABORTED") {
	                build.prevBuild = prevBuild;
	                return build;
	              }
	              return undefined;
	            } else if (revision >= nodeToUpdate.revision && nodeToUpdate.revision > prevRevision && prevBuild.result !== "ABORTED") {
	              build.prevBuild = prevBuild;
	              return build;
	            } else {
	              return buildForRevision(prevBuildDef, prevRevisionDef)
	                .then(function (previousBuild) {
	                  if (previousBuild === undefined) {
	                    return build;
	                  } else {
	                    if (previousBuild.result === "ABORTED") {
	                      build.prevBuild = previousBuild.prevBuild;
	                      return build;
	                    }
	                    return previousBuild;
	                  }
	                });
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

	      var updateNodeToUpdateFromBuild = function (nodeToUpdate, build) {
	        nodeToUpdate.status = build.result.toLowerCase();
	        nodeToUpdate.revision = build.revision;
	        nodeToUpdate.previousRevision = build.prevBuild.revision;
	        nodeToUpdate.url = build.url;
	        nodeToUpdate.date = new Date(build.timestamp);
	        nodeToUpdate.testResult = buildInfo.getTestResult(build);
	        nodeToUpdate.warnings = buildInfo.getWarnings(build);
	        if (build.prevBuild !== undefined) {
	          var previousTestResult = buildInfo.getTestResult(build.prevBuild);
	          nodeToUpdate.newFailCount = nodeToUpdate.testResult.failCount - previousTestResult.failCount;
	        }
	        if (nodeToUpdate.status === "unstable" && nodeToUpdate.testResult.totalCount > 0) {
	          buildInfo.addFailedTests(nodeToUpdate, function (failedTests) {
	            nodeToUpdate.testResult.failedTests = failedTests;
	            $(nodes.data).trigger(nodes.event);
	          });
	        }
	      };

	      var foundBuildDef = buildForRevision(buildDef, buildDef.then(getRevision));

	      $.when(foundBuildDef).then(function (build) {
	        var isBuildUndefined = build === undefined || build.result.toLowerCase() == "aborted";
	        if (isBuildUndefined) {
	          scheduleUpdate(nodeToUpdate);
	        } else {
	          updateNodeToUpdateFromBuild(nodeToUpdate, build);

	          var triggeredProjects = getTriggeredProjects(build);
	          var children = triggeredProjects.map(function (project) {
	            var node = nodeFromProject(project);
	            node.downstreamProjects = project.downstreamProjects.map(nodeFromProject);
	            return node;
	          });

	          children.map(my.updateFunction(scheduleWork, scheduleLowPrioWork));
	          nodeToUpdate.downstreamProjects.map(my.updateFunction(scheduleLowPrioWork, scheduleLowPrioWork));

	          nodeToUpdate.children = children;

	          $(nodes.data).trigger(nodes.event);
	        }
	        resultDef.resolve(nodeToUpdate);
	      }, function () {
	        scheduleUpdate(nodeToUpdate);
	      });

	      return resultDef;
	    };
	  };

	  return my;
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ }
]);