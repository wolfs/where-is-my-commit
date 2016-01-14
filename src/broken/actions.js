export const ADD_BUILD_DATA = "ADD_BUILD_DATA";
export const ADD_TEST_RESULTS = "ADD_TEST_RESULTS";
export const FAILED_GETTING_TEST_RESULTS = "FAILED_GETTING_TEST_RESULTS";
export const SUITE_SELECTED = "SUITE_SELECTED";
export const TESTCASE_SELECTED = "TESTCASE_SELECTED";
export const BUILD_SELECTED = "BUILD_SELECTED";
export const CLAIM_BUILD = "CLAIM_BUILD";
export const CLAIM_TEST = "CLAIM_TEST";
export const DESELECT = "DESELECT";

export function addBuildData(buildData) {
  "use strict";
  return {
    type: ADD_BUILD_DATA,
    payload: buildData
  };
}

export function addTestResults(id, failedTests) {
  "use strict";
  return {
    type: ADD_TEST_RESULTS,
    payload: {
      id,
      failedTests
    }
  };
}

export function failedGettingTestResults(id) {
  "use strict";
  return {
    type: FAILED_GETTING_TEST_RESULTS,
    payload: id
  };
}

export function suiteSelected(id, selected) {
  "use strict";
  return {
    type: SUITE_SELECTED,
    payload: {
      id,
      selected
    }
  };
}

export function buildSelected(id, selected) {
  "use strict";
  return {
    type: BUILD_SELECTED,
    payload: {
      id,
      selected
    }
  };
}

export function testCaseSelected(id, selected) {
  "use strict";
  return {
    type: TESTCASE_SELECTED,
    payload: {
      id,
      selected
    }
  };
}

export function deselect() {
  "use strict";
  return {
    type: DESELECT
  };
}

export function claim(objectToClaim, claim) {
  return (objectToClaim.type === "BUILD" ? claimBuild : claimTest)(objectToClaim.id, claim);
}

function claimBuild(id, claim) {
  "use strict";
  return {
    type: CLAIM_BUILD,
    payload: {
      id,
      claim
    }
  };
}

function claimTest(id, claim) {
  "use strict";
  return {
    type: CLAIM_TEST,
    payload: {
      id,
      claim
    }
  };
}