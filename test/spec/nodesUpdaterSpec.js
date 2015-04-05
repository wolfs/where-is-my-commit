define(['builds/nodeUpdater', 'builds/node'], function(updater, node){
  beforeEach(function() {
    jasmine.Ajax.install();
  });

  afterEach(function() {
    jasmine.Ajax.uninstall();
  });

  describe("NodeUpdater", function(){
    it("should first load the project", function() {
      var nodeToUpdate = node.create('someJob', '1234');

      var project = {
        url: 'http://someUrl',
        downstreamProjects: [{url: 'http://someOtherUrl', name: 'downstreamJob'}],
        lastCompletedBuild: {number: 5, url: 'http://buildUrl', result: 'SUCCESS'}
      };

      jasmine.Ajax.stubRequest('http://localhost:8080/job/someJob/api/json?tree=url,downstreamProjects[url,name],lastCompletedBuild[number,url,result,actions[triggeredProjects[name,url,downstreamProjects[url,name]],failCount,skipCount,totalCount,urlName]]').andReturn({
        "responseText": JSON.stringify(project)
      });

      updater.update(nodeToUpdate);

      expect(jasmine.Ajax.requests.mostRecent().url).toBe('http://localhost:8080/job/someJob/4/api/json?tree=number,url,result,actions[triggeredProjects[name,url,downstreamProjects[url,name]],failCount,skipCount,totalCount,urlName]');
    });
  })
});