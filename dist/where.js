webpackJsonp([2],[function(t,e,n){"use strict";n(12),n(31)},,,,,,function(t,e,n){var r,a;r=[n(13),n(2),n(3)],a=function(t,e,n){"use strict";var r={},a=n.getQueryVariable("revision"),i=n.getQueryVariable("startJob")||e.startJob;return r.revision=parseInt(a,10),r.data=t.create(i,r.revision),r.event="change",r}.apply(e,r),!(void 0!==a&&(t.exports=a))},function(t,e,n){"use strict";!(t.exports={commits:[]})},,,,,,function(t,e,n){var r;r=function(){"use strict";var t={},e={getNewFailCount:function(){return this.newFailCount?this.newFailCount:0}};return t.create=function(t,n,r){var a=Object.create(e);return a.jobName=t,a.revision=n,a.url=r,a.status="pending",a.downstreamProjects=[],a},t}.call(e,n,e,t),!(void 0!==r&&(t.exports=r))},,,,,,,,,,,,function(t,e,n){var r,a;r=[n(1),n(13),n(2),n(6),n(10)],a=function(t,e,n,r,a){"use strict";var i={};return i.updateFunction=function(o,s){var u=function(t){o(function(){i.updateFunction(o,s)(t)})};return function(c){var l=c.jobName,d=t.Deferred(),p=function(t){var e=t.REV;return void 0===e?void 0:parseInt(e,10)},v=function(t){return e.create(t.name,c.revision,t.url)},f=a.buildKeys([],["triggeredProjects[name,url,downstreamProjects[url,name]]"]),m=t.getJSON(n.jenkinsUrl+"/job/"+l+"/api/json?tree=url,downstreamProjects[url,name],lastCompletedBuild["+f+"]").then(function(t){return t}),g=m.then(function(e){return void 0===c.url&&(c.url=e.url,t(r.data).trigger("change")),e.lastCompletedBuild}),h=function(e){return void 0===e?void 0:t.getJSON(e.url+"injectedEnvVars/api/json?tree=envMap[REV]")},x=function(t){return void 0!==t?h(t).then(function(t){return p(t.envMap)}):void 0},j=function(t){return n.jenkinsUrl+"/job/"+c.jobName+"/"+t+"/api/json?tree="+f},b=function(e){return t.getJSON(j(e)).then(function(t){return t})},w=function(t){return void 0!==t&&t&&t.number>1?b(t.number-1):void 0},y=function P(e,n){var r=e.then(w),a=r.then(x);return t.when(e,n,r,a).then(function(t,e,n,i){if(void 0!==t){var o=void 0===n?t:n;if(t.revision=e,o.revision=i,!(e<c.revision))return e>=c.revision&&c.revision>i&&"ABORTED"!==o.result?(t.prevBuild=o,t):P(r,a).then(function(e){return void 0===e?t:"ABORTED"===e.result?(t.prevBuild=e.prevBuild,t):e});if("ABORTED"===t.result)return t.prevBuild=o,t}})},A=function(t){return t.actions.filter(function(t){return t.triggeredProjects}).map(function(t){return t.triggeredProjects}).reduce(function(t,e){return t.concat(e)},[])},N=function(e,n){if(e.status=n.result.toLowerCase(),e.revision=n.revision,e.previousRevision=n.prevBuild.revision,e.url=n.url,e.date=new Date(n.timestamp),e.testResult=a.getTestResult(n),e.warnings=a.getWarnings(n),void 0!==n.prevBuild){var i=a.getTestResult(n.prevBuild);e.newFailCount=e.testResult.failCount-i.failCount}"unstable"===e.status&&e.testResult.totalCount>0&&a.addFailedTests(e,function(n){e.testResult.failedTests=n,t(r.data).trigger(r.event)})},R=y(g,g.then(x));return t.when(R).then(function(e){var n=void 0===e||"aborted"==e.result.toLowerCase();if(n)u(c);else{N(c,e);var a=A(e),l=a.map(function(t){var e=v(t);return e.downstreamProjects=t.downstreamProjects.map(v),e});l.map(i.updateFunction(o,s)),c.downstreamProjects.map(i.updateFunction(s,s)),c.children=l,t(r.data).trigger(r.event)}d.resolve(c)},function(){u(c)}),d}},i}.apply(e,r),!(void 0!==a&&(t.exports=a))},function(t,e,n){var r,a;r=[n(3),n(6),n(27),n(25),n(2),n(1),n(8)],a=function(t,e,n,r,a,i){"use strict";var o={},s=t.newThrottler(a.bulkUpdateSize,a.coreUpdateInterval),u=t.newThrottler(a.bulkUpdateSize,a.updateInterval),c=r.updateFunction(s.scheduleUpdate,u.scheduleUpdate),l="change";return o.init=function(){e.revision&&(n.renderLoop(),s.scheduleUpdate(function(){c(e.data)})),i(document).ready(function(){var t=i("#revs");t.on("show.bs.dropdown",function(){i("#graph").attr("class","col-md-offset-3 col-md-9"),i(e.data).trigger(l)}),t.on("hide.bs.dropdown",function(){i("#graph").attr("class","col-md-12"),i(e.data).trigger(l)})})},o}.apply(e,r),!(void 0!==a&&(t.exports=a))},function(t,e,n){var r,a;r=[n(2),n(6),n(11),n(9),n(1)],a=function(t,e,n,r,a){"use strict";var i={},o=r.layout.tree().nodeSize([200,200]),s=r.svg.diagonal().projection(function(t){return[t.x,t.y]}),u=a("#graph").width(),c=r.select("#graph").append("svg").attr("width",u).attr("height",t.height),l=c.append("g").attr("transform","translate("+u/2+",200)");r.select(self.frameElement).style("height",t.height+"px");var d=function(t){return t.jobName},p=function(t){return t.url},v=function(t,e,n){var a=r.svg.arc().innerRadius(e/2).outerRadius(e).startAngle(0).endAngle(2*Math.PI);t.append("circle").attr("r",e),t.append("path").attr("class",n).attr("d",a),t.append("text").style("text-anchor","middle").attr("dy","0.3em").attr("class","testcount")},f=function(t){var e=t.reduce(function(t,e){return t.concat([e],e.downstreamProjects)},[]).filter(function(t){return"unstable"===t.status}),a=r.select("#projects").selectAll(".unstableProject").data(e,d);a.enter().append("a").attr("class","list-group-item unstableProject").attr("href",function(t){return t.url}).attr("name",function(t){return t.projectName}).html(function(t){return"<h3 class='list-group-item-heading'>"+t.jobName+"</h3><div class='testResults'></div>"}),a.order(),a.exit().remove(),n.renderTestresults(a.select(".testResults")),r.selectAll("#projects .loading").remove()};return i.renderData=function(){var t=o.nodes(e.data),n=t.reduce(function(t,e){return Math.max(t,e.y)},400),i=a("#graph").width();c.attr("height",n+400+"px").attr("width",i),l.attr("transform","translate("+i/2+",200)");var u=o.links(t),m=l.selectAll(".link").data(u,function(t){return t.source.jobName+"->"+t.target.jobName});m.enter().insert("path",".node").attr("class","link"),m.transition().attr("d",s),m.exit().remove();var g=l.selectAll(".node").data(t,d),h=g.enter().append("g").attr("class","node"),x=h.append("a"),j=x.append("text").attr("transform","rotate(10)").attr("class","core");v(x,20,"core");var b=function(){return 40};j.append("tspan").text(d),j.append("tspan").attr("class","revision").attr("dy","1.2em").text(function(t){return t.revision});var w=g.selectAll(".downstream").data(function(t){return t.downstreamProjects.map(function(e){return e.num=t.downstreamProjects.length,e})},d),y=w.enter().append("a").attr("class","downstream").attr("transform",function(t,e){return"rotate("+(-10+e*Math.min(35,360/Math.max(1,t.num)))+")translate("+-Math.max(4*t.num,40)+",0)"});v(y,10,"downstream"),y.append("text").text(function(t){var e=r.select(this.parentNode.parentNode).datum();return t.jobName.replace(new RegExp(e.jobName+"(-|~~)*"),"").split("-").map(function(t){return t[0]}).join("")}).attr("text-anchor","end").attr("dx","-15").attr("dy","0.3em"),w.exit().remove(),g.selectAll("a").attr("xlink:href",p),g.selectAll("a text tspan").attr("x","0").attr("dx",b),g.selectAll("text.testcount").text(function(t){var e=t.getNewFailCount();return 0===e?void 0:e>0?"+"+e:e}).classed("worse",function(t){return t.getNewFailCount()>0}).classed("better",function(t){return t.getNewFailCount()<0}),g.selectAll("path").attr("class",function(t){return t.status}),g.selectAll("a text.core").transition().attr("dy",0),g.selectAll("a text tspan.revision").transition().text(function(t){return t.revision}),g.selectAll("a").on("mouseenter",function(t){r.select("#commits").selectAll(".revision").classed("active",function(e){return t.revision>=e.commitId&&e.commitId>t.previousRevision})}),g.selectAll("a").on("mouseleave",function(){r.select("#commits").selectAll(".revision").classed("active",!1)}),g.transition().attr("transform",function(t){return"translate("+t.x+","+t.y+")"}),g.exit().remove(),f(t)},i.renderLoop=function(){n.renderLoop(e.data,e.event,i.renderData)},i}.apply(e,r),!(void 0!==a&&(t.exports=a))},function(t,e,n){var r,a;r=[n(7),n(29),n(30),n(2),n(1)],a=function(t,e,n,r,a){"use strict";var i={};return i.init=function(){a(t).bind("change",e.render),n.update(),setInterval(n.update,r.commitUpdateInterval)},i}.apply(e,r),!(void 0!==a&&(t.exports=a))},function(t,e,n){var r,a;r=[n(1),n(9),n(7),n(3)],a=function(t,e,n,r){"use strict";var a={};return a.render=function(){var a=e.select("#commits").selectAll(".revision").data(n.commits,function(t){return t.commitId});a.enter().append("li").attr("role","presentation").attr("class","revision").append("a").attr("href",function(e){var n=r.queryVariables();return n.revision=e.commitId,"?"+t.param(n)}).attr("role","menuitem").attr("name",function(t){return t.commitId}).attr("class","list-group-item").html(function(t){return"<h4 class='list-group-item-heading'>"+t.commitId+" - "+t.user+"</h4><p class='list-group-item-text'>"+t.msg.replace("\n","<br />")+"</p>"}),a.order(),a.exit().remove(),e.selectAll("#commits .loading").remove()},a}.apply(e,r),!(void 0!==a&&(t.exports=a))},function(t,e,n){var r,a;r=[n(7),n(2),n(1),n(3)],a=function(t,e,n,r){"use strict";var a={};return a.update=function(){var a=r.getQueryVariable("startJob")||e.startJob,i=n.getJSON(e.jenkinsUrl+"/job/"+a+"/api/json?tree=builds[changeSet[*[*]]]{,10}");i.then(function(e){var r=e.builds;t.commits=r.map(function(t){return t.changeSet.items}).reduce(function(t,e){return t.concat(e)}),n(t).trigger("change")})},a}.apply(e,r),!(void 0!==a&&(t.exports=a))},function(t,e,n){var r,a;r=[n(28),n(26)],a=function(t,e){"use strict";t.init(),e.init()}.apply(e,r),!(void 0!==a&&(t.exports=a))}]);