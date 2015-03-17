var whereIsMyBuild = function ($, d3) {
    var my = {
        width: 960,
        height: 2000,
        jenkinsUrl: "http://localhost:8080",
        startJob: "chain-start",
        updateInterval: 2000
    };


    var data;
    var needsUpdate = true;

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
            .attr("transform", "translate(" + (conf.width/2) + ",300)");

        d3.select(self.frameElement).style("height", conf.height + "px");

        my.renderData = function () {
            var nodes = cluster.nodes(data);
            var links = cluster.links(nodes);

            var link = svg.selectAll(".link")
                .data(links, function (d) {
                    return d.source.jobName + d.target.jobName;
                });

            link.enter().insert("path", ".node")
                .attr("class", "link");

            link.transition().attr("d", diagonal);

            link.exit().remove();

            var node = svg.selectAll(".node")
                .data(nodes, function (d) {
                    return d.jobName;
                });

            var addBuildNode = function(node, radius) {
                var arc = d3.svg.arc()
                    .innerRadius(radius / 2)
                    .outerRadius(radius)
                    .startAngle(0)
                    .endAngle(Math.PI * 2);

                node.append("circle")
                    .attr("r", radius);
                node.append("path")
                    .attr("d", arc);
                node.append("text")
                    .style("text-anchor", "middle")
                    .attr("dy", "0.3em")
                    .attr("class", "testcount");
            };

            var parentNode = node.enter().append("g")
                .attr("class", "node");

            addBuildNode(parentNode, 20);

            var downstreamNodes = node.selectAll(".downstream").data(function (coreNode) {
                return coreNode.downstreamProjects;
            }, function (project) {
                return project.jobName;
            });

            var downstreamContainer = downstreamNodes.enter()
                .append("a")
                .attr("class", "downstream")
                .attr("xlink:href", function (d) {
                    return d.url;
                })
                .attr("transform", function (d, i) {
                    return "rotate(" + (-10 + 35 * i) + ")translate(-40,0)";
                });
            addBuildNode(downstreamContainer, 10);
            downstreamContainer.append("text").text(function (d) {
                var parentData = d3.select(this.parentNode.parentNode).datum();
                return d.jobName.replace(new RegExp(parentData.jobName + '(-|~~)*'), '').split('-').map(function (s) { return s[0] }).join('');
            }).attr("text-anchor", "end").attr("dx", "-15");

            var downstream = downstreamNodes.selectAll("path")
                .attr("class", function (d) {
                    return d.status;
                });

            downstreamNodes.exit().remove();

            var textNode = parentNode.append("a")
                .attr("transform", "rotate(10)")
                .append("text");

            var dxChildren = function () {
                return 40;
            };

            textNode
                .append("tspan")
                .text(function (d) {
                    return d.jobName;
                });

            textNode
                .append("tspan")
                .attr("class", "revision")
                .attr("dy", "1.2em")
                .text(function (d) {
                    return d.revision
                });

            node.selectAll("a")
                .attr("xlink:href", function (d) {
                    return d.url
                });


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

            node.selectAll("a text").transition()
                .attr("dy", 0);

            downstreamNodes.selectAll("text").style("text-anchor", "end").attr("dy", "0.5em");

            node.selectAll("a text tspan.revision").transition()
                .text(function (d) {
                    return d.revision;
                });

            node.transition().attr("transform", function (d) {
                return "translate(" + d.x + "," + d.y + ")";
            });

            node.exit().remove();
        };

        return my;
    };


    var buildData = function (nodeToUpdate) {
        var jobName = nodeToUpdate.jobName;
        var resultDef = $.Deferred();
        var findRevision = function (envVars) {
            for (var i = 0; i < envVars.length; i++) {
                var env = envVars[i];
                if (env.name === "REV") {
                    return parseInt(env.value, 10);
                }
            }
        };

        var nodeFromProject = function(project) {
            return buildNode(project.name, nodeToUpdate.revision, project.url);
        };

        var buildKeys =
            "number,url,result,actions[triggeredProjects[name,url,downstreamProjects[url,name]],failCount,skipCount,totalCount,urlName],changeSet[items[commitId,author,msg]]";

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
                "injectedEnvVars/export");
        };
        var getRevision = function (build) {
            if (build === undefined) {
                return undefined;
            }
            return getEnvVars(build).then(function (envVars) {
                return findRevision(envVars.envVars.envVar)
            })
        };
        buildDef.then(getEnvVars);

        var buildUrl = function (buildNumber) {
            return my.jenkinsUrl + "/job/" + nodeToUpdate.jobName + "/" + buildNumber +
                                "/api/json?tree=" + buildKeys;
        };

        var getBuildDef = function (buildNumber) {
            return $.getJSON(buildUrl(buildNumber)).then(function (build) {
                return build;
            });
        };

        var buildForRevision = function (buildDef) {
            return $.when(buildDef, buildDef.then(getRevision)).then(
                function (build, revision) {
                    if (build === undefined) {
                        return undefined;
                    }
                    build.revision = revision;
                    if (revision < nodeToUpdate.revision) {
                        return undefined;
                    } else if (revision === nodeToUpdate.revision) {
                        return build;
                    } else {
                        return buildForRevision(getBuildDef(build.number - 1))
                            .then(function (previousBuild) {
                            if (previousBuild === undefined) {
                                return build;
                            } else {
                                return previousBuild;
                            }
                        })
                    }
                })
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

        var foundBuildDef = buildForRevision(buildDef);

        var previousBuildDef = foundBuildDef.then(function (build) {
            return build ? (build.number > 1 ? getBuildDef(build.number - 1) : undefined) : undefined;
        });

        $.when(foundBuildDef, previousBuildDef).then(function (build, previousBuild) {
            if (build === undefined) {
                toUpdate.push(nodeToUpdate);
                resultDef.resolve(nodeToUpdate);
            } else {
                nodeToUpdate.status = build.result.toLowerCase();
                nodeToUpdate.revision = build.revision;
                nodeToUpdate.url = build.url;
                nodeToUpdate.testResult = getTestResult(build);
                if (previousBuild !== undefined) {
                    var previousTestResult = getTestResult(previousBuild);
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
            var toUpdateNow = toUpdate.slice(0, 4);
            toUpdate = toUpdate.slice(5);
            toUpdateNow.map(buildData);
        }
    };

    my.init = function () {
        data = buildNode(my.startJob, parseInt(getQueryVariable("revision"), 10));
        toUpdate.push(data);

        var r = renderer(this, data);

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
    };

    return my;

}($, d3);
