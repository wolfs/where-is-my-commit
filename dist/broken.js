webpackJsonp([1],[function(e,t,n){"use strict";n(12),n(20)},,,,function(e,t){"use strict";function n(e){return{type:h,payload:e}}function r(e,t){return{type:v,payload:{id:e,failedTests:t}}}function a(e){return{type:m,payload:e}}function i(e,t){return{type:y,payload:{id:e,selected:t}}}function o(e,t){return{type:b,payload:{id:e,selected:t}}}function u(e,t){return{type:g,payload:{id:e,selected:t}}}function s(){return{type:E}}function l(e,t){return("BUILD"===e.type?c:d)(e.id,t)}function c(e,t){return{type:w,payload:{id:e,claim:t}}}function d(e,t){return{type:T,payload:{id:e,claim:t}}}function f(e){return{type:S,payload:e}}function p(e,t){return{type:_,payload:{id:e,collapsed:t}}}Object.defineProperty(t,"__esModule",{value:!0}),t.addBuildData=n,t.addTestResults=r,t.failedGettingTestResults=a,t.suiteSelected=i,t.buildSelected=o,t.testCaseSelected=u,t.deselect=s,t.claim=l,t.collapseAll=f,t.collapse=p;var h=t.ADD_BUILD_DATA="ADD_BUILD_DATA",v=t.ADD_TEST_RESULTS="ADD_TEST_RESULTS",m=t.FAILED_GETTING_TEST_RESULTS="FAILED_GETTING_TEST_RESULTS",y=t.SUITE_SELECTED="SUITE_SELECTED",g=t.TESTCASE_SELECTED="TESTCASE_SELECTED",b=t.BUILD_SELECTED="BUILD_SELECTED",w=t.CLAIM_BUILD="CLAIM_BUILD",T=t.CLAIM_TEST="CLAIM_TEST",E=t.DESELECT="DESELECT",S=t.COLLAPSE_ALL="COLLAPSE_ALL",_=t.COLLAPSE="COLLAPSE"},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var r=n(49),a=n(22);t["default"]=(window.devToolsExtension?window.devToolsExtension()(r.createStore):r.createStore)(a.brokenApp)},,,,,,,,,function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{"default":e}}function a(e,t){function n(){return l}function r(e){c.push(e);var t=!0;return function(){if(t){t=!1;var n=c.indexOf(e);c.splice(n,1)}}}function a(e){if(!o["default"](e))throw new Error("Actions must be plain objects. Use custom middleware for async actions.");if("undefined"==typeof e.type)throw new Error('Actions may not have an undefined "type" property. Have you misspelled a constant?');if(d)throw new Error("Reducers may not dispatch actions.");try{d=!0,l=s(l,e)}finally{d=!1}return c.slice().forEach(function(e){return e()}),e}function i(e){s=e,a({type:u.INIT})}if("function"!=typeof e)throw new Error("Expected the reducer to be a function.");var s=e,l=t,c=[],d=!1;return a({type:u.INIT}),{dispatch:a,subscribe:r,getState:n,replaceReducer:i}}t.__esModule=!0,t["default"]=a;var i=n(16),o=r(i),u={INIT:"@@redux/INIT"};t.ActionTypes=u},function(e,t){"use strict";function n(){for(var e=arguments.length,t=Array(e),n=0;e>n;n++)t[n]=arguments[n];return function(e){return t.reduceRight(function(e,t){return t(e)},e)}}t.__esModule=!0,t["default"]=n,e.exports=t["default"]},function(e,t){"use strict";function n(e){if(!e||"object"!=typeof e)return!1;var t="function"==typeof e.constructor?Object.getPrototypeOf(e):Object.prototype;if(null===t)return!0;var n=t.constructor;return"function"==typeof n&&n instanceof n&&r(n)===a}t.__esModule=!0,t["default"]=n;var r=function(e){return Function.prototype.toString.call(e)},a=r(Object);e.exports=t["default"]},function(e,t){"use strict";function n(e,t){return Object.keys(e).reduce(function(n,r){return n[r]=t(e[r],r),n},{})}t.__esModule=!0,t["default"]=n,e.exports=t["default"]},function(e,t,n){var r,a;!function(i,o){"object"==typeof e&&e.exports?e.exports=o():(r=o,a="function"==typeof r?r.call(t,n,t,e):r,!(void 0!==a&&(e.exports=a)))}(this,function(){"use strict";function e(e,t){var n,r=document.createElement(e||"div");for(n in t)r[n]=t[n];return r}function t(e){for(var t=1,n=arguments.length;n>t;t++)e.appendChild(arguments[t]);return e}function n(e,t,n,r){var a=["opacity",t,~~(100*e),n,r].join("-"),i=.01+n/r*100,o=Math.max(1-(1-e)/t*(100-i),e),u=l.substring(0,l.indexOf("Animation")).toLowerCase(),s=u&&"-"+u+"-"||"";return f[a]||(c.insertRule("@"+s+"keyframes "+a+"{0%{opacity:"+o+"}"+i+"%{opacity:"+e+"}"+(i+.01)+"%{opacity:1}"+(i+t)%100+"%{opacity:"+e+"}100%{opacity:"+o+"}}",c.cssRules.length),f[a]=1),a}function r(e,t){var n,r,a=e.style;if(t=t.charAt(0).toUpperCase()+t.slice(1),void 0!==a[t])return t;for(r=0;r<d.length;r++)if(n=d[r]+t,void 0!==a[n])return n}function a(e,t){for(var n in t)e.style[r(e,n)||n]=t[n];return e}function i(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var r in n)void 0===e[r]&&(e[r]=n[r])}return e}function o(e,t){return"string"==typeof e?e:e[t%e.length]}function u(e){this.opts=i(e||{},u.defaults,p)}function s(){function n(t,n){return e("<"+t+' xmlns="urn:schemas-microsoft.com:vml" class="spin-vml">',n)}c.addRule(".spin-vml","behavior:url(#default#VML)"),u.prototype.lines=function(e,r){function i(){return a(n("group",{coordsize:c+" "+c,coordorigin:-l+" "+-l}),{width:c,height:c})}function u(e,u,s){t(f,t(a(i(),{rotation:360/r.lines*e+"deg",left:~~u}),t(a(n("roundrect",{arcsize:r.corners}),{width:l,height:r.scale*r.width,left:r.scale*r.radius,top:-r.scale*r.width>>1,filter:s}),n("fill",{color:o(r.color,e),opacity:r.opacity}),n("stroke",{opacity:0}))))}var s,l=r.scale*(r.length+r.width),c=2*r.scale*l,d=-(r.width+r.length)*r.scale*2+"px",f=a(i(),{position:"absolute",top:d,left:d});if(r.shadow)for(s=1;s<=r.lines;s++)u(s,-2,"progid:DXImageTransform.Microsoft.Blur(pixelradius=2,makeshadow=1,shadowopacity=.3)");for(s=1;s<=r.lines;s++)u(s);return t(e,f)},u.prototype.opacity=function(e,t,n,r){var a=e.firstChild;r=r.shadow&&r.lines||0,a&&t+r<a.childNodes.length&&(a=a.childNodes[t+r],a=a&&a.firstChild,a=a&&a.firstChild,a&&(a.opacity=n))}}var l,c,d=["webkit","Moz","ms","O"],f={},p={lines:12,length:7,width:5,radius:10,scale:1,corners:1,color:"#000",opacity:.25,rotate:0,direction:1,speed:1,trail:100,fps:20,zIndex:2e9,className:"spinner",top:"50%",left:"50%",shadow:!1,hwaccel:!1,position:"absolute"};if(u.defaults={},i(u.prototype,{spin:function(t){this.stop();var n=this,r=n.opts,i=n.el=e(null,{className:r.className});if(a(i,{position:r.position,width:0,zIndex:r.zIndex,left:r.left,top:r.top}),t&&t.insertBefore(i,t.firstChild||null),i.setAttribute("role","progressbar"),n.lines(i,n.opts),!l){var o,u=0,s=(r.lines-1)*(1-r.direction)/2,c=r.fps,d=c/r.speed,f=(1-r.opacity)/(d*r.trail/100),p=d/r.lines;!function h(){u++;for(var e=0;e<r.lines;e++)o=Math.max(1-(u+(r.lines-e)*p)%d*f,r.opacity),n.opacity(i,e*r.direction+s,o,r);n.timeout=n.el&&setTimeout(h,~~(1e3/c))}()}return n},stop:function(){var e=this.el;return e&&(clearTimeout(this.timeout),e.parentNode&&e.parentNode.removeChild(e),this.el=void 0),this},lines:function(r,i){function u(t,n){return a(e(),{position:"absolute",width:i.scale*(i.length+i.width)+"px",height:i.scale*i.width+"px",background:t,boxShadow:n,transformOrigin:"left",transform:"rotate("+~~(360/i.lines*c+i.rotate)+"deg) translate("+i.scale*i.radius+"px,0)",borderRadius:(i.corners*i.scale*i.width>>1)+"px"})}for(var s,c=0,d=(i.lines-1)*(1-i.direction)/2;c<i.lines;c++)s=a(e(),{position:"absolute",top:1+~(i.scale*i.width/2)+"px",transform:i.hwaccel?"translate3d(0,0,0)":"",opacity:i.opacity,animation:l&&n(i.opacity,i.trail,d+c*i.direction,i.lines)+" "+1/i.speed+"s linear infinite"}),i.shadow&&t(s,a(u("#000","0 0 4px #000"),{top:"2px"})),t(r,t(s,u(o(i.color,c),"0 0 1px rgba(0,0,0,.1)")));return r},opacity:function(e,t,n){t<e.childNodes.length&&(e.childNodes[t].style.opacity=n)}}),"undefined"!=typeof document){c=function(){var n=e("style",{type:"text/css"});return t(document.getElementsByTagName("head")[0],n),n.sheet||n.styleSheet}();var h=a(e("group"),{behavior:"url(#default#VML)"});!r(h,"transform")&&h.adj?s():l=r(h,"animation")}return u})},function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{"default":e}}function a(e){if(e&&e.__esModule)return e;var t={};if(null!=e)for(var n in e)Object.prototype.hasOwnProperty.call(e,n)&&(t[n]=e[n]);return t["default"]=e,t}function i(e){S(),g.views().then(h.addViews),h.renderLoop(),e.then(function(e){var t=_(2*e.length);E.scheduleUpdates(e.map(function(e){return function(){return g.addForUrl(e,t.callback)}}))},function(e,t,n){var r=(0,c["default"])("#projects").find(".loading")[0];r.innerHTML="<div class='alert alert-danger' role='alert'>Loading Failed: "+n+"</div>"}),e.then(function(e){if(0===e.length){var t=(0,c["default"])("#projects").find(".loading")[0];t.innerHTML="<div class='alert alert-warning' role='alert'>No projects found - please select a view</div>"}}),(0,c["default"])("#collapseAll").click(function(){w["default"].dispatch((0,T.collapseAll)(!w["default"].getState().allCollapsed))})}var o=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var r in n)Object.prototype.hasOwnProperty.call(n,r)&&(e[r]=n[r])}return e};Object.defineProperty(t,"__esModule",{value:!0}),t["default"]=i;var u=n(3),s=a(u),l=n(1),c=r(l),d=n(2),f=r(d),p=n(23),h=a(p),v=n(18),m=r(v),y=n(24),g=a(y),b=n(5),w=r(b),T=n(4),E=s.newThrottler(f["default"].bulkUpdateSize,f["default"].coreUpdateInterval),S=function(){var e=function(e){var t=Object.keys(e).map(function(t){return e[t]});return t.filter(function(e){return e.selected})},t=function(){return e(w["default"].getState().testCases)},n=function(){return e(w["default"].getState().builds)};(0,c["default"])("#claimForm").submit(function(e){try{var r=t(),a=n(),i={};(0,c["default"])(this).serializeArray().forEach(function(e){i[e.name]=e.value}),s.sequentially(r.concat(a),function(e){return g.claim(e,o({},i))}),w["default"].dispatch((0,T.deselect)())}catch(u){console.log(u)}e.preventDefault()}),(0,c["default"])("#dropClaimsForm").submit(function(e){try{var r=t(),a=n();r.concat(a).forEach(g.unclaim),w["default"].dispatch((0,T.deselect)())}catch(i){console.log(i)}e.preventDefault()})},_=function(e){var t={};return t.total=e,t.current=0,t.callback=function(){t.current++,t.updateProgress()},t.updateProgress=function(){(0,c["default"])("#loadingProgress").width(100*t.current/t.total+"%"),t.current===t.total&&(0,c["default"])("#loadingSpinner").html("<span class='label label-success'><span class='glyphicon glyphicon-ok'></span></span>")},new m["default"]({lines:13,length:28,width:14,radius:42,scale:.1,corners:1,color:"#000",opacity:.25,rotate:0,direction:1,speed:1,trail:60,fps:20,zIndex:2e9,className:"spinner",top:"50%",left:"100%",shadow:!1,hwaccel:!1,position:"absolute"}).spin((0,c["default"])("#loadingSpinner")[0]),t}},function(e,t,n){var r,a;r=[n(1),n(3),n(19),n(21),n(18)],a=function(e,t,n,r,a){var i=t.getQueryVariable("view"),o=t.getQueryVariable("multijob"),u=t.getQueryVariable("buildSelector"),s=i?r.view(i,u):o?r.multijob(o,u):e.Deferred().resolve([]),l=e("#projects").find(".loading")[0];e(l).text(""),new a({lines:13,length:28,width:14,radius:42,scale:1,corners:1,color:"#000",opacity:.25,rotate:0,direction:1,speed:1,trail:60,fps:20,zIndex:2e9,className:"spinner",top:"50%",left:"50%",shadow:!1,hwaccel:!1,position:"absolute"}).spin(l),n["default"](s)}.apply(t,r),!(void 0!==a&&(e.exports=a))},function(e,t,n){var r,a;r=[n(1),n(2)],a=function(e,t){var n={},r="lastCompletedBuild";return n.multijob=function(n,a){var i=a||r,o=t.jenkinsUrl+"/job/"+n+"/"+i+"/api/json?tree=subBuilds[url]";return e.getJSON(o).then(function(e){return e.subBuilds.map(function(e){return t.jenkinsUrl+"/"+e.url})})},n.view=function(n,a){var i=a||r,o=t.jenkinsUrl+"/view/"+n+"/api/json?tree=jobs[url,color]";return e.getJSON(o).then(function(e){return e.jobs.filter(function(e){return e.color&&"blue"!==e.color&&"notbuilt"!==e.color}).map(function(e){return e.url+i+"/"})})},n}.apply(t,r),!(void 0!==a&&(e.exports=a))},function(e,t,n){"use strict";function r(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function a(e){if(Array.isArray(e)){for(var t=0,n=Array(e.length);t<e.length;t++)n[t]=e[t];return n}return Array.from(e)}function i(){var e=arguments.length<=0||void 0===arguments[0]?c:arguments[0],t=arguments[1];return(f[t.type]||function(){return e})(e,t)}var o,u=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var r in n)Object.prototype.hasOwnProperty.call(n,r)&&(e[r]=n[r])}return e};Object.defineProperty(t,"__esModule",{value:!0}),t.brokenApp=i;var s=n(4),l=n(3),c={result:[],builds:{},testSuites:{},testCases:{},allCollapsed:!1},d=function(e,t){return e.concat(t)},f=(o={},r(o,s.ADD_BUILD_DATA,function(e,t){var n=t.payload.id;return u({},e,{result:[].concat(a(e.result),[n]),builds:u({},e.builds,r({},n,u({},t.payload)))})}),r(o,s.ADD_TEST_RESULTS,function(e,t){var n,i,o=t.payload,s=o.id,l=o.failedTests,c=e.builds[s];return u({},e,{builds:u({},e.builds,r({},s,u({},c,{testResult:u({},c.testResult,{failedTests:l.map(function(e){return e.id})})}))),testSuites:(n=Object).assign.apply(n,[{},e.testSuites].concat(a(l.map(function(e){return r({},e.id,u({},e,{cases:e.cases.map(function(e){return e.id}),selected:!1}))})))),testCases:(i=Object).assign.apply(i,[{},e.testCases].concat(a(l.map(function(e){return e.cases}).reduce(d).map(function(e){return r({},e.id,u({},e,{selected:!1}))}))))})}),r(o,s.SUITE_SELECTED,function(e,t){var n,i=t.payload,o=i.id,s=i.selected,l=e.testSuites[o];return u({},e,{testSuites:u({},e.testSuites,r({},o,u({},l,{selected:s}))),testCases:(n=Object).assign.apply(n,[{},e.testCases].concat(a(l.cases.map(function(t){return r({},t,u({},e.testCases[t],{selected:s}))}))))})}),r(o,s.CLAIM_BUILD,function(e,t){var n=t.payload,a=n.id,i=n.claim;return u({},e,{builds:u({},e.builds,r({},a,u({},e.builds[a],{claim:i})))})}),r(o,s.CLAIM_TEST,function(e,t){var n=t.payload,a=n.id,i=n.claim;return u({},e,{testCases:u({},e.testCases,r({},a,u({},e.testCases[a],{claim:i})))})}),r(o,s.TESTCASE_SELECTED,function(e,t){var n=t.payload,a=n.id,i=n.selected;return u({},e,{testCases:u({},e.testCases,r({},a,u({},e.testCases[a],{selected:i})))})}),r(o,s.BUILD_SELECTED,function(e,t){var n=t.payload,a=n.id,i=n.selected,o=e.builds[a];return u({},e,{builds:u({},e.builds,r({},a,u({},o,{selected:i})))})}),r(o,s.DESELECT,function(e){function t(e){return(0,l.mapValues)(e,function(e){return u({},e,{selected:!1})})}return u({},e,{builds:t(e.builds),testSuites:t(e.testSuites),testCases:t(e.testCases)})}),r(o,s.COLLAPSE_ALL,function(e,t){return u({},e,{builds:(0,l.mapValues)(e.builds,function(e){return u({},e,{collapsed:t.payload||"failure"===e.status})}),allCollapsed:t.payload})}),r(o,s.COLLAPSE,function(e,t){var n=t.payload,a=n.id,i=n.collapsed;return u({},e,{builds:u({},e.builds,r({},a,u({},e.builds[a],{collapsed:i})))})}),o)},function(e,t,n){"use strict";function r(e){if(e&&e.__esModule)return e;var t={};if(null!=e)for(var n in e)Object.prototype.hasOwnProperty.call(e,n)&&(t[n]=e[n]);return t["default"]=e,t}function a(e){return e&&e.__esModule?e:{"default":e}}Object.defineProperty(t,"__esModule",{value:!0}),t.renderLoop=t.addViews=t.addUsers=t.renderFailedTests=void 0;var i=n(9),o=a(i),u=n(1),s=a(u),l=n(11),c=a(l),d=n(3),f=r(d),p=n(5),h=a(p),v=n(4),m=function(e){return e.name},y=t.renderFailedTests=function(){function e(e,t){var n=(0,s["default"])("[data-"+e+"]");n.off("change"),n.change(function(n){var r=n.target;h["default"].dispatch(t((0,s["default"])(r).data(e),r.checked))})}var t=h["default"].getState(),n=t.result,r=t.builds,a=t.testSuites,i=t.testCases,u=n.map(function(e){return r[e]}).filter(function(e){return"failure"===e.status||"unstable"===e.status}),l=o["default"].select("#projects").selectAll(".unstableProject").data(u.map(function(e){return Object.assign({},e,{testResult:Object.assign({},e.testResult,{failedTests:e.testResult.failedTests.map(function(e){var t=a[e];return Object.assign({},t,{cases:t.cases.map(function(e){return i[e]})})})})})}),m);l.enter().append("div").attr("class",function(e){return"panel panel-default unstableProject "+e.status}).attr("name",function(e){return e.name}).html(function(e){return"\n      <div class='input-group panel-default'>\n        <span class='input-group-addon'><input class='buildSelect' data-buildId='"+e.id+"' type='checkbox'></span>\n        <div class='panel-heading'>\n          <div class='row'>\n            <div class='col-md-8'>\n              <h2 class='panel-title'><a class='h2' href='"+e.url+"'>"+e.name+"</a>, <span class='h3'>"+e.date.toLocaleString("de-DE",c["default"].dateTimeFormat)+"</span></h2>\n            </div>\n            <div class='col-md-3 claim'></div>\n            <div class='col-md-1'><a class='collapser' href='#collapseProject"+e.id+"'>collapse<span class='caret'></span></a></div>\n          </div>\n        </div>\n      </div>\n      <div class='testResults panel-body collapse"+(e.collapsed?"":" in")+"' id='collapseProject"+e.id+"'></div>"}),l.order(),l.select(".claim").call(c["default"].formatClaim),l.select("input[data-buildid]").property("checked",function(e){return e.selected}),l.select("a.collapser").on("click",function(e){h["default"].dispatch((0,v.collapse)(e.id,!e.collapsed)),o["default"].event.preventDefault()}),l.select(".testResults").each(function(e){var t=e.collapsed?"hide":"show";(0,s["default"])(this).collapse(t)}),l.exit().remove(),c["default"].renderTestresults(l.select(".testResults")),o["default"].selectAll("#projects .loading").remove(),e("suitename",v.suiteSelected),e("testcaseid",v.testCaseSelected),e("buildid",v.buildSelected)};t.addUsers=function(e){var t=function(e){return e.id};o["default"].select("#assignees").selectAll(".user").data(e,t).enter().append("option").attr("class","user").attr("value",t).text(function(e){return e.fullName})},t.addViews=function(e){var t=o["default"].select("#views").selectAll(".view").data(e);t.enter().append("li").attr("role","presentation").attr("class","view").append("a").attr("href",function(e){var t=f.queryVariables();return t.view=e.name,delete t.multijob,"?"+s["default"].param(t)}).attr("role","menuitem").attr("name",function(e){return e.name}).text(function(e){return e.name}),t.order(),t.exit().remove();var n=f.getQueryVariable("view");(0,s["default"])("#currentView").text(n?n:"Views"),o["default"].selectAll("#views .loading").remove()},t.renderLoop=function(){var e=!0;h["default"].subscribe(function(){e=!0,setTimeout(function(){e&&(y(),e=!1,setTimeout(function(){e||y()},200))},20)})}},function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{"default":e}}function a(e){if(e&&e.__esModule)return e;var t={};if(null!=e)for(var n in e)Object.prototype.hasOwnProperty.call(e,n)&&(t[n]=e[n]);return t["default"]=e,t}Object.defineProperty(t,"__esModule",{value:!0}),t.views=t.users=t.unclaim=t.claim=t.addForUrl=void 0;var i=n(10),o=a(i),u=n(1),s=r(u),l=n(2),c=r(l),d=n(4),f=n(5),p=r(f),h=function(e){return e+"/api/json?tree="+o.buildKeys(["fullDisplayName"],[])},v=0,m=function(e){return s["default"].getJSON(h(e)).then(function(e){return e})};t.addForUrl=function(e,t){var n=t||function(){};m(e).then(function(e){var t=e.actions.filter(function(e){return e.claimed===!0}),r=e.result.toLowerCase(),a=o.getTestResult(e),i={type:"BUILD",name:e.fullDisplayName,url:e.url,date:new Date(e.timestamp),testResult:a,warnings:o.getWarnings(e),status:r,claim:1===t.length?t[0]:{claimed:!1},id:v++,hasFailedTests:"unstable"===r&&a.totalCount>0,collapsed:p["default"].getState().allCollapsed||"failure"===r};p["default"].dispatch((0,d.addBuildData)(i)),n("build",i),i.hasFailedTests?o.addFailedTests(i,function(e){p["default"].dispatch((0,d.addTestResults)(i.id,e)),n("testResult",e)},function(){n(),p["default"].dispatch((0,d.failedGettingTestResults)(i.id))}):n("testResult",!1)},function(){n(),n()})},t.claim=function(e,t){var n=s["default"].post(e.url+"/claim/claim",{Submit:"Claim",json:JSON.stringify(t)});return n.then(function(){t.claimed=!0,t.claimDate=(new Date).getTime(),t.claimedBy=t.assignee,p["default"].dispatch((0,d.claim)(e,t))}),n},t.unclaim=function(e){var t=s["default"].post(e.url+"/claim/unclaim");return t.then(function(){p["default"].dispatch((0,d.claim)(e,{claimed:!1}))}),t},t.users=function(){return s["default"].getJSON(c["default"].jenkinsUrl+"/asynchPeople/api/json?tree=users[user[fullName,id]]").then(function(e){return e.users.map(function(e){return e.user})})},t.views=function(){return s["default"].getJSON(c["default"].jenkinsUrl+"/api/json?tree=views[name,url]").then(function(e){return e.views.sort(function(e,t){return e.name.localeCompare(t.name)})})}},,,,,,,,,,,,,,,,,,,,,,,,function(e,t){function n(){l=!1,o.length?s=o.concat(s):c=-1,s.length&&r()}function r(){if(!l){var e=setTimeout(n);l=!0;for(var t=s.length;t;){for(o=s,s=[];++c<t;)o&&o[c].run();c=-1,t=s.length}o=null,l=!1,clearTimeout(e)}}function a(e,t){this.fun=e,this.array=t}function i(){}var o,u=e.exports={},s=[],l=!1,c=-1;u.nextTick=function(e){var t=new Array(arguments.length-1);if(arguments.length>1)for(var n=1;n<arguments.length;n++)t[n-1]=arguments[n];s.push(new a(e,t)),1!==s.length||l||setTimeout(r,0)},a.prototype.run=function(){this.fun.apply(null,this.array)},u.title="browser",u.browser=!0,u.env={},u.argv=[],u.version="",u.versions={},u.on=i,u.addListener=i,u.once=i,u.off=i,u.removeListener=i,u.removeAllListeners=i,u.emit=i,u.binding=function(e){throw new Error("process.binding is not supported")},u.cwd=function(){return"/"},u.chdir=function(e){throw new Error("process.chdir is not supported")},u.umask=function(){return 0}},function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{"default":e}}t.__esModule=!0;var a=n(14),i=r(a),o=n(52),u=r(o),s=n(51),l=r(s),c=n(50),d=r(c),f=n(15),p=r(f);t.createStore=i["default"],t.combineReducers=u["default"],t.bindActionCreators=l["default"],t.applyMiddleware=d["default"],t.compose=p["default"]},function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{"default":e}}function a(){for(var e=arguments.length,t=Array(e),n=0;e>n;n++)t[n]=arguments[n];return function(e){return function(n,r){var a=e(n,r),o=a.dispatch,s=[],l={getState:a.getState,dispatch:function(e){return o(e)}};return s=t.map(function(e){return e(l)}),o=u["default"].apply(void 0,s)(a.dispatch),i({},a,{dispatch:o})}}}t.__esModule=!0;var i=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var r in n)Object.prototype.hasOwnProperty.call(n,r)&&(e[r]=n[r])}return e};t["default"]=a;var o=n(15),u=r(o);e.exports=t["default"]},function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{"default":e}}function a(e,t){return function(){return t(e.apply(void 0,arguments))}}function i(e,t){if("function"==typeof e)return a(e,t);if("object"!=typeof e||null===e||void 0===e)throw new Error("bindActionCreators expected an object or a function, instead received "+(null===e?"null":typeof e)+'. Did you write "import ActionCreators from" instead of "import * as ActionCreators from"?');return u["default"](e,function(e){return a(e,t)})}t.__esModule=!0,t["default"]=i;var o=n(17),u=r(o);e.exports=t["default"]},function(e,t,n){(function(r){"use strict";function a(e){return e&&e.__esModule?e:{"default":e}}function i(e,t){var n=t&&t.type,r=n&&'"'+n.toString()+'"'||"an action";return'Reducer "'+e+'" returned undefined handling '+r+". To ignore an action, you must explicitly return the previous state."}function o(e,t,n){var r=Object.keys(t),a=n&&n.type===l.ActionTypes.INIT?"initialState argument passed to createStore":"previous state received by the reducer";if(0===r.length)return"Store does not have a valid reducer. Make sure the argument passed to combineReducers is an object whose values are reducers.";if(!d["default"](e))return"The "+a+' has unexpected type of "'+{}.toString.call(e).match(/\s([a-z|A-Z]+)/)[1]+'". Expected argument to be an object with the following '+('keys: "'+r.join('", "')+'"');var i=Object.keys(e).filter(function(e){return r.indexOf(e)<0});return i.length>0?"Unexpected "+(i.length>1?"keys":"key")+" "+('"'+i.join('", "')+'" found in '+a+". ")+"Expected to find one of the known reducer keys instead: "+('"'+r.join('", "')+'". Unexpected keys will be ignored.'):void 0}function u(e){Object.keys(e).forEach(function(t){var n=e[t],r=n(void 0,{type:l.ActionTypes.INIT});if("undefined"==typeof r)throw new Error('Reducer "'+t+'" returned undefined during initialization. If the state passed to the reducer is undefined, you must explicitly return the initial state. The initial state may not be undefined.');var a="@@redux/PROBE_UNKNOWN_ACTION_"+Math.random().toString(36).substring(7).split("").join(".");if("undefined"==typeof n(void 0,{type:a}))throw new Error('Reducer "'+t+'" returned undefined when probed with a random type. '+("Don't try to handle "+l.ActionTypes.INIT+' or other actions in "redux/*" ')+"namespace. They are considered private. Instead, you must return the current state for any unknown actions, unless it is undefined, in which case you must return the initial state, regardless of the action type. The initial state may not be undefined.")})}function s(e){var t,n=v["default"](e,function(e){return"function"==typeof e});try{u(n)}catch(a){t=a}var s=p["default"](n,function(){});return function(e,a){if(void 0===e&&(e=s),t)throw t;var u=!1,l=p["default"](n,function(t,n){var r=e[n],o=t(r,a);if("undefined"==typeof o){var s=i(n,a);throw new Error(s)}return u=u||o!==r,o});if("production"!==r.env.NODE_ENV){var c=o(e,l,a);c&&console.error(c)}return u?l:e}}t.__esModule=!0,t["default"]=s;var l=n(14),c=n(16),d=a(c),f=n(17),p=a(f),h=n(53),v=a(h);e.exports=t["default"]}).call(t,n(48))},function(e,t){"use strict";function n(e,t){return Object.keys(e).reduce(function(n,r){return t(e[r])&&(n[r]=e[r]),n},{})}t.__esModule=!0,t["default"]=n,e.exports=t["default"]}]);