define(['builds/nodesData', 'builds/nodesRenderer', 'builds/nodeUpdater', 'app-config', 'jquery'],
  function (data, renderer, updater, config, $) {
    var viewNeedsUpdate = true,
      my = {};

    var updateNext = function () {
      data.updateNextNodes(updater.update)
    };

    my.init = function () {
      if (data.revision) {
        data.scheduleUpdate(data.data);

        $(data.data).bind("change", function () {
          viewNeedsUpdate = true;
          setTimeout(function () {
            if (viewNeedsUpdate) {
              renderer.renderData();
              viewNeedsUpdate = false;
            }
          }, 0);
        });
        $(data.data).trigger("change");
        updateNext();
        setInterval(updateNext, config.updateInterval);
      }

    };

    return my;
  }
);