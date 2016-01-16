define(["where/builds/node", "app-config", "common/util"], function (node, config, util) {
  "use strict";
  var my = {};

  var revisionString = util.getQueryVariable("revision"),
    startJob = util.getQueryVariable("startJob") || config.startJob;

  my.revision = parseInt(revisionString, 10);
  my.data = node.create(startJob, my.revision);
  my.event = "change";

  return my;
});
