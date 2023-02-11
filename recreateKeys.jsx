
// this is the AE script to import the data from the merged json file
// convert it into an AE project

// $.writeln(File($.fileName).path + '/json2.min.js');
//$.evalFile(File($.fileName).path + '/json2.min.jsx');
// Production steps of ECMA-262, Edition 5, 15.4.4.15
// Reference: http://es5.github.io/#x15.4.4.15
if (!Array.prototype.lastIndexOf) {
  Array.prototype.lastIndexOf = function(searchElement /*, fromIndex*/) {
    'use strict';

    if (this === void 0 || this === null) {
      throw new TypeError();
    }

    var n, k,
      t = Object(this),
      len = t.length >>> 0;
    if (len === 0) {
      return -1;
    }

    n = len - 1;
    if (arguments.length > 1) {
      n = Number(arguments[1]);
      if (n != n) {
        n = 0;
      }
      else if (n != 0 && n != (1 / 0) && n != -(1 / 0)) {
        n = (n > 0 || -1) * Math.floor(Math.abs(n));
      }
    }

    for (k = n >= 0 ? Math.min(n, len - 1) : len - Math.abs(n); k >= 0; k--) {
      if (k in t && t[k] === searchElement) {
        return k;
      }
    }
    return -1;
  };
}

{
	var proj = app.project;
//~ 	var progBarUI = buildProgressBarUI(" Progress", 300, 40);                         

//~ 	function isSecurityPrefSet()
//~ 	{
//~ 		var securitySetting = app.preferences.getPrefAsLong("Main Pref Section", "Pref_SCRIPTING_FILE_NETWORK_SECURITY");
//~ 		return (securitySetting == 1);
//~ 	}

//~      function buildProgressBarUI (windowTitle, windowWidth, windowHeight)
//~      {  //windowWidth and windowWidth are optional and are there to compensate for a lot of text if using the progressText feature
//~         if (windowWidth == null) windowWidth = 300;
//~         if (windowHeight == null) windowHeight = 20;
//~         
//~         var dlg = new Window("palette", windowTitle, undefined, {resizeable:false});
//~         var res = "group { \
//~ 	orientation:'column', alignment:['left','top'], alignChildren:['fill','fill'],  \
//~ 	text: Group { \
//~ 		text: StaticText { preferredSize: [" + windowWidth + "," + windowHeight + "], alignment:['left','top'], properties:{multiline:true} }, \
//~ 	} \
//~ };";

//~         dlg.layergrp = dlg.add(res);       
//~         dlg.center();
//~         
//~         return dlg;	
//~     } // close progressUI () 

//~     function updateProgBar(progBarUIObj, progressText)
//~     {  //progressText is optional.  Use it if you want to display updating text under the progress bar
//~ 		var progText = null;
//~ 		
//~ 		progText = progBarUIObj.layergrp.text.text;
//~ 		if (progressText == null) progressText = "";  
//~ 		progText.text = progressText;
//~     }

	function copyItemsIntoArray(coll) {
		var arr = [];
		for(var i = 1; i <= coll.length; i++)
			arr.push(coll[i]);
		return arr;
	}

	function findItemByName(coll, name, type) {
		var arr = [];
		for(var i = 1; i <= coll.length; i++) {
			if(coll[i].name == name && coll[i] instanceof type) {
				return coll[i];
				break;
			}
		}
		return null;
	}

	function isObject(item) {
		return (item && typeof item === 'object' && !Array.isArray(item));
	}


	function convertQP2CP(qp0, qp1, qp2) {
		var cp1 = [0,0];
		var cp2 = [0,0];
		cp1[0] = qp0[0] + 2/3 *(qp1[0] - qp0[0]);
		cp1[1] = qp0[1] + 2/3 *(qp1[1] - qp0[1]);
		cp2[0] = qp2[0] + 2/3 *(qp1[0] - qp2[0]);
		cp2[1] = qp2[1] + 2/3 *(qp1[1] - qp2[1]);

		return [cp1, cp2];
	}

	function addShapeKey(timeToSetKey, shapeGroup, sgr, instructions, setColor) {
		var sGroup = shapeGroup;
		var contents = sGroup.property("Contents");
		var grp = contents.property("Path 1");
		var extraGrps = [];

		setColor = !!setColor;
		var myShape = new Shape();
		var vertsArr = [];
		var outTangsArr = [];
		var inTangsArr = [];
		
		var isStroke = false;
		var strokeWidth = 0;
		var colorStr = "#FFFFFF";
		
		var closePathCalled = false;
		var beginPathCalled = false;
		
		var curGrpObj = null;
		var curGrp = grp;
		var curShape = myShape;
		var curVertsArr = vertsArr;
		var curOutTangsArr = outTangsArr;
		var curInTangsArr = inTangsArr;
		
		for(var i=0; i<instructions.length; i++) {
			var obj = instructions[i];
			var nextObj = i+1<instructions.length ? instructions[i+1] : instructions[0];
			if("beginpath" in obj) {
				beginPathCalled = true;
			}
			else if("closepath" in obj) {
				closePathCalled = true;
				if(closePathCalled) {
					curVertsArr = [];
					curOutTangsArr = [];
					curInTangsArr = [];
					extraGrps.push(curGrpObj = {vertsArr: curVertsArr, outTangsArr: curOutTangsArr, inTangsArr: curInTangsArr});
				}
			}
			else if("x" in obj && "y" in obj) {
				curVertsArr.push([obj.x, obj.y]);
				if("cpx" in obj && "cpy" in obj) {
					var x = (obj.cpx - obj.x) * 2/3;
					var y = (obj.cpy - obj.y) * 2/3;
					curInTangsArr.push([x, y]);
				}
				else curInTangsArr.push([0, 0]);
				
				if(nextObj && "cpx" in nextObj && "cpy" in nextObj) {
					var x = (nextObj.cpx - obj.x) * 2/3; 
					var y = (nextObj.cpy - obj.y) * 2/3;
					curOutTangsArr.push([x, y]);
				}
				else curOutTangsArr.push([0, 0]);
			}
			else if(setColor) {
				if("width" in obj) {
					isStroke = true;
					strokeWidth = obj.width;
				}
				else if("style" in obj) {
					colorStr = obj.style;
				}
			}			
		}
	
		// primary shape
		myShape.vertices = vertsArr;
		myShape.inTangents = inTangsArr;
		myShape.outTangents = outTangsArr;
		myShape.closed = true;
		grp = contents.property("Path 1");
		var pathProp = grp("path");
		pathProp.setValueAtTime(timeToSetKey, myShape);
		pathProp.setInterpolationTypeAtKey(pathProp.nearestKeyIndex(timeToSetKey), KeyframeInterpolationType.HOLD);
		
		// extra shapes
		for(var index = 0; index < extraGrps.length; index++) {
			if(extraGrps[index].vertsArr.length > 0) {
				var tempGrp = shapeGroup.property("Contents").property("Path " + (index+2));
				var newGrp = tempGrp || shapeGroup.property("Contents").addProperty("ADBE Vector Shape - Group");
				var newShape = new Shape();
				
				newShape.vertices = extraGrps[index].vertsArr;
				newShape.inTangents = extraGrps[index].inTangsArr;
				newShape.outTangents = extraGrps[index].outTangsArr;
				newShape.closed = true;
				var pathProp = newGrp("path");
				pathProp.setValueAtTime(timeToSetKey, newShape);
				pathProp.setInterpolationTypeAtKey(pathProp.nearestKeyIndex(timeToSetKey), KeyframeInterpolationType.HOLD);
			}			
		}
		
		if(setColor) {
			// convert color
			var isRGBAColor = /^rgba/.test(colorStr);
			var color = [1,1,1];
			var opacity = 100;
			if(isRGBAColor) {
				var colorMatches = colorStr.match(/(?:\()(.*)(?:\))/)[1].split(',');
				color = [];
				for(var i = 0; i<colorMatches.length-1; i++) {
					var c = Number(colorMatches[i]);
					if(i < colorMatches.length-1) c= c/255;
					color[i] = c;
				}
				opacity = colorMatches[colorMatches.length-1] * 100;
			}
			else {
				var c= colorStr.substring(1).split('');
				if(c.length== 3) {
					c= [c[0], c[0], c[1], c[1], c[2], c[2]];
				}
				c = '0x'+c.join('');
				color = [((c>>16)&255)/255, ((c>>8)&255)/255, (c&255)/255, 1];
			}
			
			if(!isStroke) {
 				var fill = shapeGroup.property("Contents").addProperty("ADBE Vector Graphic - Fill");
				fill("color").setValue(color);
				fill("opacity").setValue(opacity);
			}
			else {
				var stroke = shapeGroup.property("Contents").addProperty("ADBE Vector Graphic - Stroke");	
				stroke("color").setValue(color);
				stroke("opacity").setValue(opacity);
				stroke("strokeWidth").setValue(strokeWidth);
			}		
		}
	
		return grp;
	}

	function getMagnitude(x,y) {
		return Math.sqrt(x*x + y*y);
	}

	function normalize(x,y) {
		var magnitude = getMagnitude(x,y);
		return [x/magnitude, y/magnitude];
	}

	function main() {
		app.beginUndoGroup("recreateKeys");
		
		if(proj) {
			// create new base comp
			var baseComp = null;
			var baseFolder = null;
			var baseImagesFolder = null;

			var WIDTH = 960;
			var HEIGHT = 960;
			var DURATION = 30;
			var FPS = 60;

			function recurseObj(obj, comp, folder) {
				var objLayerMap = {};
				// var addedHierarchyLayer = false;
				for (var key in obj) {
					if (obj.hasOwnProperty(key)) {
//~ 						updateProgBar(progBarUI, key);

						var objProp = obj[key];
						var compAddedLayer = null;
						
						if(isObject(objProp)) {
							var tempLayer = comp.layers.byName(key);
							var compToAdd;

							if(!!tempLayer) {
								compToAdd = tempLayer.source;
								compAddedLayer = tempLayer;
							}
							else {
								compToAdd = folder.items.addComp(key, WIDTH, HEIGHT, 1, DURATION, FPS);

								var moveAfterLayer = null;
								for(var i = 1; i <= comp.layers.length; i++) {
									var layerName = comp.layers[i].name;
									
									if(objLayerMap[layerName] && obj[key].index > objLayerMap[layerName].index) {
										moveAfterLayer = comp.layers[i];
									}
								}
							
								compAddedLayer = comp.layers.add(compToAdd);
								compAddedLayer.name = key;
								if(!!moveAfterLayer) {
									compAddedLayer.moveAfter(moveAfterLayer);
								}
								else {
									compAddedLayer.moveToBeginning();
								}
							}
						
							objLayerMap[key] = {};
							objLayerMap[key].index = obj[key].index;
							
 							for(var i = 0; i < objProp.position.length; i++) {
								var valueObj = objProp.position[i];
								var timeToSetKey = valueObj.frame/FPS;
								compAddedLayer.position.setValueAtTime(timeToSetKey, [valueObj.value[0], valueObj.value[1], 0]);								
								compAddedLayer.position.setInterpolationTypeAtKey(compAddedLayer.position.nearestKeyIndex(timeToSetKey), KeyframeInterpolationType.HOLD);
							}
						
 							for(var i = 0; i < objProp.anchorPoint.length; i++) {
								var valueObj = objProp.anchorPoint[i];
								var timeToSetKey = valueObj.frame/FPS;
								compAddedLayer.anchorPoint.setValueAtTime(timeToSetKey, [valueObj.value[0], valueObj.value[1], 0]);								
								compAddedLayer.anchorPoint.setInterpolationTypeAtKey(compAddedLayer.anchorPoint.nearestKeyIndex(timeToSetKey), KeyframeInterpolationType.HOLD);
							}
						
 							for(var i = 0; i < objProp.scale.length; i++) {
								var valueObj = objProp.scale[i];
								var timeToSetKey = valueObj.frame/FPS;
								compAddedLayer.scale.setValueAtTime(timeToSetKey, [valueObj.value[0] * 100, valueObj.value[1] * 100]);
								compAddedLayer.scale.setInterpolationTypeAtKey(compAddedLayer.scale.nearestKeyIndex(timeToSetKey), KeyframeInterpolationType.HOLD);
							}

 							for(var i = 0; i < objProp.rotation.length; i++) {
								var valueObj = objProp.rotation[i];
								var timeToSetKey = valueObj.frame/FPS;
								compAddedLayer.rotation.setValueAtTime(timeToSetKey, valueObj.value);
								compAddedLayer.rotation.setInterpolationTypeAtKey(compAddedLayer.rotation.nearestKeyIndex(timeToSetKey), KeyframeInterpolationType.HOLD);
							}
						
							var earliestFrame = null;

 							for(var i = 0; i < objProp.opacity.length; i++) {
								var valueObj = objProp.opacity[i];
								var timeToSetKey = valueObj.frame/FPS;
								if(earliestFrame === null || valueObj.frame < earliestFrame) earliestFrame = valueObj.frame;
								
								compAddedLayer.opacity.setValueAtTime(timeToSetKey, valueObj.value);
								compAddedLayer.opacity.setInterpolationTypeAtKey(compAddedLayer.opacity.nearestKeyIndex(timeToSetKey), KeyframeInterpolationType.HOLD);
							}
						
							// order startend frames
							var startEnds = [];
							for(var i=0; i< objProp.startFrames.length; i++) {
								startEnds.push({type: "start", frame: objProp.startFrames[i]})
							}
							for(var i=0; i< objProp.endFrames.length; i++) {
								startEnds.push({type: "end", frame: objProp.endFrames[i]})
							}
							startEnds.sort(function(a, b) { return a.frame > b.frame })
							
							var startEndTypes = [];
							var startEndValues = [];
							
							var startFrame = null;
							var endFrame = null;
							
							for(var i=0; i< startEnds.length; i++) {
								var curType = startEnds[i].type;
								var curFrame = startEnds[i].frame;
								
								startEndTypes.push(curType);
								startEndValues.push(curFrame);
								
								var timeToSetKey = (curType == 'end' ? curFrame +1 : curFrame)/FPS;

								if(curType != 'start' || curFrame > earliestFrame) {
									compAddedLayer.opacity.setValueAtTime(timeToSetKey, curType == 'start' ? 100 : 0);
									compAddedLayer.opacity.setInterpolationTypeAtKey(compAddedLayer.opacity.nearestKeyIndex(timeToSetKey), KeyframeInterpolationType.HOLD);
								}
							}
							
							// get the first start frame
							var startFrame = startEndValues[startEndTypes.indexOf('start')];
							var endFrame = startEndValues[startEndTypes.lastIndexOf('end')];
							
							compAddedLayer.inPoint = startFrame/FPS;
							compAddedLayer.outPoint = endFrame/FPS;
							
							if(!!objProp.bitmaps && objProp.bitmaps.length > 0) {
								for(var i = 0; i < objProp.bitmaps.length; i++) {
									var footage = proj.importFile(new ImportOptions(File(File($.fileName).path  + "/images/" + objProp.bitmaps[i])));
									footage.parentFolder = baseImagesFolder;
									var footageLayer = compToAdd.layers.add(footage);
									footageLayer.anchorPoint.setValue([0,0,0]);
									footageLayer.position.setValue([0,0,0]);
								}
							}
						
							if(objProp.shapes && objProp.shapes.length > 0) {
								for(var i = objProp.shapes.length-1; i>=0; i--) {
									var shapeKeys = objProp.shapes[i];
									var shapeLayer = compToAdd.layers.addShape();
									var shapeGroup = shapeLayer.property("Contents").addProperty("ADBE Vector Group");
									shapeGroup.property("Contents").addProperty("ADBE Vector Shape - Group");
									
									for(var k = 0; k < shapeKeys.length; k++) {
										var valueObj = shapeKeys[k];
										var timeToSetKey = valueObj.frame/FPS;
//										compAddedLayer.anchorPoint.setValueAtTime(timeToSetKey, [valueObj.value[0], valueObj.value[1], 0]);								

										var instructions = JSON.parse(valueObj.value.instructions);
										try {
											addShapeKey(timeToSetKey, shapeGroup, null, instructions, (k==0));
											shapeLayer.anchorPoint.setValue([0,0,0]);
											shapeLayer.position.setValue([valueObj.value.x, valueObj.value.y, 0]);
										}
										catch(err) {
											$.writeln(err);
										}
									}									
								}
							}

							recurseObj(objProp, compToAdd, folder);
						}
					}
				}
			}
		
			try {
				for(var index = 1; index <= proj.items.length; index++) if(proj.items[index].name == 'base') baseComp = proj.items[index];
				for(var index = 1; index <= proj.items.length; index++) if(proj.items[index].name == 'base folder') baseFolder = proj.items[index];
				for(var index = 1; index <= proj.items.length; index++) if(proj.items[index].name == 'images folder') baseImagesFolder = proj.items[index];

				var jsonFile = File.openDialog();
				jsonFile.open('r');
				var data = jsonFile.read();
				jsonFile.close();
//				var mergedSceneData = JSON.parse(data);
				var mergedSceneData = eval("(" + data + ")");
				DURATION = Math.floor(mergedSceneData.duration + 0.5);
				FPS = mergedSceneData.framerate;
				
				if(!baseComp) baseComp = proj.items.addComp("base", WIDTH, HEIGHT, 1, DURATION, FPS);
				if(!baseFolder) baseFolder = proj.items.addFolder("base folder");			
				if(!baseImagesFolder) baseImagesFolder = proj.items.addFolder("images folder");			
				
//~ 				progBarUI.show();  //show it 
//~ 				updateProgBar(progBarUI, "starting");
				recurseObj(mergedSceneData.frameData, baseComp, baseFolder);

				var positionArr = mergedSceneData.pointer.position;
				var clickingArr = mergedSceneData.pointer.clicking;
				var pointerLayer = baseComp.layers.addNull();
				pointerLayer.name = "pointer";
				var controlEffect = pointerLayer.property("Effects").addProperty("ADBE Checkbox Control");
				controlEffect.name = "mousedown";

//~ 				updateProgBar(progBarUI, "pointer position");
				for(var i = 0; i < positionArr.length; i++) {
					var valueObj = positionArr[i];
					var timeToSetKey = valueObj.frame/FPS;
					pointerLayer.position.setValueAtTime(timeToSetKey, [valueObj.value[0], valueObj.value[1], 0]);
					pointerLayer.position.setInterpolationTypeAtKey(pointerLayer.position.nearestKeyIndex(timeToSetKey), KeyframeInterpolationType.HOLD);
				}
			
//~ 				updateProgBar(progBarUI, "pointer clicking");
				for(var i = 0; i < clickingArr.length; i++) {
					var valueObj = clickingArr[i];
					var timeToSetKey = valueObj.frame/FPS;
					var checkParam = controlEffect("Checkbox");
					checkParam.setValueAtTime(timeToSetKey, valueObj.value);
				}
			
//~ 				progBarUI.close();  //close it 
			}
			catch(err) {
				alert(err);
			}
		}
		else
			alert("Error");

		app.endUndoGroup();
	}

	main();
}
