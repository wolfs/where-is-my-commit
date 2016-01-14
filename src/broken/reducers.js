import { ADD_BUILD_DATA, ADD_TEST_RESULTS, SUITE_SELECTED, CLAIM_BUILD, CLAIM_TEST, TESTCASE_SELECTED, BUILD_SELECTED } from "./actions";

const initialState = {
  builds: [],
  testSuites: {},
  testCases: {}
};

const concat = function (a, b) {
  return a.concat(b);
};

initialState.testCases = function () {
  return this.builds.map(function (build) {
    return build.testResult.failedTests || [];
  }).reduce(concat)
    .map(function (testSuite) {
      return testSuite.cases;
    })
    .reduce(concat);
};

const findById = function (id, list) {
  return list.filter(function (objectWithId) {
    return objectWithId.id === id;
  }).pop();
};

initialState.testCaseForId = function (id) {
  return findById(id, this.testCases());
};

initialState.buildForId = function (id) {
  return findById(id, this.builds);
};

initialState.testCasesForSuite = function (id) {
  return this.testSuites[id].cases.map(testCaseId => this.testCases[testCaseId]);
};

export function brokenApp(state = initialState, action) {
  switch (action.type) {
    case ADD_BUILD_DATA:
      return Object.assign({}, state, {
        builds: [
          ...state.builds,
          action.payload
        ]
      });
    case ADD_TEST_RESULTS:
      const { buildId: index, failedTests } = action.payload;
      const currentBuild = state.builds[index];
      return Object.assign({}, state, {
        builds: [
          ...state.builds.slice(0, index),
          { ...currentBuild,
            testResult: {
              ...currentBuild.testResult,
              failedTests: failedTests.map(suite => suite.id)
            }
          },
          ...state.builds.slice(index + 1)
        ],
        testSuites: Object.assign({}, state.testSuites, ...failedTests.map(suite => { return {
          [suite.id]: {
            ...suite,
            cases: suite.cases.map(testCase => testCase.id),
            selected: false }
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
      });
    case SUITE_SELECTED:
      const { selected, suiteId } = action.payload;
      const testSuite = state.testSuites[suiteId];
      return {
        ...state,
        testSuites: {
          ...state.testSuites,
          [suiteId]: {
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
    case CLAIM_BUILD:
      return (() => {
        const { buildId, claim } = action.payload;
        const currentBuild = state.builds[buildId];
        return {
          ...state,
          builds: [
            ...state.builds.slice(0, buildId),
            {
              ...currentBuild,
              claim
            },
            ...state.builds.slice(buildId + 1)
          ]
        };
      })();
    case CLAIM_TEST:
      const { testCaseId, claim} = action.payload;
      return {
        ...state,
        testCases: {
          ...state.testCases,
          [testCaseId]: {
            ...state.testCases[testCaseId],
            claim
          }
        }
      };
    case TESTCASE_SELECTED:
      return (() => {
        "use strict";
        const { testCaseId, selected } = action.payload;
        return {
          ... state,
          testCases: {
            ...state.testCases,
            [testCaseId]: {
              ...state.testCases[testCaseId],
              selected
            }
          }
        };
      })();
    case BUILD_SELECTED:
      return (() => {
        "use strict";
        const { buildId, selected } = action.payload;
        const currentBuild = state.builds[buildId];
        return {
          ... state,
          builds: [
            ...state.builds.slice(0, buildId),
            {
              ...currentBuild,
              selected
            },
            ...state.builds.slice(buildId + 1)
          ]
        };
      })();
    default: return state;
  }
}