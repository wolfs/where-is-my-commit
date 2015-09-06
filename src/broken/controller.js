define(['jquery', 'common/util', 'app-config', 'broken/builds', 'broken/updater', 'broken/renderer'], function ($, util, config, data, updater, renderer) {
  var my = {},
    throttler = util.newThrottler(updater.addForUrl, config.bulkUpdateSize, config.updateInterval);

  my.init = function (urlsDef) {
    renderer.initFormSubmit();
    urlsDef.then(throttler.scheduleUpdates);
    renderer.renderLoop();
  };

  return my;
});