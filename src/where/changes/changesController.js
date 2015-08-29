define(['where/changes/changes', 'where/changes/changesRenderer', 'where/changes/changesUpdater', 'app-config', 'jquery'], function (changes, renderer, updater, config, $) {
  'use strict';
  var my = {};

  my.init = function () {
    $(changes).bind("change", renderer.render);
    updater.update();
    setInterval(updater.update, config.commitUpdateInterval);
  };

  return my;
});