var vistrail = new Object();

var positionSource = new Object();
var positionDestination = new Object();

var screenWidth = 0, screenHeight = 0, screenCenterX = 0, screenCenterY = 0;
var previousScreenCenterX = 0;
var previousScreenCenterY = 0;

var zoomLevel = 0.5;
var previousZoomLevel = 0.5;

var startedLine = false;

var activeTool;

var jg;

$(document).ready(function() {

	getWindowDimensions();
	screenCenterX = screenWidth / 2;
	screenCenterY = screenHeight / 10;

	windowCenterX = screenWidth / 2;
	windowCenterY = screenHeight / 10;

	$('.canvas').css({'width' : screenWidth, 'height' : screenHeight});
	// Bind events for changing active tool

	activeTool = 1;
	$("#panButton").attr("border","1px");


	$("#panButton").mousedown(function(e){
		activeTool = 1;
		$("#panButton").attr("border","1px");
		$("#zoomButton").attr("border","0px");
	});

	$("#zoomButton").mousedown(function(e){
		activeTool = 2;
		$("#panButton").attr("border","0px");
		$("#zoomButton").attr("border","1px");
	});

	// bind user interaction events

	$("#canvas").mousedown(function(e){
		positionSource.x = e.pageX;
		positionSource.y = e.pageY;

		previousScreenCenterX = screenCenterX;
		previousScreenCenterY = screenCenterY;

		previousZoomLevel = zoomLevel;

		if ( activeTool != 0 ) {
			startedLine = true;
		}

	}).mousemove(function(e){
		if ( startedLine ) {
			if ( activeTool == 1 ) pan(e);
			if ( activeTool == 2 ) zoom(e);
		}
	}).mouseup(function(e){

		if ( startedLine ) {
			positionDestination.x = e.pageX;
			positionDestination.y = e.pageY;
			startedLine = false;
		}

		drawVistrail();
	});


	vistrail.taggedActions = new Array();
	vistrail.actions = new Array();
	vistrail.tree = null;
	vistrail.sticks = new Array();
	var tempActions = new Array();

	$.ajax({
		url: "http://www.vistrails.org/extensions/get_vt_xml.php?host=vistrails.sci.utah.edu&port=3306&db=vistrails&vt=" + getParamFromURL( "" + window.location, "id" ),
		type: 'GET',
		cache: true,
		dataType: 'xml',
		timeout: 8446744073709551610,
		error: function(){
			alert(this.url);
			alert('Error loading XML document');
		},
		success: function(xml){

			$('vistrail:first', xml).each( function(){
				vistrail.id = $(this).attr("id");
				vistrail.name = $(this).attr("name");
				vistrail.version = $(this).attr("version");
			});

			$('action', xml).each( function(){
				var action = new Object();
				action.id = $(this).attr("id");
				if ( action.id == 0 ) alert("found root");
				action.prevId = $(this).attr("prevId");
				action.date = $(this).attr("date");
				action.prune = $(this).attr("prune");
				action.session = $(this).attr("session");
				action.user = $(this).attr("user");
				tempActions[action.id] = action;
			});

			$('tag', xml).each( function(){

				var taggedAction = new Object();

				taggedAction.id = $(this).attr("id");
				taggedAction.name = $(this).attr("name");

				vistrail.taggedActions[taggedAction.id] = taggedAction;
			});

			var keys = new Array();

			for(k in tempActions) {
			     keys[keys.length] = k;
			}

			keys.sort( function(a, b){ return (a - b); });

			for (k in keys) {
				vistrail.actions[k] = tempActions[k];
			}


			var treeNodes = new Array();
		
			var fullTree = new Tree();
			treeNodes[0] = fullTree.addNode(null, 1, 1, "0");
		
			for ( var a in vistrail.actions ) {
				if ( a != 0 ) {
					var action = vistrail.actions[a];
					//alert(action.id + " " + a);
					if (vistrail.taggedActions[action.id]) {
						treeNodes[action.id] = fullTree.addNode(treeNodes[action.prevId], 15, 15, "" + vistrail.taggedActions[action.id].name);
					} else {
						treeNodes[action.id] = fullTree.addNode(treeNodes[action.prevId], 15, 15, "" + action.id);
					}
				}
			}

			// now create the decemated tree.
			var smallTreeNodes = new Array();

			var smallTree = new Tree();
			smallTreeNodes[0] = smallTree.addNode(null, 20, 20, "");

			for ( var id in treeNodes ) {

				if ( id != 0 && ( parseInt( treeNodes[id].getNumChildren() ) != 1 || vistrail.taggedActions[id] ) ) {
					// find its parent.
					var parentId = vistrail.actions[id].prevId;

					var count = 0;
					var stick = new Array();

					while ( parentId != 0 && treeNodes[parentId].getNumChildren() <= 1 && !vistrail.taggedActions[parentId] ) {
						stick[count] = treeNodes[parentId];
						parentId = vistrail.actions[parentId].prevId;
						count++;
					}

					// add the node to the tree.
					$("#offscreen").html( "<div id='node-" + id + "' style='position: absolute; left: -500px; top: -300px;'>" + treeNodes[id].object + "</div>" );
					smallTreeNodes[id] = smallTree.addNode(smallTreeNodes[parentId], $("#node-" + id).width(), $("#node-" + id).height(), treeNodes[id].object);

					if ( count > 0 ) {
						var stickNode = new Object();
						stickNode.expanded = false;
						stickNode.parentId = parentId;
						stickNode.childId = id;
						stickNode.stick = stick;
						vistrail.sticks[vistrail.sticks.length] = stickNode;
					}
				}
			}

			vistrail.tree = smallTree;
			vistrail.smallTreeNodes = smallTreeNodes;

			jg = new jsGraphics("canvas");
			jg.setColor("#000000");

			vistrail.treeLayout = new TreeLayout( smallTree, 0, 50, 50 );

			drawVistrail();
		}
	});
});

function drawVistrail() {

	$("Title").html( "Vistrail - " + vistrail.name  );

	$("#canvas").html("");

	var vistrailHTML = "Vistrail: " + vistrail.name + "<br>";

	var smallTree = vistrail.tree;
	var smallTreeNodes = vistrail.smallTreeNodes;

	var nodeString = "";

	var nodes = vistrail.treeLayout.tree.nodes;

	for ( var n in nodes ) {
		var node = nodes[n];
		if (node.parent != null)

			jg.drawLine( screenCenterX + ( zoomLevel * node.x ), screenCenterY + ( zoomLevel * node.y),
				     screenCenterX + ( zoomLevel * node.parent.x ), screenCenterY + ( zoomLevel * node.parent.y ) );

			nodeString += "<img src='images/blackCircle.gif' id='blackCircleImage-" + n + "' " +
				"width='" + ( zoomLevel * ( node.width + 36 ) ) + "'" +
				"height='" + ( zoomLevel * ( node.height + 26 ) ) + "' " +
				"style='position: absolute; " +
				"left: " + ( screenCenterX + ( zoomLevel * ( node.x - 18 - ( node.width / 2 ) ) ) ) + "px; " +
				"top: " + ( screenCenterY + ( zoomLevel * ( node.y - 13 - ( node.height / 2 ) ) ) ) + "px;'>" +

				"<img src='images/whiteCircle.gif' id='whiteCircleImage-" + n + "' " +
				"width='" + ( zoomLevel * ( node.width + 30 ) ) + "'" +
				"height='" + ( zoomLevel * ( node.height + 20 ) ) + "' " +
				"style='position: absolute; " +
				"left: " + ( screenCenterX + ( zoomLevel * ( node.x - 15 - ( node.width / 2 ) ) ) ) + "px; " +
				"top: " + ( screenCenterY + ( zoomLevel * ( node.y - 10 - ( node.height / 2 ) ) ) ) + "px;'>" +

				"<img src='images/orangeCircle.gif' id='orangeCircleImage-" + n + "' " +
				"width='" + ( zoomLevel * ( node.width + 30 ) ) + "'" +
				"height='" + ( zoomLevel * ( node.height + 20 ) ) + "' " +
				"style='position: absolute; " +
				"left: " + ( screenCenterX + ( zoomLevel * ( node.x - 15 - ( node.width / 2 ) ) ) ) + "px; " +
				"top: " + ( screenCenterY + ( zoomLevel * ( node.y - 10 - ( node.height / 2 ) ) ) ) + "px; " +
				"opacity:" + ( node.level / smallTree.maxLevel ) + ";filter:alpha(opacity=" + parseInt( node.level / smallTree.maxLevel ) + ")'>" +

				"<div id='treeAction-" + n + "' class='action' style='position: absolute; cursor: pointer; " +
				//"width: " + ( zoomLevel * node.width ) + "px; " +
				//"height: " + ( zoomLevel * node.height ) + "px; " +
				"left: " + ( screenCenterX + ( zoomLevel * ( node.x - ( node.width / 2 ) ) ) ) + "px; " +
				"top: " + ( screenCenterY + ( zoomLevel * ( node.y - ( node.height / 2 ) ) ) ) + "px; font-size: " + zoomLevel * 16 + "px;'>" + node.object + "</div>";
	}
/*
	var sticks = vistrail.sticks;

	for ( var s in sticks ) {
		var nodeStick = sticks[ s ];
		var x = ( smallTreeNodes[ nodeStick.parentId ].x + smallTreeNodes[ nodeStick.childId ].x ) / 2.0;
		var y = ( smallTreeNodes[ nodeStick.parentId ].y + smallTreeNodes[ nodeStick.childId ].y ) / 2.0;
		nodeString += "<div class='stick' id='stick-" + s  + "' style='position: absolute; left: " + ( screenCenterX + ( zoomLevel * ( x - 6 ) ) ) + "px; top: " + ( screenCenterY + ( zoomLevel * ( y - 6 ) ) ) + "px;'><img src='images/plus.png'></div>";
	}
*/
	jg.paint();

	$("#canvas").append( nodeString );
/*
	$(".action").click( function(){
		if ( activeTool == 0 ) {
			var stickId =  parseInt(this.id.split('-')[1]);
			window.location = "WorkflowEditor.html?vt=" + vistrail.id + "&version=" + stickId;
		}
	});
*/
}

function pan(e) {

	screenCenterX = previousScreenCenterX + ( ( e.pageX - positionSource.x ) );
	screenCenterY = previousScreenCenterY + ( ( e.pageY - positionSource.y ) );

	drawLightVistrail();
}

function zoom(e) {

	// Add something about a reference center point that matches the screen center point.  Zoom about this point

	var sign = parseFloat( e.pageY - positionSource.y  );
	var magnitude = Math.abs(sign);
	sign = sign / magnitude;

	magnitude /= 200.0;
	magnitude++;

	if ( sign < 0 ) zoomLevel = previousZoomLevel * magnitude;
	else zoomLevel = previousZoomLevel / magnitude;

	drawLightVistrail();
}
