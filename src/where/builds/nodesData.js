define(['where/builds/node', 'app-config', 'common/util'], function (node, config, util) {
  'use strict';
  var my = {};

  var revisionString = util.getQueryVariable("revision");

  my.revision = parseInt(revisionString, 10);
  my.data = node.create(config.startJob, my.revision);

  return my;
});
