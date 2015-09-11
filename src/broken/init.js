define(['jquery', 'common/util', 'broken/controller', 'broken/lastBuildsOf'], function ($, util, controller, lastCompletedBuildsOf) {
  var viewName = util.getQueryVariable('view'),
    multijobName = util.getQueryVariable('multijob');

  var urlsToCheck = viewName ? lastCompletedBuildsOf.view(viewName) :
    (multijobName ? lastCompletedBuildsOf.multijob(multijobName) : $.Deferred().resolve([]));

  controller.init(urlsToCheck);
});