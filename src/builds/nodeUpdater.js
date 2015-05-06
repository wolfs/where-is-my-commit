define(['jquery', 'builds/node', 'app-config', 'builds/nodesData'], function ($, node, config, nodes) {
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

    var buildKeys =
      "number,url,result,actions[triggeredProjects[name,url,downstreamProjects[url,name]],failCount,skipCount,totalCount,urlName,name,result[warnings[message]]]";

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

    var getWarnings = function (build) {
      var actions = build.actions;

      var warningsActions = actions.filter(function (action) {
        return action.name === "findbugs";
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
      if (nodeToUpdate.status === "unstable") {
        addTestResult();
      }
    };

    var addTestResult = function () {
      $.getJSON(nodeToUpdate.url + "testReport/api/json?tree=suites[name,cases[age,className,name,status,errorDetails]]")
        .then(function (testReport) {
          nodeToUpdate.testResult.failedTests = testReport.suites.map(function (suite) {
            return {
              name: suite.name,
              cases: suite.cases.filter(function (test) {
                return (test.status !== 'PASSED') && (test.status !== 'SKIPPED');
              })
            };
          }).filter(function (suite) {
            return suite.cases.length > 0;
          });
          $(nodes.data).trigger("change");
        });
    };

    var foundBuildDef = buildForRevision(buildDef, buildDef.then(getRevision));

    $.when(foundBuildDef).then(function (build) {
      var isBuildUndefined = build === undefined || build.result.toLowerCase() == "aborted";
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

        $(nodes.data).trigger("change");

      }
      resultDef.resolve(nodeToUpdate);
    }, function () {
      nodes.scheduleUpdate(nodeToUpdate);
    });

    return resultDef;
  };

  return my;
});