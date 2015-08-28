define(['jquery', 'optional!my-config'], function ($, globalConfig) {
  'use strict';
  return {
    width: globalConfig.width || ($("#graph").width()),
    height: globalConfig.height || 2000,
    jenkinsUrl: globalConfig.jenkinsUrl || "http://localhost:8080",
    startJob: globalConfig.startJob || "chain-start",
    updateInterval: globalConfig.updateInterval || 2000,
    commitUpdateInterval: globalConfig.commitUpdateInterval || 20000,
    bulkUpdateSize: globalConfig.bulkUpdateSize || 10,
    filterWarnings: globalConfig.filterWarnings || []
  };
});
