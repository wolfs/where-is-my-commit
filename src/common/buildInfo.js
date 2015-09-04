define(['app-config'], function (config) {
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
    return defaultBuildKeys.concat(buildKeys, ['actions[' + defaultActionKeys.concat(actionKeys).join(',') + "]"]).join(',');
  };

  my.getWarnings = function (build) {
    var actions = build.actions;

    var warningsActions = actions.filter(function (action) {
      return action.name === "findbugs" || action.name === "pmd" || action.name === "warnings";
    });

    return Array.prototype.concat.apply([], warningsActions.map(function (action) {
      return action.result.warnings.map(function (warning) {
        return {name: action.name, message: warning.message, fileName: warning.fileName};
      }).filter(function (warning) {
        return !(warning.name === "warnings" && config.filterWarnings.some(function (filterWarning) {
          return warning.message.indexOf(filterWarning) > -1;
        }));
      });
    }));
  };

  my.getTestResult = function (build) {
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

  my.addFailedTests = function (build, callback) {
    $.getJSON(build.url + "testReport/api/json?tree=suites[name,cases[age,className,name,status,errorDetails,errorStackTrace,testActions[claimDate,claimed,claimedBy,reason]]]")
      .then(function (testReport) {
        if (testReport.suites) {
          var failedTests = testReport.suites.map(function (suite) {
            var dotBeforeClass = suite.name.lastIndexOf(".");
            var packageOfSuite = suite.name.substring(0, dotBeforeClass);
            var suiteUrl = build.url + "testReport/" + (packageOfSuite ? packageOfSuite : "(root)") + "/" + suite.name.substring(dotBeforeClass + 1) + "/";
            return {
              name: suite.name,
              url: suiteUrl,
              cases: suite.cases.filter(function (test) {
                return (test.status !== 'PASSED') && (test.status !== 'SKIPPED') && (test.status !== 'FIXED');
              }).map(function (testCase) {
                testCase.url = suiteUrl + testCase.name.replace(/[^a-zA-Z0-9_]/g, "_") + "/";
                testCase.count = testCaseCount++;
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
        }
      });
  };


  return my;
});