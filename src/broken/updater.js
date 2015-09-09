define(['broken/builds', 'common/util', 'common/buildInfo', 'jquery'], function (data, util, buildInfo, $) {
  var my = {};

  var buildUrl = function (mybuildUrl) {
    return mybuildUrl +
      "/api/json?tree=" + buildInfo.buildKeys(['fullDisplayName'], []);
  };

  var buildId = 0;

  var getBuildDef = function (myBuildUrl) {
    return $.getJSON(buildUrl(myBuildUrl)).then(function (build) {
      return build;
    });
  };

  my.addForUrl = function (url) {
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
        claim: claims.length === 1 ? claims[0] : {claimed: false},
        id: buildId++
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

  my.claim = function (objectToClaim, claim) {
    var request = $.post(objectToClaim.url + '/claim/claim', {
        Submit: "Claim",
        json: JSON.stringify(claim)
      }
    );
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
      objectToClaim.claim = {claimed: false};
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

  return my;
});