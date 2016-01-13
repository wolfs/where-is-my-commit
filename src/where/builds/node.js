define(function () {
  "use strict";
  var my = {};

  var baseBuildNode = {
    getNewFailCount: function () {
      if (this.newFailCount) {
        return this.newFailCount;
      }
      return 0;
    }

  };
  my.create = function (jobName, revision, url) {
    var n = Object.create(baseBuildNode);
    n.jobName = jobName;
    n.revision = revision;
    n.url = url;
    n.status = "pending";

    n.downstreamProjects = [];
    return n;
  };

  return my;
});