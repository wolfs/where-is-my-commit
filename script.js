var whereIsMyBuild = function () {
    var my = {
        width: 960,
        height: 2000,
        jenkinsUrl: "http://localhost:8080",
        startJob: "chain-start",
        updateInterval: 2000,
        renderInterval: 2000
    };


    var data;

    var getQueryVariable = function (variable) {
        var query = window.location.search.substring(1),
            results = query.split("&").map(function (el) {
                return el.split("=")
            }).filter(function (el) {
                return (el[0] == variable);
            }).map(function (el) {
                return el[1];
            });
        return results.length == 0 ? false : results[0];
    };

    var baseBuildNode = {
        getName: function () {
            return this.jobName + " - " + this.revision
        }
    };

    var buildNode = function (jobName, revision, url) {
        var n = Object.create(baseBuildNode);
        n.jobName = jobName;
        n.revision = revision;
        n.url = url;
        n.status = "pending";

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
            .attr("transform", "translate(500,300)");

        d3.select(self.frameElement).style("height", conf.height + "px");

        my.renderData = function () {
            var nodes = cluster.nodes(data);
            var links = cluster.links(nodes);

            var link = svg.selectAll(".link")
                .data(links, function (d) {
                    return d.source.getName() + d.target.getName();
                });

            link.enter().insert("path", ".node")
                .attr("class", "link");

            link.transition().attr("d", diagonal);

            link.exit().remove();

            var node = svg.selectAll(".node")
                .data(nodes, function (d) {
                    return d.getName();
                });

            var arc = d3.svg.arc()
                .innerRadius(10)
                .outerRadius(20)
                .startAngle(0)
                .endAngle(Math.PI * 2);

            var parentNode = node.enter().append("g")
                .attr("class", "node");
            parentNode.append("circle")
                .attr("r", 20);
            parentNode.append("path")
                .attr("class", "pending")
                .attr("d", arc);


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

            var circles = node.selectAll("path")
                .attr("class", function (d) {
                    return d.status;
                });

            var blink = function () {
                circles.transition()
                    .duration(1000)
                    .style("opacity", function (d) {
                        return d.status === "pending" ? 0 : 1;
                    })
                    .each("end", function () {
                        d3.select(this)
                            .transition()
                            .duration(1000)
                            .style("opacity", 1)
                            .each("end", blink)
                    })
            };

            blink();

            node.selectAll("a text").transition()
                .attr("dy", 0)
                .style("text-anchor", "start");

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

        var buildKeys =
            "number,url,result,actions[triggeredProjects[name,url],failCount,skipCount,totalCount,urlName],changeSet[items[commitId,author,msg]]";

        var jobRequest = $.getJSON(
            my.jenkinsUrl + "/job/" + jobName +
            "/api/json?tree=lastCompletedBuild[" + buildKeys + "]"
        );

        var buildDef = jobRequest.then(function (job) {
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
                        return buildForRevision($.getJSON(
                                my.jenkinsUrl + "/job/" + jobName + "/" + (build.number - 1) +
                                "/api/json?tree=" + buildKeys)
                            .then(function (build) {
                                return build;
                            })).then(function (previousBuild) {
                            if (previousBuild == undefined) {
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

        var getTestResults = function (build) {
            var actions = build.actions;
            var i;
            var action;
            for (i = 0; i < actions.length; i++) {
                action = actions[i];
                if (action.urlName === "testReport") {
                    return action;
                }
            }
            return {
                failCount: 0,
                skipCount: 0,
                totalCount: 0
            };
        };

        buildForRevision(buildDef).then(function (build) {
            if (build == undefined) {
                toUpdate.push(nodeToUpdate);
                resultDef.resolve(nodeToUpdate);
            } else {
                nodeToUpdate.status = build.result.toLowerCase();
                nodeToUpdate.revision = build.revision;
                nodeToUpdate.url = build.url;

                var triggeredProjects = getTriggeredProjects(build);
                var children = $.map(triggeredProjects, function (job) {
                    return buildNode(job.name, nodeToUpdate.revision, job.url);
                });
                var deferreds = $.map(children, function (buildNode) {
                    return buildData(buildNode);
                });

                nodeToUpdate.children = children;

                resultDef.resolve(nodeToUpdate);
            }
        }, function () {
            toUpdate.push(nodeToUpdate);
        });

        return resultDef;
    };

    var updateNext = function () {
        if (toUpdate.length > 0) {
            var current = toUpdate.shift();
            buildData(current);
        }
    };

    my.init = function () {
        data = buildNode(my.startJob, parseInt(getQueryVariable("revision"), 10));
        toUpdate.push(data);

        var r = renderer(this, data);

        updateNext();
        r.renderData();

        setInterval(updateNext, my.updateInterval);

        setInterval(r.renderData, my.renderInterval)
    };

    return my;

}();
