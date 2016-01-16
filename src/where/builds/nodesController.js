define(["common/util", "where/builds/nodesData", "where/builds/nodesRenderer", "where/builds/nodeUpdater", "app-config", "jquery", "bootstrap"],
  function (util, data, renderer, updater, config, $) {
    "use strict";
    var my = {};

    var coreThrottler = util.newThrottler(config.bulkUpdateSize, config.coreUpdateInterval);
    var throttler = util.newThrottler(config.bulkUpdateSize, config.updateInterval);
    var updateFunction = updater.updateFunction(coreThrottler.scheduleUpdate, throttler.scheduleUpdate);

    var changeEvent = "change";

    my.init = function () {
      if (data.revision) {
        renderer.renderLoop();
        coreThrottler.scheduleUpdate(function () {
          updateFunction(data.data);
        });
      }

      $(document).ready(function () {
        var revs = $("#revs");
        revs.on("show.bs.dropdown", function () {
          $("#graph").attr("class", "col-md-offset-3 col-md-9");
          $(data.data).trigger(changeEvent);
        });
        revs.on("hide.bs.dropdown", function () {
          $("#graph").attr("class", "col-md-12");
          $(data.data).trigger(changeEvent);
        });
      });
    };
    return my;
  }
);