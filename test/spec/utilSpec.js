define(['util'], function(util){
  'use strict';
  describe("getQueryVariable", function(){
    it("Should extract the Query Variable", function(){
      expect(util.getQueryVariableFromSearch('revision', '?revision=1234')).toEqual("1234");
    });

    it("Should extract the Query Variable from multiple queries", function(){
      expect(util.getQueryVariableFromSearch('revision', '?stuff=14&revision=1234&somethingElse=blah')).toEqual("1234");
    });
  });
});