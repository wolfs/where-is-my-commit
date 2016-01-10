define(['jquery', 'app-config'], function ($, config) {
  var my = {};

  var defaultSelector = 'lastCompletedBuild';

  my.multijob = function (multijobName, selectorArg) {
    var selector = selectorArg || defaultSelector,
      multijobUrl = config.jenkinsUrl + '/job/' + multijobName + '/' + selector + '/api/json?tree=subBuilds[url]';
    return $.getJSON(multijobUrl).then(function (multijobBuild) {
      return multijobBuild.subBuilds.map(function (subBuild) {
        return config.jenkinsUrl + "/" + subBuild.url;
      });
    });
  };

  my.view = function (viewName, selectorArg) {
    var selector = selectorArg || defaultSelector,
      viewUrl = config.jenkinsUrl + '/view/' + viewName + '/api/json?tree=jobs[url,color]';
    return $.getJSON(viewUrl).then(function (view) {
      return view.jobs.
        filter(function (job) {
          return job.color && job.color !== 'blue' && job.color !== 'notbuilt';
        }).
        map(function (job) {
          return job.url + selector + '/';
        });
    });
  };

  return my;
});
