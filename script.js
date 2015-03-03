var searcher = function() {
	var data = {
		"name": "start",
		"children": [{
			"name": "first",
			"children": [{
				"name": "build-A"
			}, {
				"name": "build-B"
			}]
		}]
	};

	var width = 960,
		height = 2000;

	var cluster = d3.layout.tree().nodeSize([200, 200]);
	var diagonal = d3.svg.diagonal()
		.projection(function(d) {
			return [d.x, d.y];
		});
	var svg = d3.select("body").append("svg")
		.attr("width", width)
		.attr("height", height)
		.append("g")
		.attr("transform", "translate(500,300)");

	var searchedRev = 1234;

	var renderData = function() {
		var nodes = cluster.nodes(data),
			links = cluster.links(nodes);

		var link = svg.selectAll(".link")
			.data(links, function(d) {
				return d.source.name + d.target.name
			})

		link.enter().append("path")
			.attr("class", "link");

		link.transition().attr("d", diagonal)

		link.exit().remove();

		var node = svg.selectAll(".node")
			.data(nodes, function(d) {
				return d.name
			});

		var parentNode = node.enter().append("g")
			.attr("class", "node");
		parentNode.append("circle")
			.attr("r", 4.5);
		parentNode.append("a")
			.attr("xlink:href", function(d) {
				return d.url
			})
			.append("text")
			.attr("dy", 3);

		node.selectAll("a text").transition()
			.attr("dx", function(d) {
				return d.children ? -8 : 8;
			})
			.attr("dy", 3)
			.style("text-anchor", function(d) {
				return d.children ? "end" : "start";
			})
			.text(function(d) {
				return d.name;
			});


		node.transition().attr("transform", function(d) {
			return "translate(" + d.x + "," + d.y + ")";
		})

		node.exit().remove();
	}

	var buildData = function(jobName, callback) {
		var findRevision = function(envVars) {
			for (var i = 0; i < envVars.length; i++) {
				var env = envVars[i];
				if (env.name == "REV") {
					return env.value
				}
			}
		}
		var jobRequest = $.getJSON(
			"http://localhost:8080/job/" + jobName +
			"/api/json?tree=lastBuild[number,url,actions[triggeredProjects[name]]]")
		var envVarsRequest = jobRequest.pipe(
			function(job) {
				return $.getJSON(job.lastBuild.url + "injectedEnvVars/export");
			})

		var getTriggeredProjects = function(build) {
			var actions = build.actions;
			var triggeredProjects = [];
			var i;
			var action;
			for (i = 0; i < actions.length; i++) {
				action = actions[i];
				if (action.triggeredProjects) {
					triggeredProjects = triggeredProjects.concat(action.triggeredProjects)
				}
			}
			return triggeredProjects;
		}

		$.when(jobRequest, envVarsRequest).done(
			function(jobResult, envVarsResult) {
				var job = jobResult[0];
				var envVars = envVarsResult[0];
				var rev = findRevision(envVars.envVars.envVar)
				var triggeredProjects = getTriggeredProjects(job.lastBuild)

				var recursiveCallback = function(remainingProjects, result) {
					if (remainingProjects.length == 0) {
						return function(childResults) {
							result.children.push(childResults)
							callback(result)
						}
					} else {
						return function(childResult) {
							result.children.push(childResult)
							buildData(remainingProjects[0].name, recursiveCallback(
								remainingProjects.slice(1), result))
						}
					}
				}
				var result = {
					revision: rev,
					name: jobName + " - " + rev,
					jobName: jobName,
					url: job.lastBuild.url,
					children: []
				}
				if (triggeredProjects.length > 0) {
					buildData(triggeredProjects[0].name, recursiveCallback(
						triggeredProjects.slice(1), result))
				} else {
					callback(result)
				}
			}
		)
	}

	var init = function() {
		d3.select(self.frameElement).style("height", height + "px");

		// renderData()

		data.children[0].children[0].children = [{
			"name": "build-C"
		}]

		buildData("chain-start", function(builds) {
			data = builds;
			renderData();
		})

		// setTimeout(renderData, 1000);

		// d3.json(
		// 	"http://localhost:8080/view/my-chain/job/chain-step-1/4/injectedEnvVars/export",
		// 	function(error, json) {
		// 		var envVars = json.envVars.envVar;
		// 		var rev
		// 		for (var i = 0; i < envVars.length; i++) {
		// 			var env = envVars[i];
		// 			if (env.name == "REV") {
		// 				rev = env.value
		// 			}
		// 		}
		// 		d3.select("body").append("div").text(rev);
		// 	}).on("beforesend", function(request) {
		// 	request.withCredentials = true;
		// });
	}

	return {
		init: init
	}

}().init();
