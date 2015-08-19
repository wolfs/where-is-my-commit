    var work = [];

    var util = {
                 getQueryVariable: function (variable) {
                   'use strict';
                   var search = window.location.search;
                   return this.getQueryVariableFromSearch(variable, search);
                 },

                 getQueryVariableFromSearch: function(variable, search) {
                   'use strict';
                   var query = search.substring(1);
                   var results = query.split("&").map(function (el) {
                     return el.split("=");
                   }).filter(function (el) {
                     return (el[0] === variable);
                   }).map(function (el) {
                     return el[1];
                   });
                   return results.length === 0 ? false : results[0];
                 }
               };
    var config = window.whereIsMyCommit;
    var builds = [];
    var buildKeys =
      "fullDisplayName,status,number,url,result,actions[failCount,skipCount,totalCount,urlName,name,result[warnings[message,fileName]]]";


    var view = util.getQueryVariable('view');
    var multijob = util.getQueryVariable('multijob');

    if (view) {
        var viewUrl = 'http://172.18.28.70:8080/ci/view/' + view + '/api/json?tree=jobs[url,color]';
        var lastCompletedBuildsOfView = $.getJSON(viewUrl).then(function(view) {
                                                return view.jobs.
                                                    filter(function (job) {
                                                       return job.color !== 'blue';
                                                    }).
                                                    map(function (job) {
                                                      return job.url + 'lastCompletedBuild/'
                                                    })
                                            })
    }
    if (multijob) {
        var multijobUrl = 'http://172.18.28.70:8080/ci/job/' + multijob + '/lastSuccessfulBuild/api/json?tree=subBuilds[url]';
        var multijobSubbuilds = $.getJSON(multijobUrl).then(function(multijobBuild) {
            return multijobBuild.subBuilds.map(function (subBuild) {
                return config.jenkinsUrl + "/" +subBuild.url;
            });
        });
    }

    var urlsToCheck = view ? lastCompletedBuildsOfView : multijobSubbuilds;
    var buildUrl = function (mybuildUrl) {
      return mybuildUrl +
        "/api/json?tree=" + buildKeys;
    };

    var testCaseCount = 1;

    var getBuildDef = function (myBuildUrl) {
      return $.getJSON(buildUrl(myBuildUrl)).then(function (build) {
        return build;
      });
    };

    var addTestResult = function (build) {
      $.getJSON(build.url + "testReport/api/json?tree=suites[name,cases[age,className,name,status,errorDetails]]")
        .then(function (testReport) {
          build.testResult.failedTests = testReport.suites.map(function (suite) {
            var dotBeforeClass = suite.name.lastIndexOf(".");
            var suiteUrl = build.url + "testReport/" + suite.name.substring(0, dotBeforeClass) + "/" + suite.name.substring(dotBeforeClass + 1);
            return {
              name: suite.name,
              url: suiteUrl,
              cases: suite.cases.filter(function (test) {
                return (test.status !== 'PASSED') && (test.status !== 'SKIPPED') && (test.status !== 'FIXED');
              }).map(function (testCase) {
                  testCase.url = suiteUrl + "/" + testCase.name;
                  testCase.count = testCaseCount++;
                  return testCase;
              })
            };
          }).filter(function (suite) {
            return suite.cases.length > 0;
          });
        });
    };

    var getWarnings = function (build) {
      var actions = build.actions;

      var warningsActions = actions.filter(function (action) {
        return action.name === "findbugs" || action.name === "pmd" || action.name === "warnings";
      });

      return Array.prototype.concat.apply([], warningsActions.map(function (action) {
        return action.result.warnings.map(function (warning) {
          return { name: action.name, message: warning.message, fileName: warning.fileName };
        }).filter(function (warning) { return !(warning.name === "warnings" && warnings.message.indexOf('(IF reasonable!) ADD)') > -1); } );
      }));
    };


     var buildDefs = urlsToCheck.then(function (urls) {
        return urls.forEach(function (url) {
            work.push(function () {
                getBuildDef(url).then(function (build) {
                    var buildInfo = {
                      name: build.fullDisplayName,
                      url: build.url,
                      testResult: {},
                      warnings: getWarnings(build),
                      status: build.result.toLowerCase()
                    };
                    builds.push(buildInfo);
                    addTestResult(buildInfo)
                })
            });
        })
    });

    var buildName = function (build) {
        return build.name
    };

var renderTestresults = function(projectSelection) {
    var suiteResults = projectSelection.selectAll(".suiteResult").data(function (node) {
      return node.testResult.failedTests || [];
    }, function (test) {
      return test.name + "-" + test.className;
    });

    suiteResults.enter()
      .append("div")
      .attr("class", "suiteResult")
      .append("div")
      .attr("class", "list-group-item")
      .html(function (test) {
        return "<h5 class='list-group-item-heading'><a href='" + test.url + "'>" + test.name + "</a></h5>";
      });

    suiteResults.selectAll(".testResult").data(function (suite) {
      return suite.cases;
    }, function (testCase) {
      return testCase.name;
    }).enter()
      .append("div")
      .attr("class", "testResult list-group-item")
      .html(function (testCase) {
        return '<h6 class="list-group-item-heading"><a href="' + testCase.url + '">' + testCase.name + '</a>' +
        '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<a data-toggle="collapse" href="#' + "testCase" + testCase.count + '">Details</a></h6>';
      })
      .append("small")
      .append("pre")
      .attr("class", function (testCase) {
         return (testCase.errorDetails === null || testCase.errorDetails.length < 1200) ? "" : "collapse";
      })
      .attr("id", function (testCase) { return "testCase" + testCase.count; })
      .text(function(testCase) {
       var details = testCase.errorDetails === null ? "" : testCase.errorDetails.replace(/\[(\d+(, )?)*\]/, "");
       return details;
       //details.length < 1200 ? details : details.substring(0, 200) + "\n...\n" + details.substring(details.length - 1000);
       });

    var warnings = projectSelection.selectAll(".warning").data(function (node) {
      return node.warnings || [];
    });

    warnings.enter()
      .append("div")
      .attr("class", "warning")
      .html(function (warning) {
        return "<div class='list-group-item'><h5 class='list-group-item-heading'>" + warning.fileName + "</h5><pre>" + warning.message + "</pre></h5>" +
          "</div>";
      });
  };

      var renderFailedTests = function (nodes) {
        var unstableNodes = nodes
          .filter(function (node) {
            return (node.status === "unstable");
          });

        var unstableProjects = d3.select("#projects").selectAll(".unstableProject").data(unstableNodes, buildName);

        unstableProjects.enter()
          .append("div")
          .attr("class", "list-group-item unstableProject")
          .attr("name", function (el) {
            return el.name;
          })
          .html(function (el) {
            return "<h3 class='list-group-item-heading'><a href='" + el.url + "'>" + el.name + "</a></h3><div class='testResults'></div>";
          });

        unstableProjects.order();

        unstableProjects.exit().remove();

        renderTestresults(unstableProjects.select(".testResults"));

        d3.selectAll("#projects .loading").remove();
      };

setInterval(function() {renderFailedTests(builds)}, 1000);

var updateFunction = function () {
                     if (work.length > 0) {
                           var toUpdateNow = work.slice(0, 10);
                           work = work.slice(10);
                           toUpdateNow.forEach(function (workFunction) { workFunction() });
                         }
                     };
updateFunction();
setInterval(updateFunction, 10000);