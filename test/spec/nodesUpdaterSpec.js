var updater = require("where/builds/nodeUpdater");
var node = require("where/builds/node");
var config = require("app-config");

var ajax = jasmine.Ajax,
  currentJobName,
  nodeToUpdate,
  success = "SUCCESS",
  aborted = "ABORTED",
  buildKeys = "number,url,result,timestamp,actions[failCount,skipCount,totalCount,urlName,name,result[warnings[message,fileName]],claimDate,claimed,claimedBy,reason,triggeredProjects[name,url,downstreamProjects[url,name]]]",
  jobApiRequest = "api/json?tree=url,downstreamProjects[url,name],lastCompletedBuild[" + buildKeys + "]",
  buildApiRequest = "api/json?tree=" + buildKeys;

beforeEach(function () {
  jasmine.Ajax.install();
  currentJobName = "someJob";
  nodeToUpdate = node.create(currentJobName, "1234");
});

afterEach(function () {
  jasmine.Ajax.uninstall();
});


var jobUrl = function () {
  return config.jenkinsUrl + "/job/" + currentJobName + "/";
};

var jobApiUrl = function () {
  return jobUrl() + jobApiRequest;
};

var buildUrl = function (number) {
  return config.jenkinsUrl + "/job/" + currentJobName + "/" + number + "/";
};

var buildApiUrl = function (number) {
  return buildUrl(number) + buildApiRequest;
};

var envVarsApiUrl = function (number) {
  return buildUrl(number) + "injectedEnvVars/api/json?tree=envMap[REV]";
};

var envVarsJson = function (revision) {
  return {
    envMap: {
      REV: revision
    }
  };
};


var jobJson = function (lastCompletedBuild, downstreamProjects) {
  return {
    url: jobUrl(currentJobName),
    downstreamProjects: downstreamProjects || [],
    //[{url: "http://someOtherUrl", name: "downstreamJob"}],
    lastCompletedBuild: lastCompletedBuild
  };
};

var buildJson = function (number, result, triggeredProjects, testAction) {
  return {
    number: number.toString(),
    url: buildUrl(number),
    result: result || "SUCCESS",
    actions: [
      {
        triggeredProjects: triggeredProjects || []
      },
      testAction || {}
    ]
  };
};

var jsonResponse = function (json) {
  return {
    responseText: JSON.stringify(json),
    status: 200
  };
};

var doNow = function (work) {
  work();
};

var scheduleNow = function (work) {
  setTimeout(work, 0);
};

var update = function (node) {
  updater.updateFunction(doNow, doNow)(node);
};

var delayedUpdate = function (node) {
  updater.updateFunction(scheduleNow, scheduleNow)(node);
};

describe("NodeUpdater", function () {
  it("should first load the project", function () {
    update(nodeToUpdate);

    var jobRequest = jasmine.Ajax.requests.mostRecent();
    expect(jobRequest.url).toBe(jobApiUrl());
    jobRequest.respondWith(jsonResponse(jobJson(buildJson(5))));
    expect(nodeToUpdate.url).toBe(jobUrl());
  });

  it("should get the envVars of the build", function () {
    jasmine.Ajax.stubRequest(jobApiUrl()).andReturn(
      jsonResponse(jobJson(buildJson(5)))
    );

    update(nodeToUpdate);

    var requests = jasmine.Ajax.requests;
    expect(requests.count()).toBe(3);

    var envVarsApiRequest5 = requests.filter(envVarsApiUrl(5))[0];
    var buildRequest4 = requests.filter(buildApiUrl(4))[0];
    expect(envVarsApiRequest5).toBeDefined();
    expect(buildRequest4).toBeDefined();
    buildRequest4.respondWith(jsonResponse(buildJson(4)));

    expect(requests.count()).toBe(4);
    var envVarsApiRequest4 = requests.mostRecent();
    expect(envVarsApiRequest4.url).toBe(envVarsApiUrl(4));
    envVarsApiRequest4.respondWith(jsonResponse(envVarsJson("1233")));
    envVarsApiRequest5.respondWith(jsonResponse(envVarsJson("1235")));

    expect(nodeToUpdate.url).toBe(buildUrl(5));
    expect(nodeToUpdate.revision).toBe(1235);
  });

  var setupBuilds = function (results, givenRevisionFun) {
    var revisionFun = givenRevisionFun || (num => num);
    var builds = results.map(function (result, idx) {
      var buildNumber = idx + 1;
      var build = buildJson(buildNumber, result);
      ajax.stubRequest(buildApiUrl(buildNumber)).andReturn(jsonResponse(build));
      ajax.stubRequest(envVarsApiUrl(buildNumber)).andReturn(jsonResponse(envVarsJson(revisionFun(buildNumber, result))));
      return build;
    });
    ajax.stubRequest(jobApiUrl()).andReturn(jsonResponse(jobJson(builds[results.length - 1])));
    return builds;
  };

  var setupLastBuild = function (result, number, revision) {
    var build = buildJson(number, result);
    ajax.stubRequest(buildApiUrl(number)).andReturn(jsonResponse(build));
    ajax.stubRequest(envVarsApiUrl(number)).andReturn(jsonResponse(envVarsJson(revision || number)));
    ajax.stubRequest(jobApiUrl()).andReturn(jsonResponse(jobJson(build)));
    return build;
  };

  it("should skip aborted builds", function () {
    setupBuilds([success, aborted, success]);
    nodeToUpdate.revision = 2;

    update(nodeToUpdate);

    expect(nodeToUpdate.revision).toBe(3);
    expect(nodeToUpdate.previousRevision).toBe(1);
  });

  it("should update the build when it is built", function () {
    setupBuilds([success, success]);
    nodeToUpdate.revision = 3;

    delayedUpdate(nodeToUpdate);

    expect(nodeToUpdate.url).toBe(jobUrl());

    setupLastBuild(success, 3);

    update(nodeToUpdate);

    expect(nodeToUpdate.url).toBe(buildUrl(3));
  });

  it("should not stop if the build with the correct revision is aborted", function () {
    setupBuilds([success, success, aborted]);
    nodeToUpdate.revision = 3;

    delayedUpdate(nodeToUpdate);

    expect(nodeToUpdate.url).toBe(jobUrl());
  });

  it("should change the revision to the real built version", function () {
    setupBuilds([success, success], function (number) {
      return number === 1 ? 1 : 5;
    });
    nodeToUpdate.revision = 3;

    update(nodeToUpdate);

    expect(nodeToUpdate.revision).toBe(5);
    expect(nodeToUpdate.previousRevision).toBe(1);
  });
});
