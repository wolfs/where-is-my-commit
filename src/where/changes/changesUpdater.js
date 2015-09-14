define(['where/changes/changes', 'app-config', 'jquery', 'common/util'], function (changes, config, $, util) {
  'use strict';
  var my = {};

  my.update = function () {

    var startJob = util.getQueryVariable("startJob") || config.startJob,
      jobRequest = $.getJSON(
      config.jenkinsUrl + "/job/" + startJob + "/api/json?tree=builds[changeSet[*[*]]]{,10}"
    );
    jobRequest.then(function (job) {
      var builds = job.builds;

      changes.commits = builds.map(function (build) {
        return build.changeSet.items;
      }).reduce(function (a, b) {
        return a.concat(b);
      });

      $(changes).trigger("change");
    });
  };

  return my;
});