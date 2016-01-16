import * as util from "common/util";
import $ from "jquery";
import config from "app-config";
import * as renderer from "broken/renderer";
import Spinner from "spin.js";
import * as updater from "broken/updater";
import store from "./store";
import { deselect } from "./actions";

// TODO: Collapsed, Collapse-All, Progess into redux State
// TODO: Render on load should all be done by the renderer and corresponding states
// TODO: Views into state

var throttler = util.newThrottler(config.bulkUpdateSize, config.coreUpdateInterval);

var initFormSubmit = function () {
  var selectedObjects = function (objs) {
    const values = Object.keys(objs).map(key => objs[key]);
    return values.filter(value => value.selected);
  };
  var selectedTestCases = () => selectedObjects(store.getState().testCases);
  var selectedBuilds = () => selectedObjects(store.getState().builds);

  $("#claimForm").submit(function (event) {
    try {
      var testCases = selectedTestCases();
      var builds = selectedBuilds();
      var claim = {};
      $(this).serializeArray().forEach(function (field) {
        claim[field.name] = field.value;
      });
      util.sequentially(testCases.concat(builds), function (testCase) {
        return updater.claim(testCase, {...claim});
      });
      store.dispatch(deselect());
    } catch (err) {
      console.log(err); // eslint-disable-line no-console
    }
    event.preventDefault();
  });

  $("#dropClaimsForm").submit(function (event) {
    try {
      var testCases = selectedTestCases();
      var builds = selectedBuilds();
      testCases.concat(builds).forEach(updater.unclaim);
      store.dispatch(deselect());
    } catch (err) {
      console.log(err); // eslint-disable-line no-console
    }
    event.preventDefault();
  });
};

var progressUpdater = function (number) {
  var my = {};

  my.total = number;
  my.current = 0;

  my.callback = function () {
    my.current++;
    my.updateProgress();
  };

  my.updateProgress = function () {
    $("#loadingProgress").width((my.current * 100 / my.total) + "%");

    if (my.current === my.total) {
      $("#loadingSpinner").html("<span class='label label-success'><span class='glyphicon glyphicon-ok'></span></span>");
    }
  };

  new Spinner({
    lines: 13, // The number of lines to draw
    length: 28, // The length of each line
    width: 14, // The line thickness
    radius: 42, // The radius of the inner circle
    scale: 0.1, // Scales overall size of the spinner
    corners: 1, // Corner roundness (0..1)
    color: "#000", // #rgb or #rrggbb or array of colors
    opacity: 0.25, // Opacity of the lines
    rotate: 0, // The rotation offset
    direction: 1, // 1: clockwise, -1: counterclockwise
    speed: 1, // Rounds per second
    trail: 60, // Afterglow percentage
    fps: 20, // Frames per second when using setTimeout() as a fallback for CSS
    zIndex: 2e9, // The z-index (defaults to 2000000000)
    className: "spinner", // The CSS class to assign to the spinner
    top: "50%", // Top position relative to parent
    left: "100%", // Left position relative to parent
    shadow: false, // Whether to render a shadow
    hwaccel: false, // Whether to use hardware acceleration
    position: "absolute" // Element positioning
  }).spin($("#loadingSpinner")[0]);

  return my;
};

export default function init(urlsDef) {
  initFormSubmit();
  updater.views().then(renderer.addViews);
  renderer.renderLoop();
  urlsDef.then(
    urls => {
      var progress = progressUpdater(urls.length * 2);
      throttler.scheduleUpdates(
        urls.map(url => () => updater.addForUrl(url, progress.callback))
      );
    },
    (error, statusCode, statusText) => {
      var loading = $("#projects").find(".loading")[0];
      loading.innerHTML = "<div class='alert alert-danger' role='alert'>Loading Failed: " + statusText + "</div>";
    }
  );

  urlsDef.then(urls => {
    if (urls.length === 0) {
      var loading = $("#projects").find(".loading")[0];
      loading.innerHTML = "<div class='alert alert-warning' role='alert'>No projects found - please select a view</div>";
    }
  });

  var collapsed = false;

  $("#collapseAll").click(() => {
    $(".testResults").collapse(collapsed ? "show" : "hide");
    collapsed = !collapsed;
  });
}