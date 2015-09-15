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
define('common/util', [], {
    getQueryVariable: function (variable) {
        'use strict';
        var search = window.location.search;
        return this.getQueryVariableFromSearch(variable, search);
    },
    getQueryVariableFromSearch: function (variable, search) {
        'use strict';
        var query = search.substring(1);
        var params = this.queryVariablesFromQuery(query);
        return params[variable];
    },
    queryVariablesFromQuery: function (query) {
        var params = {};
        if (query !== '') {
            query.split('&').map(function (el) {
                return el.split('=');
            }).forEach(function (args) {
                params[decodeURIComponent(args[0])] = args[1] ? decodeURIComponent(args[1].replace(/\+/g, ' ')) : args[1];
            });
        }
        return params;
    },
    queryVariables: function () {
        var search = window.location.search;
        var query = search.substring(1);
        return this.queryVariablesFromQuery(query);
    },
    newThrottler: function (bulkUpdateSizeParam, updateIntervalParam) {
        var throttler = {}, workUnits = [], currentTimer, timerRunning = false, bulkUpdateSize = bulkUpdateSizeParam || 10, updateInterval = updateIntervalParam || 2000;
        var startTimer = function () {
            updateNext();
            currentTimer = setInterval(function () {
                if (workUnits.length === 0) {
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
            if (workUnits.length > 0) {
                var workForNow = workUnits.slice(0, bulkUpdateSize);
                workUnits = workUnits.slice(bulkUpdateSize);
                workForNow.forEach(function (workUnit) {
                    workUnit();
                });
            }
        };
        throttler.scheduleUpdate = function (workUnit) {
            throttler.scheduleUpdates([workUnit]);
        };
        throttler.scheduleUpdates = function (newWorkUnits) {
            Array.prototype.push.apply(workUnits, newWorkUnits);
            startTimerIfNecessary();
        };
        return throttler;
    },
    sequentially: function (args, requestFunction) {
        args.reverse().reduce(function (previous, current) {
            return function () {
                requestFunction(current).always(previous);
            };
        }, function () {
        })();
    }
});
define('where/changes/changesRenderer', [
    'jquery',
    'd3',
    'where/changes/changes',
    'common/util'
], function ($, d3, changes, util) {
    'use strict';
    var my = {};
    my.render = function () {
        var revisions = d3.select('#commits').selectAll('.revision').data(changes.commits, function (d) {
            return d.commitId;
        });
        revisions.enter().append('li').attr('role', 'presentation').attr('class', 'revision').append('a').attr('href', function (el) {
            var queryParams = util.queryVariables();
            queryParams.revision = el.commitId;
            return '?' + $.param(queryParams);
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
        coreUpdateInterval: globalConfig.coreUpdateInterval || globalConfig.updateInterval || 2000,
        commitUpdateInterval: globalConfig.commitUpdateInterval || 20000,
        bulkUpdateSize: globalConfig.bulkUpdateSize || 10,
        filterWarnings: globalConfig.filterWarnings || []
    };
});
define('where/changes/changesUpdater', [
    'where/changes/changes',
    'app-config',
    'jquery',
    'common/util'
], function (changes, config, $, util) {
    'use strict';
    var my = {};
    my.update = function () {
        var startJob = util.getQueryVariable('startJob') || config.startJob, jobRequest = $.getJSON(config.jenkinsUrl + '/job/' + startJob + '/api/json?tree=builds[changeSet[*[*]]]{,10}');
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
    var revisionString = util.getQueryVariable('revision'), startJob = util.getQueryVariable('startJob') || config.startJob;
    my.revision = parseInt(revisionString, 10);
    my.data = node.create(startJob, my.revision);
    my.event = 'change';
    return my;
});
define('common/render', [
    'jquery',
    'bootstrap'
], function ($) {
    'use strict';
    var my = {};
    my.dateTimeFormat = {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric'
    };
    my.formatClaim = function (el) {
        el.html(function (claimedObject) {
            var claim = claimedObject.claim;
            if (claim.claimed) {
                return '<span class="glyphicon glyphicon-lock"> </span>' + (claim.reason ? ' <span>' + claim.reason + '</span><br /> ' : '') + ' <span class="label label-default">' + claim.claimedBy + '</span>' + ' <span>' + new Date(claim.claimDate).toLocaleString('de-DE', my.dateTimeFormat) + '</span>';
            } else {
                return '';
            }
        });
    };
    var appendTestCaseDetails = function (name, description, present, collapse, text) {
        return function (hull) {
            hull.filter(present).append('div').call(function (div) {
                div.append('h6').append('a').attr('data-toggle', 'collapse').attr('href', function (testCase) {
                    return '#' + name + testCase.id;
                }).text(description).append('span').attr('class', 'caret');
            }).append('div').attr('class', function (testCase) {
                return collapse(testCase) ? 'panel-collapse collapse' : 'panel-collapse collapse in';
            }).attr('id', function (testCase) {
                return name + testCase.id;
            }).append('pre').text(function (testCase) {
                return text(testCase);
            });
        };
    };
    my.renderTestresults = function (projectSelection) {
        var suiteResults = projectSelection.selectAll('.suiteResult').data(function (node) {
            return node.testResult.failedTests || [];
        }, function (test) {
            return test.name + '-' + test.className;
        });
        suiteResults.enter().append('div').attr('class', 'suiteResult list-group').append('div').attr('class', 'input-group suite').html(function (suite) {
            return '<span class="input-group-addon"><input class="testCaseSelect" data-suitename="' + suite.url + '" type="checkbox"></span>';
        }).append('div').attr('class', 'list-group-item').html(function (test) {
            return '<div class=\'h4\'><a href=\'' + test.url + '\'>' + test.name + '</a></div>';
        });
        var testResults = suiteResults.selectAll('.testResult').data(function (suite) {
            return suite.cases;
        }, function (testCase) {
            return testCase.name;
        });
        testResults.enter().append('div').attr('class', 'input-group testResult').html(function (testCase) {
            return '<span class="input-group-addon"><input class="testCaseSelect" data-testCaseId="' + testCase.id + '" type="checkbox"></span>';
        }).append('div').attr('class', 'list-group-item').html(function (testCase) {
            return '<div class="row">' + [
                '<div class="h5 col-md-7">',
                '<a href="',
                testCase.url,
                '">',
                testCase.name.substring(0, 400),
                '</a> ',
                ' <span class="glyphicon glyphicon-time"></span>',
                '<span class="badge" data-toggle="tooltip" title="age">',
                testCase.age,
                '</span>',
                '</div>'
            ].join('') + '<div class="col-md-5 claim"/>' + '</div>';
        }).call(appendTestCaseDetails('details', 'Details', function (testCase) {
            return testCase.errorDetails;
        }, function (testCase) {
            return testCase.errorDetails.length > 1200;
        }, function (testCase) {
            return testCase.errorDetails.replace(/<\[\d+, [0-9, -]+\]>/, '');
        })).call(appendTestCaseDetails('stacktrace', 'Stacktrace', function (testCase) {
            return testCase.errorStackTrace;
        }, function () {
            return true;
        }, function (testCase) {
            return testCase.errorStackTrace.replace(/<\[\d+, [0-9, -]+\]>/, '');
        }));
        testResults.select('.claim').call(my.formatClaim);
        var warnings = projectSelection.selectAll('.warning').data(function (node) {
            return node.warnings || [];
        });
        warnings.enter().append('div').attr('class', 'warning').append('div').attr('class', 'list-group-item').html(function (warning) {
            return '<h5 class=\'list-group-item-heading\'>' + warning.fileName + '</h5>';
        }).call(appendTestCaseDetails('warning', 'Warning', function () {
            return true;
        }, function () {
            return false;
        }, function (warning) {
            return warning.message;
        }));
        $(function () {
            $('[data-toggle="tooltip"]').tooltip();
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
            }, 20);
        });
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
        'result',
        'timestamp'
    ];
    var defaultActionKeys = [
        'failCount',
        'skipCount',
        'totalCount',
        'urlName',
        'name',
        'result[warnings[message,fileName]]',
        'claimDate,claimed,claimedBy,reason'
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
                    fileName: warning.fileName,
                    id: testCaseCount++
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
    my.addFailedTests = function (build, callback, failureCallbackArg) {
        var failureCallback = failureCallbackArg || function () {
        };
        $.getJSON(build.url + 'testReport/api/json?tree=suites[name,cases[age,className,name,status,errorDetails,errorStackTrace,testActions[claimDate,claimed,claimedBy,reason]]]').then(function (testReport) {
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
                            testCase.url = suiteUrl + testCase.name.replace(/[^a-zA-Z0-9_$]/g, '_') + '/';
                            testCase.id = testCaseCount++;
                            if (testCase.testActions) {
                                var claims = testCase.testActions.filter(function (c) {
                                    return c.claimed === true;
                                });
                                testCase.claim = claims.length == 1 ? claims[0] : { claimed: false };
                            } else {
                                testCase.claim = { claimed: false };
                            }
                            return testCase;
                        })
                    };
                }).filter(function (suite) {
                    return suite.cases.length > 0;
                });
                callback(failedTests);
            } else {
                callback();
            }
        }, failureCallback);
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
                nodeToUpdate.date = new Date(build.timestamp);
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
    var coreThrottler = util.newThrottler(config.bulkUpdateSize, config.coreUpdateInterval);
    var throttler = util.newThrottler(config.bulkUpdateSize, config.updateInterval);
    var updateFunction = updater.updateFunction(coreThrottler.scheduleUpdate, throttler.scheduleUpdate);
    var changeEvent = 'change';
    my.init = function () {
        if (data.revision) {
            renderer.renderLoop();
            coreThrottler.scheduleUpdate(function () {
                updateFunction(data.data);
            });
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
    var my = {
        builds: [],
        event: 'change'
    };
    var concat = function (a, b) {
        return a.concat(b);
    };
    my.testCases = function () {
        return my.builds.map(function (build) {
            return build.testResult.failedTests || [];
        }).reduce(concat).map(function (testSuite) {
            return testSuite.cases;
        }).reduce(concat);
    };
    var findById = function (id, list) {
        return list.filter(function (objectWithId) {
            return objectWithId.id === id;
        }).pop();
    };
    my.testCaseForId = function (id) {
        return findById(id, my.testCases());
    };
    my.buildForId = function (id) {
        return findById(id, my.builds);
    };
    my.testCasesForSuite = function (url) {
        return my.builds.map(function (build) {
            return build.testResult.failedTests || [];
        }).reduce(concat).filter(function (testSuite) {
            return testSuite.url === url;
        }).pop().cases;
    };
    return my;
});
define('broken/updater', [
    'broken/builds',
    'common/util',
    'common/buildInfo',
    'jquery',
    'app-config'
], function (data, util, buildInfo, $, config) {
    var my = {};
    var buildUrl = function (mybuildUrl) {
        return mybuildUrl + '/api/json?tree=' + buildInfo.buildKeys(['fullDisplayName'], []);
    };
    var buildId = 0;
    var getBuildDef = function (myBuildUrl) {
        return $.getJSON(buildUrl(myBuildUrl)).then(function (build) {
            return build;
        });
    };
    my.addForUrl = function (url, progressCallbackParm) {
        var progressCallback = progressCallbackParm || function () {
        };
        getBuildDef(url).then(function (build) {
            var claims = build.actions.filter(function (c) {
                return c.claimed === true;
            });
            var buildData = {
                name: build.fullDisplayName,
                url: build.url,
                date: new Date(build.timestamp),
                testResult: buildInfo.getTestResult(build),
                warnings: buildInfo.getWarnings(build),
                status: build.result.toLowerCase(),
                claim: claims.length === 1 ? claims[0] : { claimed: false },
                id: buildId++
            };
            data.builds.push(buildData);
            $(data).trigger(data.event);
            progressCallback('build', buildData);
            if (buildData.status === 'unstable' && buildData.testResult.totalCount > 0) {
                buildInfo.addFailedTests(buildData, function (failedTests) {
                    buildData.testResult.failedTests = failedTests;
                    $(data).trigger(data.event);
                    progressCallback('testResult', failedTests);
                }, progressCallback);
            } else {
                progressCallback('testResult', false);
            }
        }, function () {
            progressCallback();
            progressCallback();
        });
    };
    my.claim = function (objectToClaim, claim) {
        var request = $.post(objectToClaim.url + '/claim/claim', {
            Submit: 'Claim',
            json: JSON.stringify(claim)
        });
        request.then(function () {
            claim.claimed = true;
            claim.claimDate = new Date().getTime();
            claim.claimedBy = claim.assignee;
            objectToClaim.claim = claim;
            $(data).trigger(data.event);
        });
        return request;
    };
    my.unclaim = function (objectToClaim) {
        var request = $.post(objectToClaim.url + '/claim/unclaim');
        request.then(function () {
            objectToClaim.claim = { claimed: false };
            $(data).trigger(data.event);
        });
        return request;
    };
    my.users = function () {
        return $.getJSON(config.jenkinsUrl + '/asynchPeople/api/json?tree=users[user[fullName,id]]').then(function (jsonUsers) {
            return jsonUsers.users.map(function (userInfo) {
                return userInfo.user;
            });
        });
    };
    my.views = function () {
        return $.getJSON(config.jenkinsUrl + '/api/json?tree=views[name,url]').then(function (jenkins) {
            return jenkins.views.sort(function (a, b) {
                return a.name.localeCompare(b.name);
            });
        });
    };
    return my;
});
define('broken/renderer', [
    'd3',
    'jquery',
    'common/render',
    'broken/builds',
    'common/util'
], function (d3, $, render, data, util) {
    var my = {};
    var buildName = function (build) {
        return build.name;
    };
    my.renderFailedTests = function () {
        var unstableNodes = data.builds.filter(function (build) {
            return build.status === 'failure' || build.status === 'unstable';
        });
        var unstableProjects = d3.select('#projects').selectAll('.unstableProject').data(unstableNodes, buildName);
        unstableProjects.enter().append('div').attr('class', function (build) {
            return 'panel panel-default unstableProject ' + build.status;
        }).attr('name', function (el) {
            return el.name;
        }).html(function (build) {
            return '<div class="input-group panel-default">' + '<span class="input-group-addon"><input class="buildSelect" data-buildId="' + build.id + '" type="checkbox"></span>' + '<div class=\'panel-heading\'>' + '<div class="row">' + '<div class=\'col-md-8\'><h2 class=\'panel-title\'><a class=\'h2\' href=\'' + build.url + '\'>' + build.name + '</a>, <span class=\'h3\'>' + build.date.toLocaleString('de-DE', render.dateTimeFormat) + '</span></h2></div>' + '<div class="col-md-3 claim"></div>' + '<div class="col-md-1"><a data-toggle="collapse" href="#collapseProject' + build.id + '">collapse<span class="caret"></span></a></div>' + '</div>' + '</div></div>' + '<div class=\'testResults panel-body collapse in\' id=\'collapseProject' + build.id + '\'></div>';
        });
        unstableProjects.order();
        unstableProjects.select('.claim').call(render.formatClaim);
        unstableProjects.exit().remove();
        render.renderTestresults(unstableProjects.select('.testResults'));
        d3.selectAll('#projects .loading').remove();
        var suiteSelector = function (event) {
            var checkbox = event.target;
            data.testCasesForSuite($(checkbox).data('suitename')).forEach(function (testCase) {
                $('[data-testcaseid="' + testCase.id + '"]').prop('checked', checkbox.checked);
            });
        };
        var suites = $('[data-suitename]');
        suites.off('change');
        suites.change(suiteSelector);
    };
    my.addUsers = function (users) {
        var userId = function (user) {
            return user.id;
        };
        d3.select('#assignees').selectAll('.user').data(users, userId).enter().append('option').attr('class', 'user').attr('value', userId).text(function (user) {
            return user.fullName;
        });
    };
    my.addViews = function (views) {
        var viewSelection = d3.select('#views').selectAll('.view').data(views);
        viewSelection.enter().append('li').attr('role', 'presentation').attr('class', 'view').append('a').attr('href', function (view) {
            var queryVariables = util.queryVariables();
            queryVariables.view = view.name;
            delete queryVariables.multijob;
            return '?' + $.param(queryVariables);
        }).attr('role', 'menuitem').attr('name', function (view) {
            return view.name;
        }).text(function (view) {
            return view.name;
        });
        viewSelection.order();
        viewSelection.exit().remove();
        var selectedViewName = util.getQueryVariable('view');
        $('#currentView').text(selectedViewName ? selectedViewName : 'Views');
        d3.selectAll('#views .loading').remove();
    };
    my.renderLoop = function () {
        render.renderLoop(data, data.event, my.renderFailedTests);
    };
    return my;
});
!function (a, b) {
    'object' == typeof module && module.exports ? module.exports = b() : 'function' == typeof define && define.amd ? define('spin', [], b) : a.Spinner = b();
}(this, function () {
    'use strict';
    function a(a, b) {
        var c, d = document.createElement(a || 'div');
        for (c in b)
            d[c] = b[c];
        return d;
    }
    function b(a) {
        for (var b = 1, c = arguments.length; c > b; b++)
            a.appendChild(arguments[b]);
        return a;
    }
    function c(a, b, c, d) {
        var e = [
                'opacity',
                b,
                ~~(100 * a),
                c,
                d
            ].join('-'), f = 0.01 + c / d * 100, g = Math.max(1 - (1 - a) / b * (100 - f), a), h = j.substring(0, j.indexOf('Animation')).toLowerCase(), i = h && '-' + h + '-' || '';
        return m[e] || (k.insertRule('@' + i + 'keyframes ' + e + '{0%{opacity:' + g + '}' + f + '%{opacity:' + a + '}' + (f + 0.01) + '%{opacity:1}' + (f + b) % 100 + '%{opacity:' + a + '}100%{opacity:' + g + '}}', k.cssRules.length), m[e] = 1), e;
    }
    function d(a, b) {
        var c, d, e = a.style;
        if (b = b.charAt(0).toUpperCase() + b.slice(1), void 0 !== e[b])
            return b;
        for (d = 0; d < l.length; d++)
            if (c = l[d] + b, void 0 !== e[c])
                return c;
    }
    function e(a, b) {
        for (var c in b)
            a.style[d(a, c) || c] = b[c];
        return a;
    }
    function f(a) {
        for (var b = 1; b < arguments.length; b++) {
            var c = arguments[b];
            for (var d in c)
                void 0 === a[d] && (a[d] = c[d]);
        }
        return a;
    }
    function g(a, b) {
        return 'string' == typeof a ? a : a[b % a.length];
    }
    function h(a) {
        this.opts = f(a || {}, h.defaults, n);
    }
    function i() {
        function c(b, c) {
            return a('<' + b + ' xmlns="urn:schemas-microsoft.com:vml" class="spin-vml">', c);
        }
        k.addRule('.spin-vml', 'behavior:url(#default#VML)'), h.prototype.lines = function (a, d) {
            function f() {
                return e(c('group', {
                    coordsize: k + ' ' + k,
                    coordorigin: -j + ' ' + -j
                }), {
                    width: k,
                    height: k
                });
            }
            function h(a, h, i) {
                b(m, b(e(f(), {
                    rotation: 360 / d.lines * a + 'deg',
                    left: ~~h
                }), b(e(c('roundrect', { arcsize: d.corners }), {
                    width: j,
                    height: d.scale * d.width,
                    left: d.scale * d.radius,
                    top: -d.scale * d.width >> 1,
                    filter: i
                }), c('fill', {
                    color: g(d.color, a),
                    opacity: d.opacity
                }), c('stroke', { opacity: 0 }))));
            }
            var i, j = d.scale * (d.length + d.width), k = 2 * d.scale * j, l = -(d.width + d.length) * d.scale * 2 + 'px', m = e(f(), {
                    position: 'absolute',
                    top: l,
                    left: l
                });
            if (d.shadow)
                for (i = 1; i <= d.lines; i++)
                    h(i, -2, 'progid:DXImageTransform.Microsoft.Blur(pixelradius=2,makeshadow=1,shadowopacity=.3)');
            for (i = 1; i <= d.lines; i++)
                h(i);
            return b(a, m);
        }, h.prototype.opacity = function (a, b, c, d) {
            var e = a.firstChild;
            d = d.shadow && d.lines || 0, e && b + d < e.childNodes.length && (e = e.childNodes[b + d], e = e && e.firstChild, e = e && e.firstChild, e && (e.opacity = c));
        };
    }
    var j, k, l = [
            'webkit',
            'Moz',
            'ms',
            'O'
        ], m = {}, n = {
            lines: 12,
            length: 7,
            width: 5,
            radius: 10,
            scale: 1,
            corners: 1,
            color: '#000',
            opacity: 0.25,
            rotate: 0,
            direction: 1,
            speed: 1,
            trail: 100,
            fps: 20,
            zIndex: 2000000000,
            className: 'spinner',
            top: '50%',
            left: '50%',
            shadow: !1,
            hwaccel: !1,
            position: 'absolute'
        };
    if (h.defaults = {}, f(h.prototype, {
            spin: function (b) {
                this.stop();
                var c = this, d = c.opts, f = c.el = a(null, { className: d.className });
                if (e(f, {
                        position: d.position,
                        width: 0,
                        zIndex: d.zIndex,
                        left: d.left,
                        top: d.top
                    }), b && b.insertBefore(f, b.firstChild || null), f.setAttribute('role', 'progressbar'), c.lines(f, c.opts), !j) {
                    var g, h = 0, i = (d.lines - 1) * (1 - d.direction) / 2, k = d.fps, l = k / d.speed, m = (1 - d.opacity) / (l * d.trail / 100), n = l / d.lines;
                    !function o() {
                        h++;
                        for (var a = 0; a < d.lines; a++)
                            g = Math.max(1 - (h + (d.lines - a) * n) % l * m, d.opacity), c.opacity(f, a * d.direction + i, g, d);
                        c.timeout = c.el && setTimeout(o, ~~(1000 / k));
                    }();
                }
                return c;
            },
            stop: function () {
                var a = this.el;
                return a && (clearTimeout(this.timeout), a.parentNode && a.parentNode.removeChild(a), this.el = void 0), this;
            },
            lines: function (d, f) {
                function h(b, c) {
                    return e(a(), {
                        position: 'absolute',
                        width: f.scale * (f.length + f.width) + 'px',
                        height: f.scale * f.width + 'px',
                        background: b,
                        boxShadow: c,
                        transformOrigin: 'left',
                        transform: 'rotate(' + ~~(360 / f.lines * k + f.rotate) + 'deg) translate(' + f.scale * f.radius + 'px,0)',
                        borderRadius: (f.corners * f.scale * f.width >> 1) + 'px'
                    });
                }
                for (var i, k = 0, l = (f.lines - 1) * (1 - f.direction) / 2; k < f.lines; k++)
                    i = e(a(), {
                        position: 'absolute',
                        top: 1 + ~(f.scale * f.width / 2) + 'px',
                        transform: f.hwaccel ? 'translate3d(0,0,0)' : '',
                        opacity: f.opacity,
                        animation: j && c(f.opacity, f.trail, l + k * f.direction, f.lines) + ' ' + 1 / f.speed + 's linear infinite'
                    }), f.shadow && b(i, e(h('#000', '0 0 4px #000'), { top: '2px' })), b(d, b(i, h(g(f.color, k), '0 0 1px rgba(0,0,0,.1)')));
                return d;
            },
            opacity: function (a, b, c) {
                b < a.childNodes.length && (a.childNodes[b].style.opacity = c);
            }
        }), 'undefined' != typeof document) {
        k = function () {
            var c = a('style', { type: 'text/css' });
            return b(document.getElementsByTagName('head')[0], c), c.sheet || c.styleSheet;
        }();
        var o = e(a('group'), { behavior: 'url(#default#VML)' });
        !d(o, 'transform') && o.adj ? i() : j = d(o, 'animation');
    }
    return h;
});
define('broken/controller', [
    'jquery',
    'common/util',
    'app-config',
    'broken/builds',
    'broken/updater',
    'broken/renderer',
    'spin'
], function ($, util, config, data, updater, renderer, Spinner) {
    var my = {}, throttler = util.newThrottler(config.bulkUpdateSize, config.coreUpdateInterval);
    var initFormSubmit = function () {
        var selectedTestCases = function () {
            var selected = $('input.testCaseSelect:checked');
            var ids = $.makeArray(selected.map(function () {
                return $(this).data('testcaseid');
            }));
            return ids.map(function (id) {
                return data.testCaseForId(id);
            });
        };
        var selectedBuilds = function () {
            var selected = $('input.buildSelect:checked');
            var ids = $.makeArray(selected.map(function () {
                return $(this).data('buildid');
            }));
            return ids.map(function (id) {
                return data.buildForId(id);
            });
        };
        $('#claimForm').submit(function (event) {
            try {
                var testCases = selectedTestCases();
                var builds = selectedBuilds();
                var claim = {};
                $(this).serializeArray().forEach(function (field) {
                    claim[field.name] = field.value;
                });
                util.sequentially(testCases.concat(builds), function (testCase) {
                    return updater.claim(testCase, claim);
                });
            } catch (err) {
                console.log(err);
            }
            event.preventDefault();
        });
        $('#dropClaimsForm').submit(function (event) {
            try {
                var testCases = selectedTestCases();
                var builds = selectedBuilds();
                testCases.concat(builds).forEach(updater.unclaim);
            } catch (err) {
                console.log(err);
            }
            event.preventDefault();
        });
    };
    var progressUpdater = function (number) {
        var my = {};
        my.total = number;
        my.current = 0;
        my.callback = function () {
            my.current++;
            my.updateProgress();
        };
        my.updateProgress = function () {
            $('#loadingProgress').width(my.current * 100 / my.total + '%');
            if (my.current === my.total) {
                $('#loadingSpinner').html('<span class="label label-success"><span class="glyphicon glyphicon-ok"></span></span>');
            }
        };
        new Spinner({
            lines: 13,
            length: 28,
            width: 14,
            radius: 42,
            scale: 0.1,
            corners: 1,
            color: '#000',
            opacity: 0.25,
            rotate: 0,
            direction: 1,
            speed: 1,
            trail: 60,
            fps: 20,
            zIndex: 2000000000,
            className: 'spinner',
            top: '50%',
            left: '100%',
            shadow: false,
            hwaccel: false,
            position: 'absolute'
        }).spin($('#loadingSpinner')[0]);
        return my;
    };
    my.init = function (urlsDef) {
        initFormSubmit();
        updater.views().then(renderer.addViews);
        renderer.renderLoop();
        urlsDef.then(function (urls) {
            var progress = progressUpdater(urls.length * 2);
            throttler.scheduleUpdates(urls.map(function (url) {
                return function () {
                    updater.addForUrl(url, progress.callback);
                };
            }));
        }, function (error, statusCode, statusText) {
            var loading = $('#projects').find('.loading')[0];
            loading.innerHTML = '<div class="alert alert-danger" role="alert">Loading Failed: ' + statusText + '</div>';
        });
        urlsDef.then(function (urls) {
            if (urls.length === 0) {
                var loading = $('#projects').find('.loading')[0];
                loading.innerHTML = '<div class="alert alert-warning" role="alert">No projects found - please select a view</div>';
            }
        });
    };
    return my;
});
define('broken/lastBuildsOf', [
    'jquery',
    'app-config'
], function ($, config) {
    var my = {};
    var defaultSelector = 'lastCompletedBuild';
    my.multijob = function (multijobName, selectorArg) {
        var selector = selectorArg || defaultSelector, multijobUrl = config.jenkinsUrl + '/job/' + multijobName + '/' + selector + '/api/json?tree=subBuilds[url]';
        return $.getJSON(multijobUrl).then(function (multijobBuild) {
            return multijobBuild.subBuilds.map(function (subBuild) {
                return config.jenkinsUrl + '/' + subBuild.url;
            });
        });
    };
    my.view = function (viewName, selectorArg) {
        var selector = selectorArg || defaultSelector, viewUrl = config.jenkinsUrl + '/view/' + viewName + '/api/json?tree=jobs[url,color]';
        return $.getJSON(viewUrl).then(function (view) {
            return view.jobs.filter(function (job) {
                return job.color !== 'blue';
            }).map(function (job) {
                return job.url + selector + '/';
            });
        });
    };
    return my;
});
define('broken/init', [
    'jquery',
    'common/util',
    'broken/controller',
    'broken/lastBuildsOf',
    'spin'
], function ($, util, controller, lastBuildsOf, Spinner) {
    var viewName = util.getQueryVariable('view'), multijobName = util.getQueryVariable('multijob'), buildSelector = util.getQueryVariable('buildSelector');
    var urlsToCheck = viewName ? lastBuildsOf.view(viewName, buildSelector) : multijobName ? lastBuildsOf.multijob(multijobName, buildSelector) : $.Deferred().resolve([]);
    var loading = $('#projects').find('.loading')[0];
    $(loading).text('');
    new Spinner({
        lines: 13,
        length: 28,
        width: 14,
        radius: 42,
        scale: 1,
        corners: 1,
        color: '#000',
        opacity: 0.25,
        rotate: 0,
        direction: 1,
        speed: 1,
        trail: 60,
        fps: 20,
        zIndex: 2000000000,
        className: 'spinner',
        top: '50%',
        left: '50%',
        shadow: false,
        hwaccel: false,
        position: 'absolute'
    }).spin(loading);
    controller.init(urlsToCheck);
});
(function (config) {
  if (typeof define === 'function' && define.amd) {
    define('shims', [], function () {
      var dev = ("window" in this && (window.location.pathname.indexOf('src') > -1));
      require.config(config(dev ? ".." : ".", dev));
    });
  } else {
    module.exports = config(".", true);
  }
})(function (rootDir, bower) {
  var lib = function (bowerPath, filename) {
    return [rootDir].concat((bower ? ['bower_components', bowerPath] : ['js']), [filename]).join('/');
  };

  return {
    baseUrl: '',
    paths: {
      jquery: lib('jquery/dist', 'jquery.min'),
      d3: lib('d3', 'd3.min'),
      bootstrap: lib('bootstrap/dist/js', 'bootstrap.min'),
      spin: lib('spin.js', 'spin.min')
    },
    shim: {
      bootstrap: {
        deps: ['jquery']
      }
    }
  };
});
