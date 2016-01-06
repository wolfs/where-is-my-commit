webpackJsonp([0],[
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	__webpack_require__(1);
	__webpack_require__(18);

/***/ },
/* 1 */,
/* 2 */,
/* 3 */,
/* 4 */,
/* 5 */,
/* 6 */,
/* 7 */,
/* 8 */,
/* 9 */,
/* 10 */,
/* 11 */,
/* 12 */,
/* 13 */,
/* 14 */,
/* 15 */,
/* 16 */,
/* 17 */,
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;'use strict';

	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(15), __webpack_require__(19), __webpack_require__(20), __webpack_require__(29), __webpack_require__(28)], __WEBPACK_AMD_DEFINE_RESULT__ = function ($, util, controller, lastBuildsOf, Spinner) {
	  var viewName = util.getQueryVariable('view'),
	      multijobName = util.getQueryVariable('multijob'),
	      buildSelector = util.getQueryVariable('buildSelector');

	  var urlsToCheck = viewName ? lastBuildsOf.view(viewName, buildSelector) : multijobName ? lastBuildsOf.multijob(multijobName, buildSelector) : $.Deferred().resolve([]);

	  var loading = $('#projects').find('.loading')[0];
	  $(loading).text('');
	  new Spinner({
	    lines: 13, // The number of lines to draw
	    length: 28, // The length of each line
	    width: 14, // The line thickness
	    radius: 42, // The radius of the inner circle
	    scale: 1, // Scales overall size of the spinner
	    corners: 1, // Corner roundness (0..1)
	    color: '#000', // #rgb or #rrggbb or array of colors
	    opacity: 0.25, // Opacity of the lines
	    rotate: 0, // The rotation offset
	    direction: 1, // 1: clockwise, -1: counterclockwise
	    speed: 1, // Rounds per second
	    trail: 60, // Afterglow percentage
	    fps: 20, // Frames per second when using setTimeout() as a fallback for CSS
	    zIndex: 2e9, // The z-index (defaults to 2000000000)
	    className: 'spinner', // The CSS class to assign to the spinner
	    top: '50%', // Top position relative to parent
	    left: '50%', // Left position relative to parent
	    shadow: false, // Whether to render a shadow
	    hwaccel: false, // Whether to use hardware acceleration
	    position: 'absolute' // Element positioning
	  }).spin(loading);

	  controller.init(urlsToCheck);
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ },
/* 19 */,
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;'use strict';

	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(15), __webpack_require__(19), __webpack_require__(21), __webpack_require__(22), __webpack_require__(23), __webpack_require__(25), __webpack_require__(28)], __WEBPACK_AMD_DEFINE_RESULT__ = function ($, util, config, data, updater, renderer, Spinner) {
	  var my = {},
	      throttler = util.newThrottler(config.bulkUpdateSize, config.coreUpdateInterval);

	  var initFormSubmit = function initFormSubmit() {
	    var selectedTestCases = function selectedTestCases() {
	      var selected = $('input.testCaseSelect:checked');
	      var ids = $.makeArray(selected.map(function () {
	        return $(this).data('testcaseid');
	      }));
	      return ids.map(function (id) {
	        return data.testCaseForId(id);
	      });
	    };

	    var selectedBuilds = function selectedBuilds() {
	      var selected = $('input.buildSelect:checked');
	      var ids = $.makeArray(selected.map(function () {
	        return $(this).data('buildid');
	      }));
	      return ids.map(function (id) {
	        return data.buildForId(id);
	      });
	    };

	    $('#claimForm').submit(function (event) {
	      try {
	        var testCases = selectedTestCases();
	        var builds = selectedBuilds();
	        var claim = {};
	        $(this).serializeArray().forEach(function (field) {
	          claim[field.name] = field.value;
	        });
	        util.sequentially(testCases.concat(builds), function (testCase) {
	          return updater.claim(testCase, claim);
	        });
	      } catch (err) {
	        console.log(err);
	      }
	      event.preventDefault();
	    });

	    $('#dropClaimsForm').submit(function (event) {
	      try {
	        var testCases = selectedTestCases();
	        var builds = selectedBuilds();
	        testCases.concat(builds).forEach(updater.unclaim);
	      } catch (err) {
	        console.log(err);
	      }
	      event.preventDefault();
	    });
	  };

	  var progressUpdater = function progressUpdater(number) {
	    var my = {};

	    my.total = number;
	    my.current = 0;

	    my.callback = function () {
	      my.current++;
	      my.updateProgress();
	    };

	    my.updateProgress = function () {
	      $('#loadingProgress').width(my.current * 100 / my.total + '%');

	      if (my.current === my.total) {
	        $('#loadingSpinner').html('<span class="label label-success"><span class="glyphicon glyphicon-ok"></span></span>');
	      }
	    };

	    new Spinner({
	      lines: 13, // The number of lines to draw
	      length: 28, // The length of each line
	      width: 14, // The line thickness
	      radius: 42, // The radius of the inner circle
	      scale: 0.1, // Scales overall size of the spinner
	      corners: 1, // Corner roundness (0..1)
	      color: '#000', // #rgb or #rrggbb or array of colors
	      opacity: 0.25, // Opacity of the lines
	      rotate: 0, // The rotation offset
	      direction: 1, // 1: clockwise, -1: counterclockwise
	      speed: 1, // Rounds per second
	      trail: 60, // Afterglow percentage
	      fps: 20, // Frames per second when using setTimeout() as a fallback for CSS
	      zIndex: 2e9, // The z-index (defaults to 2000000000)
	      className: 'spinner', // The CSS class to assign to the spinner
	      top: '50%', // Top position relative to parent
	      left: '100%', // Left position relative to parent
	      shadow: false, // Whether to render a shadow
	      hwaccel: false, // Whether to use hardware acceleration
	      position: 'absolute' // Element positioning
	    }).spin($('#loadingSpinner')[0]);

	    return my;
	  };

	  my.init = function (urlsDef) {
	    initFormSubmit();
	    updater.views().then(renderer.addViews);
	    renderer.renderLoop();
	    urlsDef.then(function (urls) {
	      var progress = progressUpdater(urls.length * 2);
	      throttler.scheduleUpdates(urls.map(function (url) {
	        return function () {
	          updater.addForUrl(url, progress.callback);
	        };
	      }));
	    }, function (error, statusCode, statusText) {
	      var loading = $('#projects').find('.loading')[0];
	      loading.innerHTML = '<div class="alert alert-danger" role="alert">Loading Failed: ' + statusText + '</div>';
	    });

	    urlsDef.then(function (urls) {
	      if (urls.length === 0) {
	        var loading = $('#projects').find('.loading')[0];
	        loading.innerHTML = '<div class="alert alert-warning" role="alert">No projects found - please select a view</div>';
	      }
	    });

	    var collapsed = false;

	    $('#collapseAll').click(function (event) {
	      $('.testResults').collapse(collapsed ? 'show' : 'hide');
	      collapsed = !collapsed;
	    });
	  };

	  return my;
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ },
/* 21 */,
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;'use strict';

	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = function () {
	  var my = {
	    builds: [],
	    event: 'change'
	  };

	  var concat = function concat(a, b) {
	    return a.concat(b);
	  };

	  my.testCases = function () {
	    return my.builds.map(function (build) {
	      return build.testResult.failedTests || [];
	    }).reduce(concat).map(function (testSuite) {
	      return testSuite.cases;
	    }).reduce(concat);
	  };

	  var findById = function findById(id, list) {
	    return list.filter(function (objectWithId) {
	      return objectWithId.id === id;
	    }).pop();
	  };

	  my.testCaseForId = function (id) {
	    return findById(id, my.testCases());
	  };

	  my.buildForId = function (id) {
	    return findById(id, my.builds);
	  };

	  my.testCasesForSuite = function (url) {
	    return my.builds.map(function (build) {
	      return build.testResult.failedTests || [];
	    }).reduce(concat).filter(function (testSuite) {
	      return testSuite.url === url;
	    }).pop().cases;
	  };

	  return my;
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ },
/* 23 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;'use strict';

	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(22), __webpack_require__(19), __webpack_require__(24), __webpack_require__(15), __webpack_require__(21)], __WEBPACK_AMD_DEFINE_RESULT__ = function (data, util, buildInfo, $, config) {
	  var my = {};

	  var buildUrl = function buildUrl(mybuildUrl) {
	    return mybuildUrl + "/api/json?tree=" + buildInfo.buildKeys(['fullDisplayName'], []);
	  };

	  var buildId = 0;

	  var getBuildDef = function getBuildDef(myBuildUrl) {
	    return $.getJSON(buildUrl(myBuildUrl)).then(function (build) {
	      return build;
	    });
	  };

	  my.addForUrl = function (url, progressCallbackParm) {
	    var progressCallback = progressCallbackParm || function () {};
	    getBuildDef(url).then(function (build) {
	      var claims = build.actions.filter(function (c) {
	        return c.claimed === true;
	      });
	      var buildData = {
	        name: build.fullDisplayName,
	        url: build.url,
	        date: new Date(build.timestamp),
	        testResult: buildInfo.getTestResult(build),
	        warnings: buildInfo.getWarnings(build),
	        status: build.result.toLowerCase(),
	        claim: claims.length === 1 ? claims[0] : { claimed: false },
	        id: buildId++
	      };
	      data.builds.push(buildData);
	      $(data).trigger(data.event);
	      progressCallback('build', buildData);
	      if (buildData.status === "unstable" && buildData.testResult.totalCount > 0) {
	        buildInfo.addFailedTests(buildData, function (failedTests) {
	          buildData.testResult.failedTests = failedTests;
	          $(data).trigger(data.event);
	          progressCallback('testResult', failedTests);
	        }, progressCallback);
	      } else {
	        progressCallback('testResult', false);
	      }
	    }, function () {
	      progressCallback();
	      progressCallback();
	    });
	  };

	  my.claim = function (objectToClaim, claim) {
	    var request = $.post(objectToClaim.url + '/claim/claim', {
	      Submit: "Claim",
	      json: JSON.stringify(claim)
	    });
	    request.then(function () {
	      claim.claimed = true;
	      claim.claimDate = new Date().getTime();
	      claim.claimedBy = claim.assignee;
	      objectToClaim.claim = claim;
	      $(data).trigger(data.event);
	    });
	    return request;
	  };

	  my.unclaim = function (objectToClaim) {
	    var request = $.post(objectToClaim.url + '/claim/unclaim');
	    request.then(function () {
	      objectToClaim.claim = { claimed: false };
	      $(data).trigger(data.event);
	    });
	    return request;
	  };

	  my.users = function () {
	    return $.getJSON(config.jenkinsUrl + '/asynchPeople/api/json?tree=users[user[fullName,id]]').then(function (jsonUsers) {
	      return jsonUsers.users.map(function (userInfo) {
	        return userInfo.user;
	      });
	    });
	  };

	  my.views = function () {
	    return $.getJSON(config.jenkinsUrl + '/api/json?tree=views[name,url]').then(function (jenkins) {
	      return jenkins.views.sort(function (a, b) {
	        return a.name.localeCompare(b.name);
	      });
	    });
	  };

	  return my;
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ },
/* 24 */,
/* 25 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;'use strict';

	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(26), __webpack_require__(15), __webpack_require__(27), __webpack_require__(22), __webpack_require__(19)], __WEBPACK_AMD_DEFINE_RESULT__ = function (d3, $, render, data, util) {
	  var my = {};

	  var buildName = function buildName(build) {
	    return build.name;
	  };

	  my.renderFailedTests = function () {
	    var unstableNodes = data.builds.filter(function (build) {
	      return build.status === "failure" || build.status === "unstable";
	    });

	    var unstableProjects = d3.select("#projects").selectAll(".unstableProject").data(unstableNodes, buildName);

	    unstableProjects.enter().append("div").attr("class", function (build) {
	      return "panel panel-default unstableProject " + build.status;
	    }).attr("name", function (el) {
	      return el.name;
	    }).html(function (build) {
	      return '<div class="input-group panel-default">' + '<span class="input-group-addon"><input class="buildSelect" data-buildId="' + build.id + '" type="checkbox"></span>' + "<div class='panel-heading'>" + '<div class="row">' + "<div class='col-md-8'><h2 class='panel-title'><a class='h2' href='" + build.url + "'>" + build.name + "</a>, <span class='h3'>" + build.date.toLocaleString('de-DE', render.dateTimeFormat) + "</span></h2></div>" + '<div class="col-md-3 claim"></div>' + '<div class="col-md-1"><a data-toggle="collapse" href="#collapseProject' + build.id + '">collapse<span class="caret"></span></a></div>' + '</div>' + "</div></div>" + "<div class='testResults panel-body collapse in' id='collapseProject" + build.id + "'></div>";
	    });

	    unstableProjects.order();

	    unstableProjects.select('.claim').call(render.formatClaim);

	    unstableProjects.exit().remove();

	    render.renderTestresults(unstableProjects.select(".testResults"));

	    d3.selectAll("#projects .loading").remove();

	    var suiteSelector = function suiteSelector(event) {
	      var checkbox = event.target;
	      data.testCasesForSuite($(checkbox).data('suitename')).forEach(function (testCase) {
	        $('[data-testcaseid="' + testCase.id + '"]').prop('checked', checkbox.checked);
	      });
	    };

	    var suites = $('[data-suitename]');

	    suites.off('change');

	    suites.change(suiteSelector);
	  };

	  my.addUsers = function (users) {
	    var userId = function userId(user) {
	      return user.id;
	    };
	    d3.select('#assignees').selectAll('.user').data(users, userId).enter().append("option").attr("class", "user").attr("value", userId).text(function (user) {
	      return user.fullName;
	    });
	  };

	  my.addViews = function (views) {
	    var viewSelection = d3.select('#views').selectAll('.view').data(views);
	    viewSelection.enter().append("li").attr("role", "presentation").attr("class", "view").append("a").attr("href", function (view) {
	      var queryVariables = util.queryVariables();
	      queryVariables.view = view.name;
	      delete queryVariables.multijob;
	      return "?" + $.param(queryVariables);
	    }).attr("role", "menuitem").attr("name", function (view) {
	      return view.name;
	    }).text(function (view) {
	      return view.name;
	    });

	    viewSelection.order();
	    viewSelection.exit().remove();

	    var selectedViewName = util.getQueryVariable('view');
	    $('#currentView').text(selectedViewName ? selectedViewName : 'Views');
	    d3.selectAll("#views .loading").remove();
	  };

	  my.renderLoop = function () {
	    render.renderLoop(data, data.event, my.renderFailedTests);
	  };

	  return my;
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ },
/* 26 */,
/* 27 */,
/* 28 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_RESULT__;// http://spin.js.org/#v2.3.2
	!function(a,b){"object"==typeof module&&module.exports?module.exports=b(): true?!(__WEBPACK_AMD_DEFINE_FACTORY__ = (b), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.call(exports, __webpack_require__, exports, module)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)):a.Spinner=b()}(this,function(){"use strict";function a(a,b){var c,d=document.createElement(a||"div");for(c in b)d[c]=b[c];return d}function b(a){for(var b=1,c=arguments.length;c>b;b++)a.appendChild(arguments[b]);return a}function c(a,b,c,d){var e=["opacity",b,~~(100*a),c,d].join("-"),f=.01+c/d*100,g=Math.max(1-(1-a)/b*(100-f),a),h=j.substring(0,j.indexOf("Animation")).toLowerCase(),i=h&&"-"+h+"-"||"";return m[e]||(k.insertRule("@"+i+"keyframes "+e+"{0%{opacity:"+g+"}"+f+"%{opacity:"+a+"}"+(f+.01)+"%{opacity:1}"+(f+b)%100+"%{opacity:"+a+"}100%{opacity:"+g+"}}",k.cssRules.length),m[e]=1),e}function d(a,b){var c,d,e=a.style;if(b=b.charAt(0).toUpperCase()+b.slice(1),void 0!==e[b])return b;for(d=0;d<l.length;d++)if(c=l[d]+b,void 0!==e[c])return c}function e(a,b){for(var c in b)a.style[d(a,c)||c]=b[c];return a}function f(a){for(var b=1;b<arguments.length;b++){var c=arguments[b];for(var d in c)void 0===a[d]&&(a[d]=c[d])}return a}function g(a,b){return"string"==typeof a?a:a[b%a.length]}function h(a){this.opts=f(a||{},h.defaults,n)}function i(){function c(b,c){return a("<"+b+' xmlns="urn:schemas-microsoft.com:vml" class="spin-vml">',c)}k.addRule(".spin-vml","behavior:url(#default#VML)"),h.prototype.lines=function(a,d){function f(){return e(c("group",{coordsize:k+" "+k,coordorigin:-j+" "+-j}),{width:k,height:k})}function h(a,h,i){b(m,b(e(f(),{rotation:360/d.lines*a+"deg",left:~~h}),b(e(c("roundrect",{arcsize:d.corners}),{width:j,height:d.scale*d.width,left:d.scale*d.radius,top:-d.scale*d.width>>1,filter:i}),c("fill",{color:g(d.color,a),opacity:d.opacity}),c("stroke",{opacity:0}))))}var i,j=d.scale*(d.length+d.width),k=2*d.scale*j,l=-(d.width+d.length)*d.scale*2+"px",m=e(f(),{position:"absolute",top:l,left:l});if(d.shadow)for(i=1;i<=d.lines;i++)h(i,-2,"progid:DXImageTransform.Microsoft.Blur(pixelradius=2,makeshadow=1,shadowopacity=.3)");for(i=1;i<=d.lines;i++)h(i);return b(a,m)},h.prototype.opacity=function(a,b,c,d){var e=a.firstChild;d=d.shadow&&d.lines||0,e&&b+d<e.childNodes.length&&(e=e.childNodes[b+d],e=e&&e.firstChild,e=e&&e.firstChild,e&&(e.opacity=c))}}var j,k,l=["webkit","Moz","ms","O"],m={},n={lines:12,length:7,width:5,radius:10,scale:1,corners:1,color:"#000",opacity:.25,rotate:0,direction:1,speed:1,trail:100,fps:20,zIndex:2e9,className:"spinner",top:"50%",left:"50%",shadow:!1,hwaccel:!1,position:"absolute"};if(h.defaults={},f(h.prototype,{spin:function(b){this.stop();var c=this,d=c.opts,f=c.el=a(null,{className:d.className});if(e(f,{position:d.position,width:0,zIndex:d.zIndex,left:d.left,top:d.top}),b&&b.insertBefore(f,b.firstChild||null),f.setAttribute("role","progressbar"),c.lines(f,c.opts),!j){var g,h=0,i=(d.lines-1)*(1-d.direction)/2,k=d.fps,l=k/d.speed,m=(1-d.opacity)/(l*d.trail/100),n=l/d.lines;!function o(){h++;for(var a=0;a<d.lines;a++)g=Math.max(1-(h+(d.lines-a)*n)%l*m,d.opacity),c.opacity(f,a*d.direction+i,g,d);c.timeout=c.el&&setTimeout(o,~~(1e3/k))}()}return c},stop:function(){var a=this.el;return a&&(clearTimeout(this.timeout),a.parentNode&&a.parentNode.removeChild(a),this.el=void 0),this},lines:function(d,f){function h(b,c){return e(a(),{position:"absolute",width:f.scale*(f.length+f.width)+"px",height:f.scale*f.width+"px",background:b,boxShadow:c,transformOrigin:"left",transform:"rotate("+~~(360/f.lines*k+f.rotate)+"deg) translate("+f.scale*f.radius+"px,0)",borderRadius:(f.corners*f.scale*f.width>>1)+"px"})}for(var i,k=0,l=(f.lines-1)*(1-f.direction)/2;k<f.lines;k++)i=e(a(),{position:"absolute",top:1+~(f.scale*f.width/2)+"px",transform:f.hwaccel?"translate3d(0,0,0)":"",opacity:f.opacity,animation:j&&c(f.opacity,f.trail,l+k*f.direction,f.lines)+" "+1/f.speed+"s linear infinite"}),f.shadow&&b(i,e(h("#000","0 0 4px #000"),{top:"2px"})),b(d,b(i,h(g(f.color,k),"0 0 1px rgba(0,0,0,.1)")));return d},opacity:function(a,b,c){b<a.childNodes.length&&(a.childNodes[b].style.opacity=c)}}),"undefined"!=typeof document){k=function(){var c=a("style",{type:"text/css"});return b(document.getElementsByTagName("head")[0],c),c.sheet||c.styleSheet}();var o=e(a("group"),{behavior:"url(#default#VML)"});!d(o,"transform")&&o.adj?i():j=d(o,"animation")}return h});

/***/ },
/* 29 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;'use strict';

	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(15), __webpack_require__(21)], __WEBPACK_AMD_DEFINE_RESULT__ = function ($, config) {
	  var my = {};

	  var defaultSelector = 'lastCompletedBuild';

	  my.multijob = function (multijobName, selectorArg) {
	    var selector = selectorArg || defaultSelector,
	        multijobUrl = config.jenkinsUrl + '/job/' + multijobName + '/' + selector + '/api/json?tree=subBuilds[url]';
	    return $.getJSON(multijobUrl).then(function (multijobBuild) {
	      return multijobBuild.subBuilds.map(function (subBuild) {
	        return config.jenkinsUrl + "/" + subBuild.url;
	      });
	    });
	  };

	  my.view = function (viewName, selectorArg) {
	    var selector = selectorArg || defaultSelector,
	        viewUrl = config.jenkinsUrl + '/view/' + viewName + '/api/json?tree=jobs[url,color]';
	    return $.getJSON(viewUrl).then(function (view) {
	      return view.jobs.filter(function (job) {
	        return job.color !== 'blue';
	      }).map(function (job) {
	        return job.url + selector + '/';
	      });
	    });
	  };

	  return my;
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ }
]);