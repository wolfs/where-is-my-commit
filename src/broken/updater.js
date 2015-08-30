define(['broken/builds', 'common/util', 'common/buildInfo', 'jquery'], function (data, util, buildInfo, $) {
  var my = {};

  var buildUrl = function (mybuildUrl) {
    return mybuildUrl +
      "/api/json?tree=" + buildInfo.buildKeys(['fullDisplayName'], []);
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
      if (buildData.status === "unstable" && buildData.testResult.totalCount > 0) {
        buildInfo.addFailedTests(buildData, function (failedTests) {
          buildData.testResult.failedTests = failedTests;
          $(data).trigger(data.event);
        });
      }
    });
  };

  return my;
});