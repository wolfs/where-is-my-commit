define(['jquery', 'common/util', 'app-config', 'broken/builds', 'broken/updater', 'broken/renderer'],
  function ($, util, config, data, updater, renderer) {
    var my = {},
      throttler = util.newThrottler(config.bulkUpdateSize, config.coreUpdateInterval);

    var initFormSubmit = function () {
      var selectedTestCases = function () {
        var selected = $('input.testCaseSelect:checked');
        var ids = $.makeArray(selected.map(function () {
          return $(this).data('testcaseid');
        }));
        return ids.map(function (id) {
          return data.testCaseForId(id);
        });
      };

      var selectedBuilds = function () {
        var selected = $('input.buildSelect:checked');
        var ids = $.makeArray(selected.map(function () {
          return $(this).data('buildid');
        }));
        return ids.map(function (id) {
          return data.buildForId(id);
        });
      };

      $('#claimForm').submit(function (event) {
        try {
          var testCases = selectedTestCases();
          var builds = selectedBuilds();
          var claim = {};
          $(this).serializeArray().forEach(function (field) {
            claim[field.name] = field.value;
          });
          util.sequentially(testCases.concat(builds), function (testCase) {
            return updater.claim(testCase, claim);
          });
        } catch (err) {
          console.log(err);
        }
        event.preventDefault();
      });

      $('#dropClaimsForm').submit(function (event) {
        try {
          var testCases = selectedTestCases();
          var builds = selectedBuilds();
          testCases.concat(builds).forEach(updater.unclaim);
        } catch (err) {
          console.log(err);
        }
        event.preventDefault();
      });
    };

    my.init = function (urlsDef) {
      initFormSubmit();
      updater.views().then(renderer.addViews);
      renderer.renderLoop();
      urlsDef.then(
        function (urls) {
          throttler.scheduleUpdates(
            urls.map(function (url) {
              return function () {
                updater.addForUrl(url);
              };
            }));
        },
        function (error, statusCode, statusText) {
          var loading = $('#projects').find('.loading')[0];
          loading.innerHTML = '<div class="alert alert-danger" role="alert">Loading Failed: ' + statusText + '</div>';
        }
      );

      urlsDef.then(function (urls) {
        if (urls.length === 0) {
          var loading = $('#projects').find('.loading')[0];
          loading.innerHTML = '<div class="alert alert-warning" role="alert">No projects found - please select a view</div>';
        }
      });
    };

    return my;
  });