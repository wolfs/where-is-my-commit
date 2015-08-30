define({
  getQueryVariable: function (variable) {
    'use strict';
    var search = window.location.search;
    return this.getQueryVariableFromSearch(variable, search);
  },

  getQueryVariableFromSearch: function (variable, search) {
    'use strict';
    var query = search.substring(1);
    var results = query.split("&").map(function (el) {
      return el.split("=");
    }).filter(function (el) {
      return (el[0] === variable);
    }).map(function (el) {
      return el[1];
    });
    return results.length === 0 ? false : results[0];
  },

  newThrottler: function (updateFunction, bulkUpdateSizeParam, updateIntervalParam) {
    var throttler = {},
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

    throttler.scheduleUpdate = function (node) {
      toUpdate.push(node);
      startTimerIfNecessary();
    };

    throttler.scheduleUpdates = function (nodes) {
      nodes.forEach(throttler.scheduleUpdate);
    };

    return throttler;
  }
});