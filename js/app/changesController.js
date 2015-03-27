define(['app/changes', 'app/changesRenderer', 'app/changesUpdater', 'app/config', 'jquery'], function (changes, renderer, updater, config, $) {
  var my = {};

  my.init = function () {
    $(changes).bind("change", renderer.render);
    updater.update();
    setInterval(updater.update, config.commitUpdateInterval);
  };

  return my;
});