export const ADD_BUILD_DATA = "ADD_BUILD_DATA";
export const ADD_TEST_RESULTS = "ADD_TEST_RESULTS";
export const FAILED_GETTING_TEST_RESULTS = "FAILED_GETTING_TEST_RESULTS";
export const SUITE_SELECTED = "SUITE_SELECTED";

export function addBuildData(buildData) {
  "use strict";
  return {
    type: ADD_BUILD_DATA,
    payload: buildData
  };
}

export function addTestResults(buildId, failedTests) {
  "use strict";
  return {
    type: ADD_TEST_RESULTS,
    payload: {
      buildId,
      failedTests
    }
  };
}

export function failedGettingTestResults(buildId) {
  "use strict";
  return {
    type: FAILED_GETTING_TEST_RESULTS,
    payload: buildId
  };
}

export function suiteSelected(suiteId, selected) {
  "use strict";
  return {
    type: SUITE_SELECTED,
    payload: {
      suiteId,
      selected
    }
  };
}