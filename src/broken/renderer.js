import d3 from "d3";
import $ from "jquery";
import render from "common/render";
import * as util from "common/util";
import store from "./store";
import { suiteSelected, testCaseSelected, buildSelected, collapse } from "./actions";

var buildName = function (build) {
  return build.name;
};

export let renderFailedTests = function () {
  const { result, builds, testSuites, testCases } = store.getState();
  var unstableNodes = result.map(id => builds[id])
    .filter(function (build) {
      return (build.status === "failure" || build.status === "unstable");
    });

  var unstableProjects = d3.select("#projects").selectAll(".unstableProject").data(unstableNodes.map(build => {
    "use strict";
    return Object.assign({}, build, { testResult: Object.assign({}, build.testResult, { failedTests: build.testResult.failedTests.map(
      suiteId => {
        const suite = testSuites[suiteId];
        return Object.assign({}, suite, { cases: suite.cases.map(caseId => testCases[caseId]) });
      }
    )})});
  }), buildName);

  unstableProjects.enter()
    .append("div")
    .attr("class", function (build) {
      return "panel panel-default unstableProject " + build.status;
    })
    .attr("name", function (el) {
      return el.name;
    })
    .html(function (build) {
      return `
      <div class='input-group panel-default'>
        <span class='input-group-addon'><input class='buildSelect' data-buildId='${build.id}' type='checkbox'></span>
        <div class='panel-heading'>
          <div class='row'>
            <div class='col-md-8'>
              <h2 class='panel-title'><a class='h2' href='${build.url}'>${build.name}</a>, <span class='h3'>${build.date.toLocaleString("de-DE", render.dateTimeFormat)}</span></h2>
            </div>
            <div class='col-md-3 claim'></div>
            <div class='col-md-1'><a class='collapser' href='#collapseProject${build.id}'>collapse<span class='caret'></span></a></div>
          </div>
        </div>
      </div>
      <div class='testResults panel-body collapse${build.collapsed ? "" : " in"}' id='collapseProject${build.id}'></div>`;
    });

  unstableProjects.order();

  unstableProjects.select(".claim").call(render.formatClaim);
  unstableProjects.select("input[data-buildid]").property("checked", testCase => testCase.selected);
  unstableProjects.select("a.collapser").on("click", function (d) {
    "use strict";
    store.dispatch(collapse(d.id, !d.collapsed));
    d3.event.preventDefault();
  });

  unstableProjects.select(".testResults").each(function (d) {
    "use strict";
    const option = d.collapsed ? "hide" : "show";
    $(this).collapse(option);

  });

  unstableProjects.exit().remove();

  render.renderTestresults(unstableProjects.select(".testResults"));

  d3.selectAll("#projects .loading").remove();

  function addCheckboxAction(dataName, action) {
    const testCaseCheckboxes = $(`[data-${dataName}]`);
    testCaseCheckboxes.off("change");
    testCaseCheckboxes.change((event) => {
      "use strict";
      const checkbox = event.target;
      store.dispatch(action($(checkbox).data(dataName), checkbox.checked));
    });
  }

  addCheckboxAction("suitename", suiteSelected);
  addCheckboxAction("testcaseid", testCaseSelected);
  addCheckboxAction("buildid", buildSelected);
};

export let addUsers = function (users) {
  var userId = function (user) {
    return user.id;
  };
  d3.select("#assignees")
    .selectAll(".user")
    .data(users, userId)
    .enter()
    .append("option")
    .attr("class", "user")
    .attr("value", userId)
    .text(function (user) {
      return user.fullName;
    })
  ;
};

export let addViews = function (views) {
  var viewSelection = d3.select("#views").selectAll(".view").data(views);
  viewSelection
    .enter()
    .append("li")
    .attr("role", "presentation")
    .attr("class", "view")
    .append("a")
    .attr("href", function (view) {
      var queryVariables = util.queryVariables();
      queryVariables.view = view.name;
      delete queryVariables.multijob;
      return "?" + $.param(queryVariables);
    })
    .attr("role", "menuitem")
    .attr("name", function (view) {
      return view.name;
    })
    .text(function (view) {
      return view.name;
    });

  viewSelection.order();
  viewSelection.exit().remove();

  var selectedViewName = util.getQueryVariable("view");
  $("#currentView").text(selectedViewName ? selectedViewName : "Views");
  d3.selectAll("#views .loading").remove();
};

export let renderLoop = function () {
  let viewNeedsUpdate = true;
  store.subscribe(function () {
    viewNeedsUpdate = true;
    setTimeout(function () {
      if (viewNeedsUpdate) {
        renderFailedTests();
        viewNeedsUpdate = false;
        // Render again, since bootstrap collapse doesn't react when collapsing is in progress
        setTimeout(function () {
          "use strict";
          if (!viewNeedsUpdate) {
            renderFailedTests();
          }
        }, 200);
      }
    }, 20);
  });
};