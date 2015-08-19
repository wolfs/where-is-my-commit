define(function() {
  var my = {};

  var testCaseCount = 1;

  my.buildKeys =
    "number,url,result,actions[triggeredProjects[name,url,downstreamProjects[url,name]],failCount,skipCount,totalCount,urlName,name,result[warnings[message,fileName]]]";

  my.getWarnings = function (build) {
    var actions = build.actions;

    var warningsActions = actions.filter(function (action) {
      return action.name === "findbugs" || action.name === "pmd" || action.name === "warnings";
    });

    return Array.prototype.concat.apply([], warningsActions.map(function (action) {
      return action.result.warnings.map(function (warning) {
        return {name: action.name, message: warning.message, fileName: warning.fileName};
      }).filter(function (warning) {
        return !(warning.name === "warnings" && warnings.message.indexOf('(IF reasonable!) ADD)') > -1);
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
    $.getJSON(build.url + "testReport/api/json?tree=suites[name,cases[age,className,name,status,errorDetails]]")
      .then(function (testReport) {
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
              testCase.url = suiteUrl + testCase.name + "/";
              testCase.count = testCaseCount++;
              return testCase;
            })
          };
        }).filter(function (suite) {
          return suite.cases.length > 0;
        });
        callback(failedTests);
      });
  };


  return my;
});