export function getQueryVariable(variable) {
  "use strict";
  var search = window.location.search;
  return this.getQueryVariableFromSearch(variable, search);
}

export function getQueryVariableFromSearch(variable, search) {
  "use strict";
  var query = search.substring(1);
  var params = this.queryVariablesFromQuery(query);
  return params[variable];
}

export function queryVariablesFromQuery(query) {
  var params = {};
  if (query !== "") {
    query
      .split("&").map(function (el) {
        return el.split("=");
      })
      .forEach(function (args) {
        params[decodeURIComponent(args[0])] = args[1] ? decodeURIComponent(args[1].replace(/\+/g, " ")) : args[1];
      });
  }
  return params;
}

export function queryVariables() {
  var search = window.location.search;
  var query = search.substring(1);
  return this.queryVariablesFromQuery(query);
}

export function newThrottler(bulkUpdateSizeParam, updateIntervalParam) {
  var throttler = {},
    workUnits = [],
    currentTimer,
    timerRunning = false,
    bulkUpdateSize = bulkUpdateSizeParam || 10,
    updateInterval = updateIntervalParam || 2000;

  var startTimer = function () {
    updateNext();
    currentTimer = setInterval(function () {
      if (workUnits.length === 0) {
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
    if (workUnits.length > 0) {
      var workForNow = workUnits.slice(0, bulkUpdateSize);
      workUnits = workUnits.slice(bulkUpdateSize);
      workForNow.forEach(function (workUnit) {
        workUnit();
      });
    }
  };

  throttler.scheduleUpdate = function (workUnit) {
    throttler.scheduleUpdates([workUnit]);
  };

  throttler.scheduleUpdates = function (newWorkUnits) {
    Array.prototype.push.apply(workUnits, newWorkUnits);
    startTimerIfNecessary();
  };

  return throttler;
}

export function sequentially(args, requestFunction) {
  args.reverse().reduce(function (previous, current) {
    return function () {
      requestFunction(current).always(previous);
    };
  }, function () {
  })();
}

export function mapValues(obj, fn) {
  return Object.keys(obj).reduce(function (result, key) {
    result[key] = fn(obj[key], key);
    return result;
  }, {});
}