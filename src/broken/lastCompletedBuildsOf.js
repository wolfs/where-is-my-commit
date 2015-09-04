define(['jquery', 'app-config'], function ($, config) {
  var my = {};

  my.multijob = function (multijobName) {
    var multijobUrl = config.jenkinsUrl + '/job/' + multijobName + '/lastSuccessfulBuild/api/json?tree=subBuilds[url]';
    return $.getJSON(multijobUrl).then(function (multijobBuild) {
      return multijobBuild.subBuilds.map(function (subBuild) {
        return config.jenkinsUrl + "/" + subBuild.url;
      });
    });
  };

  my.view = function (viewName) {
    var viewUrl = config.jenkinsUrl + '/view/' + viewName + '/api/json?tree=jobs[url,color]';
    return $.getJSON(viewUrl).then(function (view) {
      return view.jobs.
        filter(function (job) {
          return job.color !== 'blue';
        }).
        map(function (job) {
          return job.url + 'lastSuccessfulBuild/';
        });
    });
  };

  return my;
});
