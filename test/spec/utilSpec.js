var util = require("common/util");

describe("getQueryVariable", function () {
  it("Should extract the Query Variable", function () {
    expect(util.getQueryVariableFromSearch("revision", "?revision=1234")).toEqual("1234");
  });

  it("Should extract the Query Variable from multiple queries", function () {
    expect(util.getQueryVariableFromSearch("revision", "?stuff=14&revision=1234&somethingElse=blah")).toEqual("1234");
  });

  it("Should extract an Object for the query", function () {
    expect(util.queryVariablesFromQuery("stuff=14&revision=1234&somethingElse=blah")).toEqual(
      {
        stuff: "14",
        revision: "1234",
        somethingElse: "blah"
      });
  });

  it("Should parse + correctly", function () {
    expect(util.queryVariablesFromQuery("stuff=14&revision=1234&somethingElse=blah+Important")).toEqual(
      {
        stuff: "14",
        revision: "1234",
        somethingElse: "blah Important"
      });
  });

  it("Should parse an empty query", function () {
    expect(util.queryVariablesFromQuery("")).toEqual({});
  });
});