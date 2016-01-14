import {
  ADD_BUILD_DATA,
  ADD_TEST_RESULTS,
  SUITE_SELECTED,
  CLAIM_BUILD,
  CLAIM_TEST,
  TESTCASE_SELECTED,
  BUILD_SELECTED,
  DESELECT } from "./actions";

import { mapValues } from "common/util";

const initialState = {
  result: [],
  builds: {},
  testSuites: {},
  testCases: {}
};

const concat = function (a, b) {
  return a.concat(b);
};

const reducers = {
  [ADD_BUILD_DATA](state, action) {
    "use strict";
    const { id } = action.payload;
    return {
      ...state,
      result: [...state.result, id],
      builds: {
        ...state.builds,
        [id]: { ...action.payload }
      }
    };
  },
  [ADD_TEST_RESULTS](state, action) {
    "use strict";
    const { id, failedTests } = action.payload;
    const currentBuild = state.builds[id];
    return {
      ...state,
      builds: {
        ...state.builds,
        [id]: {
          ...currentBuild,
          testResult: {
            ...currentBuild.testResult,
            failedTests: failedTests.map(suite => suite.id)
          }
        }
      },
      testSuites: Object.assign({}, state.testSuites, ...failedTests.map(suite => {
        return {
          [suite.id]: {
            ...suite,
            cases: suite.cases.map(testCase => testCase.id),
            selected: false
          }
        };
      })),
      testCases: Object.assign({}, state.testCases, ...failedTests.map(suite => suite.cases).reduce(concat).map(testCase => {
        "use strict";
        return {
          [testCase.id]: {
            ...testCase,
            selected: false
          }
        };
      }))
    };
  },
  [SUITE_SELECTED](state, action) {
    "use strict";
    const { id, selected } = action.payload;
    const testSuite = state.testSuites[id];
    return {
      ...state,
      testSuites: {
        ...state.testSuites,
        [id]: {
          ...testSuite,
          selected
        }
      },
      testCases: Object.assign({}, state.testCases, ...testSuite.cases.map(testCaseId => {
        return {
          [testCaseId]: {
            ...state.testCases[testCaseId],
            selected
          }
        };
      }))
    };
  },
  [CLAIM_BUILD](state, action) {
    "use strict";
    const { id, claim } = action.payload;
    return {
      ...state,
      builds: {
        ...state.builds,
        [id]: {
          ...state.builds[id],
          claim
        }
      }
    };
  },
  [CLAIM_TEST](state, action) {
    "use strict";
    const { id, claim} = action.payload;
    return {
      ...state,
      testCases: {
        ...state.testCases,
        [id]: {
          ...state.testCases[id],
          claim
        }
      }
    };
  },
  [TESTCASE_SELECTED](state, action) {
    "use strict";
    const { id, selected } = action.payload;
    return {
      ... state,
      testCases: {
        ...state.testCases,
        [id]: {
          ...state.testCases[id],
          selected
        }
      }
    };
  },
  [BUILD_SELECTED](state, action) {
    "use strict";
    const { id, selected } = action.payload;
    const currentBuild = state.builds[id];
    return {
      ... state,
      builds: {
        ...state.builds,
        [id]: {
          ...currentBuild,
          selected
        }
      }
    };
  },
  [DESELECT](state) {
    "use strict";
    function deselect(objs) {
      return mapValues(objs, obj => {
        return {
          ...obj,
          selected: false
        };
      });
    }
    return {
      ...state,
      builds: deselect(state.builds),
      testSuites: deselect(state.testSuites),
      testCases: deselect(state.testCases)
    };
  }
};

export function brokenApp(state = initialState, action) {
  return (reducers[action.type] || (() => state))(state, action);
}