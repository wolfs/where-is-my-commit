define(['app/node', 'app/config', 'app/util'], function (node, config, util) {
  var my = {};

  var toUpdate = [];

  var revisionString = util.getQueryVariable("revision");

  my.scheduleUpdate = function (node) {
    toUpdate.push(node);
  };

  my.updateNextNodes = function (updateFunction) {
    if (toUpdate.length > 0) {
      var toUpdateNow = toUpdate.slice(0, config.bulkUpdateSize);
      toUpdate = toUpdate.slice(config.bulkUpdateSize);
      toUpdateNow.map(updateFunction);
    }
  };

  my.revision = parseInt(revisionString, 10);
  my.data = node.create(config.startJob, my.revision);


  return my;
});
