define(['common/util', 'broken/controller', 'broken/lastCompletedBuildsOf'], function (util, controller, lastCompletedBuildsOf) {
  var viewName = util.getQueryVariable('view'),
    multijobName = util.getQueryVariable('multijob');

  var urlsToCheck = viewName ? lastCompletedBuildsOf.view(viewName) : lastCompletedBuildsOf.multijob(multijobName);

  controller.init(urlsToCheck);
});