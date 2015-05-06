define('changes/changes', [], { commits: [] });
define('changes/changesRenderer', [
    'changes/changes',
    'd3'
], function (changes, d3) {
    'use strict';
    var my = {};
    my.render = function () {
        var revisions = d3.select('#commits').selectAll('.revision').data(changes.commits, function (d) {
            return d.commitId;
        });
        revisions.enter().append('li').attr('role', 'presentation').attr('class', 'revision').append('a').attr('href', function (el) {
            return '?revision=' + el.commitId;
        }).attr('role', 'menuitem').attr('name', function (el) {
            return el.commitId;
        }).attr('class', 'list-group-item').html(function (el) {
            return '<h4 class=\'list-group-item-heading\'>' + el.commitId + ' - ' + el.user + '</h4><p class=\'list-group-item-text\'>' + el.msg.replace('\n', '<br />') + '</p>';
        });
        revisions.order();
        revisions.exit().remove();
        d3.selectAll('#commits .loading').remove();
    };
    return my;
});
define('app-config', ['jquery'], function ($) {
    'use strict';
    var globalConfig = window.whereIsMyCommit || {};
    return {
        width: globalConfig.width || $('#graph').width(),
        height: globalConfig.height || 2000,
        jenkinsUrl: globalConfig.jenkinsUrl || 'http://localhost:8080',
        startJob: globalConfig.startJob || 'chain-start',
        updateInterval: globalConfig.updateInterval || 2000,
        commitUpdateInterval: globalConfig.commitUpdateInterval || 20000,
        bulkUpdateSize: globalConfig.bulkUpdateSize || 10
    };
});
define('changes/changesUpdater', [
    'changes/changes',
    'app-config',
    'jquery'
], function (changes, config, $) {
    'use strict';
    var my = {};
    my.update = function () {
        var jobRequest = $.getJSON(config.jenkinsUrl + '/job/' + config.startJob + '/api/json?tree=builds[changeSet[*[*]]]{,10}');
        jobRequest.then(function (job) {
            var builds = job.builds;
            changes.commits = builds.map(function (build) {
                return build.changeSet.items;
            }).reduce(function (a, b) {
                return a.concat(b);
            });
            $(changes).trigger('change');
        });
    };
    return my;
});
define('changes/changesController', [
    'changes/changes',
    'changes/changesRenderer',
    'changes/changesUpdater',
    'app-config',
    'jquery'
], function (changes, renderer, updater, config, $) {
    'use strict';
    var my = {};
    my.init = function () {
        $(changes).bind('change', renderer.render);
        updater.update();
        setInterval(updater.update, config.commitUpdateInterval);
    };
    return my;
});
define('builds/node', [], function () {
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
        n.status = 'pending';
        n.downstreamProjects = [];
        return n;
    };
    return my;
});
define('util', [], {
    getQueryVariable: function (variable) {
        'use strict';
        var search = window.location.search;
        return this.getQueryVariableFromSearch(variable, search);
    },
    getQueryVariableFromSearch: function (variable, search) {
        'use strict';
        var query = search.substring(1);
        var results = query.split('&').map(function (el) {
            return el.split('=');
        }).filter(function (el) {
            return el[0] === variable;
        }).map(function (el) {
            return el[1];
        });
        return results.length === 0 ? false : results[0];
    }
});
define('builds/nodesData', [
    'builds/node',
    'app-config',
    'util'
], function (node, config, util) {
    'use strict';
    var my = {};
    var toUpdate = [];
    var revisionString = util.getQueryVariable('revision');
    my.scheduleUpdate = function (node) {
        toUpdate.push(node);
    };
    my.updateNextNodes = function (updateFunction) {
        if (toUpdate.length > 0) {
            var toUpdateNow = toUpdate.slice(0, config.bulkUpdateSize);
            toUpdate = toUpdate.slice(config.bulkUpdateSize);
            toUpdateNow.map(updateFunction);
        }
    };
    my.revision = parseInt(revisionString, 10);
    my.data = node.create(config.startJob, my.revision);
    return my;
});
define('builds/nodesRenderer', [
    'app-config',
    'builds/nodesData',
    'd3'
], function (conf, nodesData, d3) {
    'use strict';
    var my = {};
    var cluster = d3.layout.tree().nodeSize([
        200,
        200
    ]);
    var diagonal = d3.svg.diagonal().projection(function (d) {
        return [
            d.x,
            d.y
        ];
    });
    var width = $('#graph').width();
    var canvas = d3.select('#graph').append('svg').attr('width', width).attr('height', conf.height);
    var svg = canvas.append('g').attr('transform', 'translate(' + width / 2 + ',200)');
    d3.select(self.frameElement).style('height', conf.height + 'px');
    var jobName = function (job) {
        return job.jobName;
    };
    var jobUrl = function (job) {
        return job.url;
    };
    var addBuildNode = function (node, radius, cssClass) {
        var arc = d3.svg.arc().innerRadius(radius / 2).outerRadius(radius).startAngle(0).endAngle(Math.PI * 2);
        node.append('circle').attr('r', radius);
        node.append('path').attr('class', cssClass).attr('d', arc);
        node.append('text').style('text-anchor', 'middle').attr('dy', '0.3em').attr('class', 'testcount');
    };
    var renderFailedTests = function (nodes) {
        var unstableNodes = nodes.reduce(function (acc, node) {
            return acc.concat([node], node.downstreamProjects);
        }, []).filter(function (node) {
            return node.status === 'unstable';
        });
        var unstableProjects = d3.select('#projects').selectAll('.unstableProject').data(unstableNodes, jobName);
        unstableProjects.enter().append('a').attr('class', 'list-group-item unstableProject').attr('href', function (el) {
            return el.url;
        }).attr('name', function (el) {
            return el.projectName;
        }).html(function (el) {
            return '<h3 class=\'list-group-item-heading\'>' + el.jobName + '</h3><div class=\'testResults\'></div>';
        });
        unstableProjects.order();
        unstableProjects.exit().remove();
        var suiteResults = unstableProjects.select('.testResults').selectAll('.suiteResult').data(function (node) {
            return node.testResult.failedTests || [];
        }, function (test) {
            return test.name + '-' + test.className;
        });
        suiteResults.enter().append('div').attr('class', 'suiteResult').append('div').attr('class', 'list-group-item').html(function (test) {
            return '<h5 class=\'list-group-item-heading\'>' + test.name + '</h5>';
        });
        suiteResults.selectAll('.testResult div').data(function (suite) {
            return suite.cases;
        }, function (testCase) {
            return testCase.name;
        }).enter().append('div').attr('class', 'testResult list-group-item').html(function (testCase) {
            return '<h6 class="list-group-item-heading">' + testCase.name + '</h6>' + (testCase.errorDetails !== null ? '<small>' + testCase.errorDetails + '</small>' : '');
        });
        var warnings = unstableProjects.select('.testResults').selectAll('.warning').data(function (node) {
            return node.warnings || [];
        });
        warnings.enter().append('div').attr('class', 'warning').html(function (warning) {
            return '<div class=\'list-group-item\'><h5 class=\'list-group-item-heading\'>' + warning + '</h5>' + '</div>';
        });
        d3.selectAll('#projects .loading').remove();
    };
    my.renderData = function () {
        var nodes = cluster.nodes(nodesData.data);
        var maxY = nodes.reduce(function (acc, current) {
            return Math.max(acc, current.y);
        }, 400);
        var width = $('#graph').width();
        canvas.attr('height', maxY + 400 + 'px').attr('width', width);
        svg.attr('transform', 'translate(' + width / 2 + ',200)');
        var links = cluster.links(nodes);
        var link = svg.selectAll('.link').data(links, function (d) {
            return d.source.jobName + '->' + d.target.jobName;
        });
        link.enter().insert('path', '.node').attr('class', 'link');
        link.transition().attr('d', diagonal);
        link.exit().remove();
        var node = svg.selectAll('.node').data(nodes, jobName);
        var parentNode = node.enter().append('g').attr('class', 'node');
        var coreNode = parentNode.append('a');
        var textNode = coreNode.append('text').attr('transform', 'rotate(10)').attr('class', 'core');
        addBuildNode(coreNode, 20, 'core');
        var dxChildren = function () {
            return 40;
        };
        textNode.append('tspan').text(jobName);
        textNode.append('tspan').attr('class', 'revision').attr('dy', '1.2em').text(function (d) {
            return d.revision;
        });
        var downstreamNodes = node.selectAll('.downstream').data(function (coreNode) {
            return coreNode.downstreamProjects;
        }, jobName);
        var downstreamContainer = downstreamNodes.enter().append('a').attr('class', 'downstream').attr('transform', function (d, i) {
            return 'rotate(' + (-10 + 35 * i) + ')translate(-40,0)';
        });
        addBuildNode(downstreamContainer, 10, 'downstream');
        downstreamContainer.append('text').text(function (d) {
            var parentData = d3.select(this.parentNode.parentNode).datum();
            return d.jobName.replace(new RegExp(parentData.jobName + '(-|~~)*'), '').split('-').map(function (s) {
                return s[0];
            }).join('');
        }).attr('text-anchor', 'end').attr('dx', '-15').attr('dy', '0.3em');
        downstreamNodes.exit().remove();
        node.selectAll('a').attr('xlink:href', jobUrl);
        node.selectAll('a text tspan').attr('x', '0').attr('dx', dxChildren);
        node.selectAll('text.testcount').text(function (d) {
            var newFailCount = d.getNewFailCount();
            return newFailCount === 0 ? undefined : newFailCount > 0 ? '+' + newFailCount : newFailCount;
        }).classed('worse', function (d) {
            return d.getNewFailCount() > 0;
        }).classed('better', function (d) {
            return d.getNewFailCount() < 0;
        });
        node.selectAll('path').attr('class', function (d) {
            return d.status;
        });
        node.selectAll('a text.core').transition().attr('dy', 0);
        node.selectAll('a text tspan.revision').transition().text(function (d) {
            return d.revision;
        });
        node.selectAll('a').on('mouseenter', function (node) {
            d3.select('#commits').selectAll('.revision').classed('active', function (commit) {
                return node.revision >= commit.commitId && commit.commitId > node.previousRevision;
            });
        });
        node.selectAll('a').on('mouseleave', function () {
            d3.select('#commits').selectAll('.revision').classed('active', false);
        });
        node.transition().attr('transform', function (d) {
            return 'translate(' + d.x + ',' + d.y + ')';
        });
        node.exit().remove();
        renderFailedTests(nodes);
    };
    return my;
});
define('builds/nodeUpdater', [
    'jquery',
    'builds/node',
    'app-config',
    'builds/nodesData'
], function ($, node, config, nodes) {
    'use strict';
    var my = {};
    my.update = function (nodeToUpdate) {
        var jobName = nodeToUpdate.jobName;
        var resultDef = $.Deferred();
        var findRevision = function (envVars) {
            var revision = envVars.REV;
            return revision === undefined ? undefined : parseInt(revision, 10);
        };
        var nodeFromProject = function (project) {
            return node.create(project.name, nodeToUpdate.revision, project.url);
        };
        var buildKeys = 'number,url,result,actions[triggeredProjects[name,url,downstreamProjects[url,name]],failCount,skipCount,totalCount,urlName,name,result[warnings[message]]]';
        var jobRequest = $.getJSON(config.jenkinsUrl + '/job/' + jobName + '/api/json?tree=url,downstreamProjects[url,name],lastCompletedBuild[' + buildKeys + ']').then(function (job) {
            return job;
        });
        var buildDef = jobRequest.then(function (job) {
            if (nodeToUpdate.url === undefined) {
                nodeToUpdate.url = job.url;
                $(nodes.data).trigger('change');
            }
            return job.lastCompletedBuild;
        });
        var getEnvVars = function (build) {
            return build === undefined ? undefined : $.getJSON(build.url + 'injectedEnvVars/api/json?tree=envMap[REV]');
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
            return config.jenkinsUrl + '/job/' + nodeToUpdate.jobName + '/' + buildNumber + '/api/json?tree=' + buildKeys;
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
            return build ? build.number > 1 ? getBuildDef(build.number - 1) : undefined : undefined;
        };
        var buildForRevision = function (buildDef, revisionDef) {
            var prevBuildDef = buildDef.then(getPreviousBuildDef);
            var prevRevisionDef = prevBuildDef.then(getRevision);
            return $.when(buildDef, revisionDef, prevBuildDef, prevRevisionDef).then(function (build, revision, prevBuild, prevRevision) {
                if (build === undefined) {
                    return undefined;
                }
                if (prevBuild === undefined) {
                    prevBuild = build;
                }
                build.revision = revision;
                prevBuild.revision = prevRevision;
                if (revision < nodeToUpdate.revision) {
                    if (build.result === 'ABORTED') {
                        build.prevBuild = prevBuild;
                        return build;
                    }
                    return undefined;
                } else if (revision >= nodeToUpdate.revision && nodeToUpdate.revision > prevRevision && prevBuild.result !== 'ABORTED') {
                    build.prevBuild = prevBuild;
                    return build;
                } else {
                    return buildForRevision(prevBuildDef, prevRevisionDef).then(function (previousBuild) {
                        if (previousBuild === undefined) {
                            return build;
                        } else {
                            if (previousBuild.result === 'ABORTED') {
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
        var getTestResult = function (build) {
            var actions = build.actions;
            var testReports = actions.filter(function (action) {
                return action.urlName === 'testReport';
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
        var getWarnings = function (build) {
            var actions = build.actions;
            var warningsActions = actions.filter(function (action) {
                return action.name === 'findbugs';
            });
            return Array.prototype.concat.apply([], warningsActions.map(function (action) {
                return action.result.warnings.map(function (warning) {
                    return warning.message;
                });
            }));
        };
        var updateNodeToUpdateFromBuild = function (nodeToUpdate, build) {
            nodeToUpdate.status = build.result.toLowerCase();
            nodeToUpdate.revision = build.revision;
            nodeToUpdate.previousRevision = build.prevBuild.revision;
            nodeToUpdate.url = build.url;
            nodeToUpdate.testResult = getTestResult(build);
            nodeToUpdate.warnings = getWarnings(build);
            if (build.prevBuild !== undefined) {
                var previousTestResult = getTestResult(build.prevBuild);
                nodeToUpdate.newFailCount = nodeToUpdate.testResult.failCount - previousTestResult.failCount;
            }
            if (nodeToUpdate.status === 'unstable') {
                addTestResult();
            }
        };
        var addTestResult = function () {
            $.getJSON(nodeToUpdate.url + 'testReport/api/json?tree=suites[name,cases[age,className,name,status,errorDetails]]').then(function (testReport) {
                nodeToUpdate.testResult.failedTests = testReport.suites.map(function (suite) {
                    return {
                        name: suite.name,
                        cases: suite.cases.filter(function (test) {
                            return test.status !== 'PASSED' && test.status !== 'SKIPPED';
                        })
                    };
                }).filter(function (suite) {
                    return suite.cases.length > 0;
                });
                $(nodes.data).trigger('change');
            });
        };
        var foundBuildDef = buildForRevision(buildDef, buildDef.then(getRevision));
        $.when(foundBuildDef).then(function (build) {
            var isBuildUndefined = build === undefined || build.result.toLowerCase() == 'aborted';
            if (isBuildUndefined) {
                nodes.scheduleUpdate(nodeToUpdate);
            } else {
                updateNodeToUpdateFromBuild(nodeToUpdate, build);
                var triggeredProjects = getTriggeredProjects(build);
                var children = triggeredProjects.map(function (project) {
                    var node = nodeFromProject(project);
                    node.downstreamProjects = project.downstreamProjects.map(nodeFromProject);
                    return node;
                });
                children.map(my.update);
                nodeToUpdate.downstreamProjects.map(my.update);
                nodeToUpdate.children = children;
                $(nodes.data).trigger('change');
            }
            resultDef.resolve(nodeToUpdate);
        }, function () {
            nodes.scheduleUpdate(nodeToUpdate);
        });
        return resultDef;
    };
    return my;
});
define('builds/nodesController', [
    'builds/nodesData',
    'builds/nodesRenderer',
    'builds/nodeUpdater',
    'app-config',
    'jquery',
    'bootstrap'
], function (data, renderer, updater, config, $, bs) {
    'use strict';
    var viewNeedsUpdate = true, my = {};
    var updateNext = function () {
        data.updateNextNodes(updater.update);
    };
    var changeEvent = 'change';
    my.init = function () {
        if (data.revision) {
            data.scheduleUpdate(data.data);
            $(data.data).bind(changeEvent, function () {
                viewNeedsUpdate = true;
                setTimeout(function () {
                    if (viewNeedsUpdate) {
                        renderer.renderData();
                        viewNeedsUpdate = false;
                    }
                }, 0);
            });
            $(data.data).trigger(changeEvent);
            updateNext();
            setInterval(updateNext, config.updateInterval);
        }
        $(document).ready(function () {
            var revs = $('#revs');
            revs.on('show.bs.dropdown', function () {
                $('#graph').attr('class', 'col-md-offset-3 col-md-9');
                $(data.data).trigger(changeEvent);
            });
            revs.on('hide.bs.dropdown', function () {
                $('#graph').attr('class', 'col-md-12');
                $(data.data).trigger(changeEvent);
            });
        });
    };
    return my;
});
define('init', [
    'changes/changesController',
    'builds/nodesController'
], function (changes, nodes) {
    'use strict';
    changes.init();
    nodes.init();
});
require(['my-config'], function()
{});
require.config({
  baseUrl: '',
  paths: {
    jquery: 'jquery.min',
    d3: 'd3.min',
    bootstrap :  'bootstrap.min'
  },
  shim: {
    'bootstrap' : {
      "deps" :['jquery']
    }
  },
  deps: ['init']
});
