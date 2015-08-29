define(['where/builds/nodesData', 'where/builds/nodesRenderer', 'where/builds/nodeUpdater', 'app-config', 'jquery', 'bootstrap'],
  function (data, renderer, updater, config, $, bs) {
  'use strict';
    var viewNeedsUpdate = true,
      my = {};

    var updateNext = function () {
      data.updateNextNodes(updater.update);
    };

    var changeEvent = "change";

    my.init = function () {
      if (data.revision) {
        data.scheduleUpdate(data.data);

        $(data.data).bind(changeEvent, function () {
          viewNeedsUpdate = true;
          setTimeout(function () {
            if (viewNeedsUpdate) {
              renderer.renderData();
              viewNeedsUpdate = false;
            }
          }, 0);
        });
        $(data.data).trigger(changeEvent);
        updateNext();
        setInterval(updateNext, config.updateInterval);
      }

      $(document).ready(function () {
        var revs = $("#revs");
        revs.on('show.bs.dropdown', function () {
          $("#graph").attr("class", "col-md-offset-3 col-md-9");
          $(data.data).trigger(changeEvent);
        });
        revs.on('hide.bs.dropdown', function () {
          $("#graph").attr("class", "col-md-12");
          $(data.data).trigger(changeEvent);
        });
      });
    };
    return my;
  }
);