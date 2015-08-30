define([], function () {
  var my = {};

  my.newThrottler = function (updateFunction, bulkUpdateSizeParam, updateIntervalParam) {
    var myt = {},
      toUpdate = [],
      currentTimer,
      timerRunning = false,
      bulkUpdateSize = bulkUpdateSizeParam || 10,
      updateInterval = updateIntervalParam || 2000;

    var startTimer = function () {
      updateNext();
      currentTimer = setInterval(function () {
        if (toUpdate.length === 0) {
          clearInterval(currentTimer);
          timerRunning = false;
        } else {
          updateNext();
        }
      }, updateInterval);
      timerRunning = true;
    };

    var startTimerIfNecessary = function () {
      if (!timerRunning) {
        startTimer();
      }
    };

    var updateNext = function () {
      if (toUpdate.length > 0) {
        var toUpdateNow = toUpdate.slice(0, bulkUpdateSize);
        toUpdate = toUpdate.slice(bulkUpdateSize);
        toUpdateNow.forEach(updateFunction);
      }
    };

    myt.scheduleUpdate = function (node) {
      toUpdate.push(node);
      startTimerIfNecessary();
    };

    myt.scheduleUpdates = function (nodes) {
      nodes.forEach(myt.scheduleUpdate);
    };

    return myt;
  };

  return my;
});