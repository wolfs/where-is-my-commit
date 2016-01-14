export const ADD_BUILD_DATA = "ADD_BUILD_DATA";
export const ADD_TEST_RESULTS = "ADD_TEST_RESULTS";
export const FAILED_GETTING_TEST_RESULTS = "FAILED_GETTING_TEST_RESULTS";
export const SUITE_SELECTED = "SUITE_SELECTED";
export const TESTCASE_SELECTED = "TESTCASE_SELECTED";
export const BUILD_SELECTED = "BUILD_SELECTED";
export const CLAIM_BUILD = "CLAIM_BUILD";
export const CLAIM_TEST = "CLAIM_TEST";

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

export function buildSelected(buildId, selected) {
  "use strict";
  return {
    type: BUILD_SELECTED,
    payload: {
      buildId,
      selected
    }
  };
}

export function testCaseSelected(testCaseId, selected) {
  "use strict";
  return {
    type: TESTCASE_SELECTED,
    payload: {
      testCaseId,
      selected
    }
  };
}

export function claim(objectToClaim, claim) {
  return (objectToClaim.type === "BUILD" ? claimBuild : claimTest)(objectToClaim.id, claim);
}

function claimBuild(buildId, claim) {
  "use strict";
  return {
    type: CLAIM_BUILD,
    payload: {
      buildId,
      claim
    }
  };
}

function claimTest(testCaseId, claim) {
  "use strict";
  return {
    type: CLAIM_TEST,
    payload: {
      testCaseId,
      claim
    }
  };
}