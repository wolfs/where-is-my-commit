define({
  getQueryVariable: function (variable) {
    'use strict';
    var search = window.location.search;
    return this.getQueryVariableFromSearch(variable, search);
  },

  getQueryVariableFromSearch: function (variable, search) {
    'use strict';
    var query = search.substring(1);
    var params = this.queryVariablesFromQuery(query);
    return params[variable];
  },

  queryVariablesFromQuery: function (query) {
    var params = {};
    query
      .split("&").map(function (el) {
        return el.split("=");
      })
      .forEach(function (args) {
        params[decodeURIComponent(args[0])] = args[1] ? decodeURIComponent(args[1].replace(/\+/g, ' ')) : args[1];
      });
    return params;
  },

  queryVariables: function () {
    var search = window.location.search;
    var query = search.substring(1);
    return this.queryVariablesFromQuery(query);
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
      throttler.scheduleUpdates([node]);
    };

    throttler.scheduleUpdates = function (nodes) {
      Array.prototype.push.apply(toUpdate, nodes);
      startTimerIfNecessary();
    };

    return throttler;
  },

  sequentially: function (args, requestFunction) {
    args.reverse().reduce(function (previous, current) {
      return function () {
        requestFunction(current).always(previous);
      };
    }, function () {
    })();
  }
});