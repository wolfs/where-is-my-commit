define(['jquery', 'common/render', 'util', 'app-config', 'd3', 'common/buildInfo', 'bootstrap'], function($, render, util, config, d3, buildInfo) {
  var multijobSubbuilds,
      multijobUrl,
      lastCompletedBuildsOfView,
      viewUrl,
      work = [],
      builds = [],
      buildKeys = "fullDisplayName,status,number,url,result,actions[failCount,skipCount,totalCount,urlName,name,result[warnings[message,fileName]]]";


  var view = util.getQueryVariable('view');
  var multijob = util.getQueryVariable('multijob');

  if (view) {
    viewUrl = config.jenkinsUrl + '/view/' + view + '/api/json?tree=jobs[url,color]';
    lastCompletedBuildsOfView = $.getJSON(viewUrl).then(function (view) {
      return view.jobs.
        filter(function (job) {
          return job.color !== 'blue';
        }).
        map(function (job) {
          return job.url + 'lastCompletedBuild/';
        });
    });
  }
  if (multijob) {
    multijobUrl = config.jenkinsUrl + '/job/' + multijob + '/lastSuccessfulBuild/api/json?tree=subBuilds[url]';
    multijobSubbuilds = $.getJSON(multijobUrl).then(function (multijobBuild) {
      return multijobBuild.subBuilds.map(function (subBuild) {
        return config.jenkinsUrl + "/" + subBuild.url;
      });
    });
  }

  var urlsToCheck = view ? lastCompletedBuildsOfView : multijobSubbuilds;
  var buildUrl = function (mybuildUrl) {
    return mybuildUrl +
      "/api/json?tree=" + buildKeys;
  };

  var getBuildDef = function (myBuildUrl) {
    return $.getJSON(buildUrl(myBuildUrl)).then(function (build) {
      return build;
    });
  };

  urlsToCheck.then(function (urls) {
    return urls.forEach(function (url) {
      work.push(function () {
        getBuildDef(url).then(function (build) {
          var buildData = {
            name: build.fullDisplayName,
            url: build.url,
            testResult: buildInfo.getTestResult(build),
            warnings: buildInfo.getWarnings(build),
            status: build.result.toLowerCase()
          };
          builds.push(buildData);
          if (buildData.status === "unstable" && buildData.testResult.totalCount > 0) {
            buildInfo.addFailedTests(buildData, function (failedTests) {
              buildData.testResult.failedTests = failedTests;
            });
          }
        });
      });
    });
  });

  var buildName = function (build) {
    return build.name;
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

    render.renderTestresults(unstableProjects.select(".testResults"));

    d3.selectAll("#projects .loading").remove();
  };

  setInterval(function () {
    renderFailedTests(builds);
  }, 1000);

  var updateFunction = function () {
    if (work.length > 0) {
      var toUpdateNow = work.slice(0, 10);
      work = work.slice(10);
      toUpdateNow.forEach(function (workFunction) {
        workFunction();
      });
    }
  };
  updateFunction();
  setInterval(updateFunction, 10000);
});