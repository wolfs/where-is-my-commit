define(['jquery'], function ($) {
  'use strict';
  var globalConfig = (window && window.whereIsMyCommit) || {};

  var mergeWithDefault = function (globalConfig) {
    return {
      width: globalConfig.width || ($("#graph").width()),
      height: globalConfig.height || 2000,
      jenkinsUrl: globalConfig.jenkinsUrl || "http://localhost:8080",
      startJob: globalConfig.startJob || "chain-start",
      updateInterval: globalConfig.updateInterval || 2000,
      coreUpdateInterval: globalConfig.coreUpdateInterval || globalConfig.updateInterval || 2000,
      commitUpdateInterval: globalConfig.commitUpdateInterval || 20000,
      bulkUpdateSize: globalConfig.bulkUpdateSize || 10,
      filterWarnings: globalConfig.filterWarnings || []
    };
  };

  return mergeWithDefault(globalConfig);
});
