define(['changes/changes', 'app-config', 'jquery'], function (changes, config, $) {
  'use strict';
  var my = {};

  my.update = function () {
    var jobRequest = $.getJSON(
      config.jenkinsUrl + "/job/" + config.startJob + "/api/json?tree=builds[changeSet[*[*]]]{,10}"
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