define(['jquery', 'common/throttler', 'app-config', 'broken/builds', 'broken/updater', 'broken/renderer'], function ($, throttlerFactory, config, data, updater, renderer) {
  var my = {},
    viewNeedsUpdate = true,
    throttler = throttlerFactory.newThrottler(updater.addForUrl, config.bulkUpdateSize, config.updateInterval);

  my.init = function (urlsDef) {
    urlsDef.then(throttler.scheduleUpdates);

    $(data).bind(data.event, function () {
      viewNeedsUpdate = true;
      setTimeout(function () {
        if (viewNeedsUpdate) {
          renderer.renderFailedTests();
          viewNeedsUpdate = false;
        }
      }, 0);
    });
  };

  return my;
});