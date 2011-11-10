var w=1200;
var h=700;
var nlVis=new d3nl("#chart",w,h);

function distanceBetweenTwoNodes(a,b){
	return Math.sqrt((a.x-b.x)*(a.x-b.x)+(a.y-b.y)*(a.y-b.y));
}


nlVis.force.size([w,h]);

$.ajax({
  url: "xlin.umls.GetData.xml",
  context: document.body,
  success: function(xml){
	var avgConCount;
	$(xml).find("meta").each(function(){
		avgConCount=$(this).attr("avgConCount");
	});
	var centerx;
	var centery;
	$(xml).find("node").each(function(){
		if($(this).attr("concurrency")==9999){
			centerx=$(this).attr("x");
			centery=$(this).attr("y");
		}
	});
    $(xml).find("node").each(function(){
		var node={
			label: $(this).attr("name"),
			id: $(this).attr("id"),
			concurrency: $(this).attr("concurrency"),
			category: $(this).attr("category"),
			x: ($(this).attr("x")-centerx)*centerx*w*.8+w/2,
			y: ($(this).attr("y")-centery)*centery*h*.8+h/2,
			fixed: $(this).attr("concurrency")==9999,
			r: Math.max(5,Math.pow($(this).attr("concurrency"),1/Math.pow(avgConCount,.2))),
			color: '#'+(Math.random()*0xFFFFFF<<0).toString(16)
		};
		nlVis.addNode(node);
	});
	$(xml).find("edge").each(function(){
		var link={
			source: nlVis.nodes[$(this).attr("a")],
			target: nlVis.nodes[$(this).attr("b")],
			width: Math.random()*4+1,
			concurrency: $(this).attr("concurrency")
		};
		var link=nlVis.links[nlVis.addLink(link)];
		link.distance=distanceBetweenTwoNodes(link.target,link.source)*.9;
	});
	nlVis.force.linkDistance(function(l){return l.distance});
	nlVis.restart();
	
	
	//context menu
	$("#chart g.node").contextMenu({
		menu: 'myMenu'
	},
		function(action, el, pos) {
			console.log(action, el, pos);
	});
  }
});


//ui

$("#zoomui").slider({
  min: -1, max: 1, step: .01, values: [0],
  slide: function(event, ui) {
    nlVis.zoomTo(Math.pow(2,ui.value));
  }
});
$("#xui").slider({
  min: 0, max: 2000, step: 1, values: [600],
  slide: function(event, ui) {
    nlVis.force.charge(-1*ui.value);
	nlVis.restart()
  }
});
$("#yui").slider({
  min: 0, max: 1, step: .01, values: [.3],
  slide: function(event, ui) {
    nlVis.force.friction(ui.value);
	nlVis.restart()
  }
});
$("#zui").slider({
  min: 0, max: .5, step: .01, values: [0.01],
  slide: function(event, ui) {
    nlVis.force.gravity(ui.value);
	nlVis.restart()
  }
});