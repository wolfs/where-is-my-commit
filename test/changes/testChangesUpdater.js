define(['changes/changes', 'jquery'], function(changes, $) {
  var firstCall = true,
    my = {};

  my.update = function () {
    changes.commits = [
      {
        commitId: "1234660",
        user: "Menninger Alexander, GF Öffentliche Sicherheit & Ordnung",
        msg: "Some commit"
      },
      {
        commitId: "1234661",
        user: "wolfs",
        msg: "Some other commit"
      },
      {
        commitId: "1234662",
        user: "wolfs",
        msg: "Some other commit"
      },
      {
        commitId: "1234663",
        user: "wolfs",
        msg: "Some other commit"
      },
      {
        commitId: "1234664",
        user: "wolfs",
        msg: "Some other commit"
      },
      {
        commitId: "1234665",
        user: "wolfs",
        msg: "Some other commit"
      },
      {
        commitId: "1234666",
        user: "wolfs",
        msg: "Some other commit"
      },
      {
        commitId: "1234667",
        user: "wolfs",
        msg: "Some other commit"
      },
      {
        commitId: "1234668",
        user: "wolfs",
        msg: "Some other commit"
      },
      {
        commitId: "1234669",
        user: "wolfs",
        msg: "Some other commit"
      },
      {
        commitId: "1234670",
        user: "wolfs",
        msg: "Some other commit"
      },
      {
        commitId: "1234671",
        user: "wolfs",
        msg: "Some other commit"
      },
      {
        commitId: "1234671",
        user: "wolfs",
        msg: "Some other commit"
      },
      {
        commitId: "1234672",
        user: "wolfs",
        msg: "Some other commit"
      },
      {
        commitId: "1234673",
        user: "wolfs",
        msg: "Some other commit"
      },
      {
        commitId: "1234674",
        user: "wolfs",
        msg: "Some other commit"
      }
    ].reverse();

    if (!firstCall) {
      changes.commits.splice(0,0,
        {
          commitId: "1234700",
          user: "wolfs",
          msg: "Some third commit"
        },
        {
          commitId: "1234710",
          user: "wolfs",
          msg: "Some third commit"
        })
    }

    firstCall = false;
    $(changes).trigger("change");
  };

  return my;
});
