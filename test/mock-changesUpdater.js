define(['where/changes/changes'], function (changes) {
  var my = {};
  var firstCall = true;
  my.update = function () {
    if (!firstCall) {
      changes.commits.splice(0,0,
        {
          commitId: "1234710",
          user: "wolfs",
          msg: "Some third commit"
        },
        {
          commitId: "1234700",
          user: "wolfs",
          msg: "Some third commit"
        });
    }

    firstCall = false;

    $(changes).trigger("change");
  };
  return my;
});