define('optional', [], {
    load: function (moduleName, parentRequire, onload, config) {
        var onLoadSuccess = function (moduleInstance) {
            onload(moduleInstance);
        };
        var onLoadFailure = function (err) {
            var failedId = err.requireModules && err.requireModules[0];
            console.warn('Could not load optional module: ' + failedId);
            requirejs.undef(failedId);
            define(failedId, [], function () {
                return {};
            });
            parentRequire([failedId], onLoadSuccess);
        };
        parentRequire([moduleName], onLoadSuccess, onLoadFailure);
    }
});
define('where/changes/changes', [], { commits: [] });
define('where/changes/changesRenderer', [
    'where/changes/changes',
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
define('app-config', [
    'jquery',
    'optional!my-config'
], function ($, globalConfig) {
    'use strict';
    return {
        width: globalConfig.width || $('#graph').width(),
        height: globalConfig.height || 2000,
        jenkinsUrl: globalConfig.jenkinsUrl || 'http://localhost:8080',
        startJob: globalConfig.startJob || 'chain-start',
        updateInterval: globalConfig.updateInterval || 2000,
        commitUpdateInterval: globalConfig.commitUpdateInterval || 20000,
        bulkUpdateSize: globalConfig.bulkUpdateSize || 10,
        filterWarnings: globalConfig.filterWarnings || []
    };
});
define('where/changes/changesUpdater', [
    'where/changes/changes',
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
define('where/changes/changesController', [
    'where/changes/changes',
    'where/changes/changesRenderer',
    'where/changes/changesUpdater',
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
define('common/util', [], {
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
    },
    newThrottler: function (updateFunction, bulkUpdateSizeParam, updateIntervalParam) {
        var throttler = {}, toUpdate = [], currentTimer, timerRunning = false, bulkUpdateSize = bulkUpdateSizeParam || 10, updateInterval = updateIntervalParam || 2000;
        var startTimer = function () {
            updateNext();
            currentTimer = setInterval(function () {
                if (toUpdate.length === 0) {
                    clearInterval(currentTimer);
                    timerRunning = false;
                } else {
                    updateNext();
                }
            }, updateInterval);
            timerRunning = true;
        };
        var startTimerIfNecessary = function () {
            if (!timerRunning) {
                startTimer();
            }
        };
        var updateNext = function () {
            if (toUpdate.length > 0) {
                var toUpdateNow = toUpdate.slice(0, bulkUpdateSize);
                toUpdate = toUpdate.slice(bulkUpdateSize);
                toUpdateNow.forEach(updateFunction);
            }
        };
        throttler.scheduleUpdate = function (node) {
            toUpdate.push(node);
            startTimerIfNecessary();
        };
        throttler.scheduleUpdates = function (nodes) {
            nodes.forEach(throttler.scheduleUpdate);
        };
        return throttler;
    }
});
define('where/builds/node', [], function () {
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
define('where/builds/nodesData', [
    'where/builds/node',
    'app-config',
    'common/util'
], function (node, config, util) {
    'use strict';
    var my = {};
    var revisionString = util.getQueryVariable('revision');
    my.revision = parseInt(revisionString, 10);
    my.data = node.create(config.startJob, my.revision);
    my.event = 'change';
    return my;
});
define('common/render', [], function () {
    'use strict';
    var my = {};
    my.renderTestresults = function (projectSelection) {
        var suiteResults = projectSelection.selectAll('.suiteResult').data(function (node) {
            return node.testResult.failedTests || [];
        }, function (test) {
            return test.name + '-' + test.className;
        });
        suiteResults.enter().append('div').attr('class', 'suiteResult').append('div').attr('class', 'list-group-item').html(function (test) {
            return '<h5 class=\'list-group-item-heading\'><a href=\'' + test.url + '\'>' + test.name + '</a></h5>';
        });
        var hull = suiteResults.selectAll('.testResult').data(function (suite) {
            return suite.cases;
        }, function (testCase) {
            return testCase.name;
        }).enter().append('div').attr('class', 'testResult list-group-item').html(function (testCase) {
            return '<h6 class="list-group-item-heading"><a href="' + testCase.url + '">' + testCase.name + '</a>' + (testCase.errorDetails ? '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<a data-toggle="collapse" href="#' + 'testCase' + testCase.count + '">Details</a>' : '') + (testCase.errorStackTrace ? '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<a data-toggle="collapse" href="#' + 'stackTrace' + testCase.count + '">Stacktrace</a>' : '') + '</h6>';
        });
        hull.append('div').attr('class', function (testCase) {
            return !testCase.errorDetails || testCase.errorDetails.length > 1200 ? 'collapse' : 'collapse in';
        }).attr('id', function (testCase) {
            return 'testCase' + testCase.count;
        }).append('small').append('pre').text(function (testCase) {
            return testCase.errorDetails === null ? '' : testCase.errorDetails.replace(/\[(\d+(, )?)*\]/, '');
        });
        hull.append('div').attr('class', 'collapse').attr('id', function (testCase) {
            return 'stackTrace' + testCase.count;
        }).append('small').append('pre').text(function (testCase) {
            return testCase.errorStackTrace ? testCase.errorStackTrace.replace(/\[(\d+(, )?)*\]/, '') : '';
        });
        var warnings = projectSelection.selectAll('.warning').data(function (node) {
            return node.warnings || [];
        });
        warnings.enter().append('div').attr('class', 'warning').html(function (warning) {
            return '<div class=\'list-group-item\'><h5 class=\'list-group-item-heading\'>' + warning.fileName + '</h5><pre>' + warning.message + '</pre></h5>' + '</div>';
        });
    };
    my.renderLoop = function (eventSource, eventName, render) {
        var viewNeedsUpdate = true;
        $(eventSource).bind(eventName, function () {
            viewNeedsUpdate = true;
            setTimeout(function () {
                if (viewNeedsUpdate) {
                    render();
                    viewNeedsUpdate = false;
                }
            }, 0);
        });
        $(eventSource).trigger(eventName);
    };
    return my;
});
define('where/builds/nodesRenderer', [
    'app-config',
    'where/builds/nodesData',
    'common/render',
    'd3'
], function (conf, nodesData, render, d3) {
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
        render.renderTestresults(unstableProjects.select('.testResults'));
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
    my.renderLoop = function () {
        render.renderLoop(nodesData.data, nodesData.event, my.renderData);
    };
    return my;
});
define('common/buildInfo', ['app-config'], function (config) {
    var my = {};
    var testCaseCount = 1;
    var defaultBuildKeys = [
        'number',
        'url',
        'result'
    ];
    var defaultActionKeys = [
        'failCount',
        'skipCount',
        'totalCount',
        'urlName',
        'name',
        'result[warnings[message,fileName]]'
    ];
    my.buildKeys = function (buildKeys, actionKeys) {
        return defaultBuildKeys.concat(buildKeys, ['actions[' + defaultActionKeys.concat(actionKeys).join(',') + ']']).join(',');
    };
    my.getWarnings = function (build) {
        var actions = build.actions;
        var warningsActions = actions.filter(function (action) {
            return action.name === 'findbugs' || action.name === 'pmd' || action.name === 'warnings';
        });
        return Array.prototype.concat.apply([], warningsActions.map(function (action) {
            return action.result.warnings.map(function (warning) {
                return {
                    name: action.name,
                    message: warning.message,
                    fileName: warning.fileName
                };
            }).filter(function (warning) {
                return !(warning.name === 'warnings' && config.filterWarnings.some(function (filterWarning) {
                    return warning.message.indexOf(filterWarning) > -1;
                }));
            });
        }));
    };
    my.getTestResult = function (build) {
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
    my.addFailedTests = function (build, callback) {
        $.getJSON(build.url + 'testReport/api/json?tree=suites[name,cases[age,className,name,status,errorDetails,errorStackTrace]]').then(function (testReport) {
            if (testReport.suites) {
                var failedTests = testReport.suites.map(function (suite) {
                    var dotBeforeClass = suite.name.lastIndexOf('.');
                    var packageOfSuite = suite.name.substring(0, dotBeforeClass);
                    var suiteUrl = build.url + 'testReport/' + (packageOfSuite ? packageOfSuite : '(root)') + '/' + suite.name.substring(dotBeforeClass + 1) + '/';
                    return {
                        name: suite.name,
                        url: suiteUrl,
                        cases: suite.cases.filter(function (test) {
                            return test.status !== 'PASSED' && test.status !== 'SKIPPED' && test.status !== 'FIXED';
                        }).map(function (testCase) {
                            testCase.url = suiteUrl + testCase.name.replace(/[^a-zA-Z0-9_]/g, '_') + '/';
                            testCase.count = testCaseCount++;
                            return testCase;
                        })
                    };
                }).filter(function (suite) {
                    return suite.cases.length > 0;
                });
                callback(failedTests);
            }
        });
    };
    return my;
});
define('where/builds/nodeUpdater', [
    'jquery',
    'where/builds/node',
    'app-config',
    'where/builds/nodesData',
    'common/buildInfo'
], function ($, node, config, nodes, buildInfo) {
    'use strict';
    var my = {};
    my.update = function (nodeToUpdate, callback) {
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
            return $.when(buildDef, revisionDef, prevBuildDef, prevRevisionDef).then(function (build, revision, prevBuildParam, prevRevision) {
                if (build === undefined) {
                    return undefined;
                }
                var prevBuild = prevBuildParam === undefined ? build : prevBuildParam;
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
        var updateNodeToUpdateFromBuild = function (nodeToUpdate, build) {
            nodeToUpdate.status = build.result.toLowerCase();
            nodeToUpdate.revision = build.revision;
            nodeToUpdate.previousRevision = build.prevBuild.revision;
            nodeToUpdate.url = build.url;
            nodeToUpdate.testResult = buildInfo.getTestResult(build);
            nodeToUpdate.warnings = buildInfo.getWarnings(build);
            if (build.prevBuild !== undefined) {
                var previousTestResult = buildInfo.getTestResult(build.prevBuild);
                nodeToUpdate.newFailCount = nodeToUpdate.testResult.failCount - previousTestResult.failCount;
            }
            if (nodeToUpdate.status === 'unstable' && nodeToUpdate.testResult.totalCount > 0) {
                buildInfo.addFailedTests(nodeToUpdate, function (failedTests) {
                    nodeToUpdate.testResult.failedTests = failedTests;
                    $(nodes.data).trigger(nodes.event);
                });
            }
        };
        var foundBuildDef = buildForRevision(buildDef, buildDef.then(getRevision));
        $.when(foundBuildDef).then(function (build) {
            var isBuildUndefined = build === undefined || build.result.toLowerCase() == 'aborted';
            if (isBuildUndefined) {
                callback(nodeToUpdate);
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
                $(nodes.data).trigger(nodes.event);
            }
            resultDef.resolve(nodeToUpdate);
        }, function () {
            callback(nodeToUpdate);
        });
        return resultDef;
    };
    return my;
});
define('where/builds/nodesController', [
    'common/util',
    'where/builds/nodesData',
    'where/builds/nodesRenderer',
    'where/builds/nodeUpdater',
    'app-config',
    'jquery',
    'bootstrap'
], function (util, data, renderer, updater, config, $, bs) {
    'use strict';
    var my = {};
    var throttler = util.newThrottler(function (node) {
        updater.update(node, throttler.scheduleUpdate);
    }, config.bulkUpdateSize, config.updateInterval);
    var changeEvent = 'change';
    my.init = function () {
        if (data.revision) {
            throttler.scheduleUpdate(data.data);
            renderer.renderLoop();
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
define('where/init', [
    'where/changes/changesController',
    'where/builds/nodesController'
], function (changes, nodes) {
    'use strict';
    changes.init();
    nodes.init();
});
define('broken/builds', [], function () {
    return {
        builds: [],
        event: 'change'
    };
});
define('broken/updater', [
    'broken/builds',
    'common/util',
    'common/buildInfo',
    'jquery'
], function (data, util, buildInfo, $) {
    var my = {};
    var buildUrl = function (mybuildUrl) {
        return mybuildUrl + '/api/json?tree=' + buildInfo.buildKeys(['fullDisplayName'], []);
    };
    var getBuildDef = function (myBuildUrl) {
        return $.getJSON(buildUrl(myBuildUrl)).then(function (build) {
            return build;
        });
    };
    my.addForUrl = function (url) {
        getBuildDef(url).then(function (build) {
            var buildData = {
                name: build.fullDisplayName,
                url: build.url,
                testResult: buildInfo.getTestResult(build),
                warnings: buildInfo.getWarnings(build),
                status: build.result.toLowerCase()
            };
            data.builds.push(buildData);
            $(data).trigger(data.event);
            if (buildData.status === 'unstable' && buildData.testResult.totalCount > 0) {
                buildInfo.addFailedTests(buildData, function (failedTests) {
                    buildData.testResult.failedTests = failedTests;
                    $(data).trigger(data.event);
                });
            }
        });
    };
    return my;
});
define('broken/renderer', [
    'd3',
    'common/render',
    'broken/builds'
], function (d3, render, data) {
    var my = {};
    var buildName = function (build) {
        return build.name;
    };
    my.renderFailedTests = function () {
        var unstableNodes = data.builds.filter(function (build) {
            return build.status === 'unstable';
        });
        var unstableProjects = d3.select('#projects').selectAll('.unstableProject').data(unstableNodes, buildName);
        unstableProjects.enter().append('div').attr('class', 'list-group-item unstableProject').attr('name', function (el) {
            return el.name;
        }).html(function (el) {
            return '<h3 class=\'list-group-item-heading\'><a href=\'' + el.url + '\'>' + el.name + '</a></h3><div class=\'testResults\'></div>';
        });
        unstableProjects.order();
        unstableProjects.exit().remove();
        render.renderTestresults(unstableProjects.select('.testResults'));
        d3.selectAll('#projects .loading').remove();
    };
    my.renderLoop = function () {
        render.renderLoop(data, data.event, my.renderFailedTests);
    };
    return my;
});
define('broken/controller', [
    'jquery',
    'common/util',
    'app-config',
    'broken/builds',
    'broken/updater',
    'broken/renderer'
], function ($, util, config, data, updater, renderer) {
    var my = {}, throttler = util.newThrottler(updater.addForUrl, config.bulkUpdateSize, config.updateInterval);
    my.init = function (urlsDef) {
        urlsDef.then(throttler.scheduleUpdates);
        renderer.renderLoop();
    };
    return my;
});
define('broken/lastCompletedBuildsOf', [
    'jquery',
    'app-config'
], function ($, config) {
    var my = {};
    my.multijob = function (multijobName) {
        var multijobUrl = config.jenkinsUrl + '/job/' + multijobName + '/lastCompletedBuild/api/json?tree=subBuilds[url]';
        return $.getJSON(multijobUrl).then(function (multijobBuild) {
            return multijobBuild.subBuilds.map(function (subBuild) {
                return config.jenkinsUrl + '/' + subBuild.url;
            });
        });
    };
    my.view = function (viewName) {
        var viewUrl = config.jenkinsUrl + '/view/' + viewName + '/api/json?tree=jobs[url,color]';
        return $.getJSON(viewUrl).then(function (view) {
            return view.jobs.filter(function (job) {
                return job.color !== 'blue';
            }).map(function (job) {
                return job.url + 'lastCompletedBuild/';
            });
        });
    };
    return my;
});
define('broken/init', [
    'common/util',
    'broken/controller',
    'broken/lastCompletedBuildsOf'
], function (util, controller, lastCompletedBuildsOf) {
    var viewName = util.getQueryVariable('view'), multijobName = util.getQueryVariable('multijob');
    var urlsToCheck = viewName ? lastCompletedBuildsOf.view(viewName) : lastCompletedBuildsOf.multijob(multijobName);
    controller.init(urlsToCheck);
});
(function (config) {
  if (typeof define === 'function' && define.amd) {
    define('shims', [], function () {
      var dev = ("window" in this || window.whereIsMyCommit === undefined);
      require.config(config("..", dev));
    });
  } else {
    module.exports = config(".", true);
  }
})(function (rootDir, bower) {
  var lib = function (bowerPath, filename) {
    return [rootDir].concat((bower ? ['bower_components', bowerPath] : []), [filename]).join('/');
  };

  return {
    baseUrl: '',
    paths: {
      jquery: lib('jquery/dist', 'jquery.min'),
      d3: lib('d3', 'd3.min'),
      bootstrap: lib('bootstrap/dist/js', 'bootstrap.min')
    },
    shim: {
      bootstrap: {
        deps: ['jquery']
      }
    }
  };
});
