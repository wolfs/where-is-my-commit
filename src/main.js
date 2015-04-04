require(["changes/changesController", 'builds/nodesController'], function (changes, nodes) {
  changes.init();
  nodes.init();
});
