define(['jquery', 'where/builds/node', 'app-config', 'where/builds/nodesData', 'common/buildInfo'], function ($, node, config, nodes, buildInfo) {
  'use strict';
  var my = {};

  my.updateFunction = function (scheduleWork) {
    var scheduleUpdate = function (node) {
      scheduleWork(function () {
        update(node);
      });
    };
    var update = function (nodeToUpdate) {
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

          children.map(update);
          nodeToUpdate.downstreamProjects.map(update);

          nodeToUpdate.children = children;

          $(nodes.data).trigger(nodes.event);
        }
        resultDef.resolve(nodeToUpdate);
      }, function () {
        scheduleUpdate(nodeToUpdate);
      });

      return resultDef;
    };

    return update;
  };

  return my;
});