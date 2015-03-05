var whereIsMyBuild = function() {
	var baseBuildNode = {
		getName: function() {
			return this.jobName + " - " + this.revision
		}
	}

	var buildNode = function(jobName, revision) {
		var n = Object.create(baseBuildNode);
		n.jobName = jobName;
		n.revision = revision;

		return n;
	}
	var data = buildNode("chain-start", "1234")
	var toUpdate = [data]
	var when = function(deferreds) {
		if (deferreds.length == 0) {
			return $.Deferred().resolve([]);
		} else if (deferreds.length == 1) {
			return deferreds[0].pipe(function(deferred) {
				return [deferred]
			})
		} else {
			return $.when.apply($, deferreds)
		}
	}

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
				return d.source.getName() + d.target.getName();
			})

		link.enter().append("path")
			.attr("class", "link");

		link.transition().attr("d", diagonal)

		link.exit().remove();

		var node = svg.selectAll(".node")
			.data(nodes, function(d) {
				return d.getName();
			});

		var parentNode = node.enter().append("g")
			.attr("class", "node");
		parentNode.append("circle")
			.attr("r", 4.5);
		var textNode = parentNode.append("a")
			.attr("xlink:href", function(d) {
				return d.url
			})
			.append("text");

		var dxChildren = function(d) {
			return 8;
		}

		textNode
			.append("tspan")
			.text(function(d) {
				return d.jobName;
			});

		textNode
			.append("tspan")
			.attr("dy", "1.2em")
			.text(function(d) {
				return d.revision
			})

		node.selectAll("a text tspan")
			.attr("x", "0")
			.attr("dx", dxChildren)


		node.selectAll("a text").transition()
			.attr("dy", 0)
			.style("text-anchor", "start");

		node.transition().attr("transform", function(d) {
			return "translate(" + d.x + "," + d.y + ")";
		})

		node.exit().remove();
	}

	var buildData = function(nodeToUpdate) {
		var jobName = nodeToUpdate.jobName;
		var resultDef = $.Deferred();
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
					triggeredProjects = triggeredProjects.concat(action.triggeredProjects);
				}
			}
			return triggeredProjects;
		}

		var triggeredProjectRequest = jobRequest.pipe(
			function(job) {
				var triggeredProjects = getTriggeredProjects(job.lastBuild)
				var deferreds = $.map(triggeredProjects, function(job) {
					return buildData(buildNode(job.name, nodeToUpdate.revision));
				});

				return when(deferreds);
			}
		)

		$.when(jobRequest, envVarsRequest, triggeredProjectRequest).done(
			function(jobResult, envVarsResult, triggeredProjects) {
				var job = jobResult[0];
				var envVars = envVarsResult[0];
				var rev = findRevision(envVars.envVars.envVar)
					// if (!$.isArray(triggeredProjects)) {
					// 	triggeredProjects = [triggeredProjects]
					// }

				nodeToUpdate.revision = rev;
				nodeToUpdate.url = job.lastBuild.url;
				nodeToUpdate.children = triggeredProjects;
				resultDef.resolve(nodeToUpdate)
			}
		)

		return resultDef;
	}

	var init = function() {
		d3.select(self.frameElement).style("height", height + "px");

		buildData(toUpdate[0]).done(function(result) {
			renderData();
		})
	}

	return {
		init: init,
		buildNode: buildNode
	}

}().init();
