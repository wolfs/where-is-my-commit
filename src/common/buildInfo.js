import * as config from "app-config";

import $ from "jquery";

var suiteId = 0;
var testCaseCount = 1;
var defaultBuildKeys = [
  "number",
  "url",
  "result",
  "timestamp"
];
var defaultActionKeys = [
  "failCount",
  "skipCount",
  "totalCount",
  "urlName",
  "name",
  "result[warnings[message,fileName]]",
  "claimDate,claimed,claimedBy,reason"
];

export var buildKeys = function (buildKeys, actionKeys) {
  return defaultBuildKeys.concat(buildKeys, ["actions[" + defaultActionKeys.concat(actionKeys).join(",") + "]"]).join(",");
};

export var getWarnings = function (build) {
  var actions = build.actions;

  var warningsActions = actions.filter(function (action) {
    return action.name === "findbugs" || action.name === "pmd" || action.name === "warnings";
  });

  return Array.prototype.concat.apply([], warningsActions.map(function (action) {
    return action.result.warnings.map(function (warning) {
      return {name: action.name, message: warning.message, fileName: warning.fileName, id: testCaseCount++};
    }).filter(function (warning) {
      return !(warning.name === "warnings" && config.filterWarnings.some(function (filterWarning) {
        return warning.message.indexOf(filterWarning) > -1;
      }));
    });
  }));
};

export var getTestResult = function (build) {
  var actions = build.actions;

  var testReports = actions.filter(function (action) {
    return action.urlName === "testReport";
  });

  if (testReports.length > 0) {
    return Object.assign({}, testReports[0], {failedTests: []});
  }
  return {
    failCount: 0,
    skipCount: 0,
    totalCount: 0,
    failedTests: []
  };
};

export var addFailedTests = function (build, callback, failureCallbackArg) {
  var failureCallback = failureCallbackArg || function () { };
  var suiteTree = "suites[name,cases[age,className,name,status,errorDetails,errorStackTrace,testActions[claimDate,claimed,claimedBy,reason]]]";
  $.getJSON(build.url + "testReport/api/json?tree=" + suiteTree + ",childReports[child[number,url],result[" + suiteTree + "]]")
    .then(function (testReport) {
      if (testReport.suites || testReport.childReports) {
        var suites = testReport.suites ? testReport.suites : [].concat.apply([], testReport.childReports.map(function (child) {
          var suites = child.result.suites;
          suites.forEach(function (suite) {
            suite.url = child.child.url;
          });
          return suites;
        }));
        var failedTests = suites.map(function (suite) {
          var dotBeforeClass = suite.name.lastIndexOf(".");
          var packageOfSuite = suite.name.substring(0, dotBeforeClass);
          var suiteUrl = (suite.url ? suite.url : build.url) + "testReport/" + (packageOfSuite ? packageOfSuite : "(root)") + "/" + suite.name.substring(dotBeforeClass + 1) + "/";
          return {
            type: "TEST",
            name: suite.name,
            url: suiteUrl,
            id: suiteId++,
            cases: suite.cases.filter(function (test) {
              return (test.status !== "PASSED") && (test.status !== "SKIPPED") && (test.status !== "FIXED");
            }).map(function (testCase) {
              testCase.url = suiteUrl + testCase.name.replace(/[^a-zA-Z0-9_$]/g, "_") + "/";
              testCase.id = testCaseCount++;
              if (testCase.testActions) {
                var claims = testCase.testActions.filter(function (c) {
                  return c.claimed === true;
                });
                testCase.claim = claims.length == 1 ? claims[0] : {claimed: false};
              } else {
                testCase.claim = {claimed: false};
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