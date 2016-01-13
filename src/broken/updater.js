import data from "broken/builds";
import * as buildInfo from "common/buildInfo";
import $ from "jquery";
import config from "app-config";
import { addBuildData, addTestResults, failedGettingTestResults } from "./actions";

import store from "./store";

const buildUrl = function (mybuildUrl) {
  return mybuildUrl +
    "/api/json?tree=" + buildInfo.buildKeys(["fullDisplayName"], []);
};

let buildId = 0;

const getBuildDef = function (myBuildUrl) {
  return $.getJSON(buildUrl(myBuildUrl)).then(function (build) {
    return build;
  });
};

export const addForUrl = function (url, progressCallbackParm) {
  var progressCallback = progressCallbackParm || function () {};
  getBuildDef(url).then(function (build) {
    var claims = build.actions.filter(function (c) {
      return c.claimed === true;
    });

    const status = build.result.toLowerCase();
    const testResult = buildInfo.getTestResult(build);
    var buildData = {
      name: build.fullDisplayName,
      url: build.url,
      date: new Date(build.timestamp),
      testResult,
      warnings: buildInfo.getWarnings(build),
      status,
      claim: claims.length === 1 ? claims[0] : {claimed: false},
      id: buildId++,
      hasFailedTests: status === "unstable" && testResult.totalCount > 0
    };
    data.builds.push(buildData);
    $(data).trigger(data.event);
    store.dispatch(addBuildData(buildData));
    progressCallback("build", buildData);
    if (buildData.hasFailedTests) {
      buildInfo.addFailedTests(buildData, function (failedTests) {
        buildData.testResult.failedTests = failedTests;
        $(data).trigger(data.event);
        store.dispatch(addTestResults(buildData.id, failedTests));
        progressCallback("testResult", failedTests);
      }, function() {
        progressCallback();
        store.dispatch(failedGettingTestResults(buildData.id));
      });
    } else {
      progressCallback("testResult", false);
    }
  }, function () {
    progressCallback();
    progressCallback();
  });
};

export const claim = function (objectToClaim, claim) {
  var request = $.post(objectToClaim.url + "/claim/claim",
    {
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

export const unclaim = function (objectToClaim) {
  var request = $.post(objectToClaim.url + "/claim/unclaim");
  request.then(function () {
    objectToClaim.claim = {claimed: false};
    $(data).trigger(data.event);
  });
  return request;
};

export const users = function () {
  return $.getJSON(config.jenkinsUrl + "/asynchPeople/api/json?tree=users[user[fullName,id]]").then(function (jsonUsers) {
    return jsonUsers.users.map(function (userInfo) {
      return userInfo.user;
    });
  });
};

export const views = function () {
  return $.getJSON(config.jenkinsUrl + "/api/json?tree=views[name,url]").then(function (jenkins) {
    return jenkins.views.sort(function (a, b) {
      return a.name.localeCompare(b.name);
    });
  });
};