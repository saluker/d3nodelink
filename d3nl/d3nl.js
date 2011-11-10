/*
	The d3nl library is a wrapper of d3.js (http://mbostock.github.com/d3/) and is dependent on it.
	d3nl is a node-link chart generator.
	Mike Bostock is the creator of d3.js.
	Serge Aluker (theserge@theserge.com) developed d3nl to make it easier for students, researchers, and others to create node-link charts on the web.

member variables:
	nodes - array
	links - array
	xyz - keeps track of where the viz is in xyz space
	vis - the d3 variable
	force - the d3 force variable : https://github.com/mbostock/d3/wiki/Force-Layout
	

functions:
	restart()
	addNode({}) -- object uses: x,y,r,label,fixed,color,id
	addLink({}) -- object uses: source,target,distance,width,color(?)
*/

function d3nl(id,width,height){
	var nodes = this.nodes = [];
	var links = this.links = [];
	var xyz = this.xyz=[width/2,height/2,1];
	
	//@TODO check if we have d3/d3.layout/d3.geom
	var visroot = this.visroot=d3.select(id);
	var vis = this.vis = visroot.append("svg:svg")
		.attr("width", "100%")
		.attr("height", "100%")
		.attr("pointer-events", "all")
		.append("svg:g")
		.attr("class","zoomr")
		.attr("transform", "translate("+xyz[0]+","+xyz[1]+")scale(1)")
		.append("svg:g")
		.attr("transform", "translate(-"+xyz[0]+",-"+xyz[1]+")");
	vis.append("svg:rect")
		    .attr("width", "1000000")
		    .attr("height", "1000000")
			.attr("class","rectr")
			.attr("x",-500000)
			.attr("y",-500000)
		    .attr("fill", "none")
			.call(d3.behavior.zoom([xyz[0],xyz[1],0]).on("zoom", function(){
				xyz[0]=d3.event.translate[0];
				xyz[1]=d3.event.translate[1];
			 	visroot.select(".zoomr").attr("transform",
			      "translate("+xyz[0]+","+xyz[1]+")scale("+xyz[2]+")");
				visroot.select(".rectr").attr("transform",
				  "translate(" + xyz[0]*-1+","+xyz[1]*-1+ ")");
			}))
	this.force = d3.layout.force()
		.linkDistance(function(l){return l.distance ? l.distance : 20})
		.linkStrength(1)
		.charge(-600)
		.friction(.3)
		.theta(.8)
		.gravity(0.01)
		.nodes(this.nodes)
		.links(this.links)
		.size([500, 500]); //@TODO - hardcoded
	this.force.on("tick", function() {
		vis.selectAll(".link")
		    .attr("x1", function(d) { return d.source.x; })
		    .attr("y1", function(d) { return d.source.y; })
		    .attr("x2", function(d) { return d.target.x; })
		    .attr("y2", function(d) { return d.target.y; });
		vis.selectAll(".node")
		    .attr("transform", function(d) { return "translate("+d.x+","+d.y+")"; });
	});
	this.restart=function(){
		this.force.start();
		this.vis.selectAll(".link")
			.data(this.links)
			.enter().insert("svg:line", ".node")
	      	.attr("class", "link")
			.attr("stroke-width",function(d) { return d.width ? d.width : 1; })
	      	.attr("x1", function(d) { return d.source.x; })
	      	.attr("y1", function(d) { return d.source.y; })
	      	.attr("x2", function(d) { return d.target.x; })
	      	.attr("y2", function(d) { return d.target.y; });
		this.vis.selectAll(".node")
			.data(this.nodes)
			.enter().insert("svg:g", ".cursor")
			.attr("id",function(d) { return d.id ? d.id : "" })
			.attr("class", function(d) { return d.fixed ? "node" : "node draggable" })
			.attr("transform", function(d) { return "translate("+d.x+","+d.y+")"; })
			.call(function(n){
				n.insert("svg:circle")
					.attr("r",function(d){return d.r ? d.r : 5;})
					.attr("cx",0)
					.attr("cy",0)
					.attr("fill",function(d){return d.color ? d.color : "#999";});
				n.insert("svg:text").attr("cx",0).attr("cy",0).text(function(d){return d.label;});
			});
		this.vis.selectAll(".draggable").call(this.force.drag);
	}
	this.zoomTo=function(z){
		xyz[2]=z;
		this.visroot.select(".zoomr").attr("transform",
	      "translate("+xyz[0]+","+xyz[1]+")scale("+xyz[2]+")");
	}
	this.addNode=function(node){
		this.nodes.push(node);
		return this.nodes.length-1;
	}
	this.addLink=function(link){
		this.links.push(link);
		return this.links.length-1;
	}
}