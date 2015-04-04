define(['jquery'], function ($) {
  return {
    width: $(window).width() - 25,
    height: 2000,
    jenkinsUrl: "http://localhost:8080",
    startJob: "chain-start",
    updateInterval: 2000,
    commitUpdateInterval: 20000,
    bulkUpdateSize: 10
  }
});
