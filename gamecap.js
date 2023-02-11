(function (gc) {
if(!createjs) console.log( "createjs undefined");
if (!Array.prototype.flat) {
	Array.prototype.flat = function(depth) {

		'use strict';

		// If no depth is specified, default to 1
		if (depth === undefined) {
			depth = 1;
		}

		// Recursively reduce sub-arrays to the specified depth
		var flatten = function (arr, depth) {

			// If depth is 0, return the array as-is
			if (depth < 1) {
				return arr.slice();
			}

			// Otherwise, concatenate into the parent array
			return arr.reduce(function (acc, val) {
				return acc.concat(Array.isArray(val) ? flatten(val, depth - 1) : val);
			}, []);

		};

		return flatten(this, depth);

	};
}

if(typeof require === "undefined") return;
const {ipcRenderer} = require('electron');
const fs = require('fs');

var saveFile = function(filename, content, type, callback) {
	try {
		fs.writeFile(filename, content, type, callback);
	}
	catch(e) { alert('Failed to save the file !'); }
}

var sendData = function(data) {
	ipcRenderer.send('async', data);
}

// screencapture code
function startCapture(stage, scene, options) {
  //  useJpeg = false, zoomFactor = 1, skipFrame = 0, width = 540, height = 960, maxFrames = 3600
  var useJpeg = options && "useJpeg" in options ? options.useJpeg : false;
  var zoomFactor = options && "zoomFactor" in options ? options.zoomFactor : 1;
  // var skipFrame = options && "skipFrame" in options ? options.skipFrame : 0;
  var width = options && "width" in options ? options.width : 540;
  var height = options && "height" in options ? options.height : 960;
  var maxFrames = options && "maxFrames" in options ? options.maxFrames : 3600;
  var initialized = false;

  ipcRenderer.on('asynchronous-message', function handler(evt, message) {
    initialized = true;
    ipcRenderer.removeListener('asynchronous-message', handler);
  });
  sendData({screenCapture: false, width, height, useJpeg, zoomFactor, framerate: (createjs.Ticker.framerate + 0.5)|0});

  var imageCounter = 0;
  var mouseClicking = false;

  stage.addEventListener('stagemousedown', () => {
    mouseClicking = true;
  });

  stage.addEventListener('stagemouseup', () => {
    mouseClicking = false;
  });

  var canvas = document.getElementById( 'canvas' );
  stage.addEventListener('tick', (evt) => {
    if(initialized) {
      var dataObj = {};
      function recurse(clip, dataObj) {
        clip.children.forEach(i => {
          if(!!i.name) {
            var childIndex = clip.children.length - clip.getChildIndex(i); // we reverse the index and start at 1 as this is what After Effects uses
            var obj = dataObj[i.name] = {index: childIndex, x: i.x, y: i.y, regX: i.regX, regY: i.regY, scaleX: i.scaleX, scaleY: i.scaleY, skewX: i.skewX, skewY: i.skewY, rotation: i.rotation, opacity: i.alpha*100, visible: i.visible};
            if(!!i.transformMatrix) obj.transformMatrix = i.transformMatrix.clone();

            if(i.children && i.children.length > 0 && !(('AE_NoRecurse' in i) && i.AE_NoRecurse)) recurse(i, obj);
          }
          else {
            if(i instanceof createjs.Bitmap) {
              var srcMatches = i.image.src.match(/\w*\.\w*$/);
              if(srcMatches.length > 0) {
                dataObj.bitmaps = dataObj.bitmaps || [];
                dataObj.bitmaps.push(srcMatches[0]);
              }
            }
            else if(i instanceof createjs.Shape && i.parent.shapeHolder) {
              var childIndex = clip.children.length - clip.getChildIndex(i); // we reverse the index and start at 1 as this is what After Effects uses
              var obj = {index: childIndex, x: i.x, y: i.y, regX: i.regX, regY: i.regY, scaleX: i.scaleX, scaleY: i.scaleY, skewX: i.skewX, skewY: i.skewY, rotation: i.rotation, opacity: i.alpha*100, visible: i.visible};
              if(!!i.transformMatrix) obj.transformMatrix = i.transformMatrix.clone();
  //              this.children[0].graphics.instructions[0] instanceof createjs.Graphics.BeginPath
              var instructions = i.graphics.instructions.map(inst => {
                if(inst instanceof createjs.Graphics.BeginPath) return {beginpath: true};
                else if(inst instanceof createjs.Graphics.ClosePath) return {closepath: true};
                return inst;
              })
              obj.shapeInstructions = JSON.stringify(instructions);;
              dataObj.shapes = dataObj.shapes || [];
//              dataObj.shapes.push(JSON.stringify(obj)); // just trying to avoid creating an array of objects seems to caused problems when deserealizing
              dataObj.shapes.push(obj); // just trying to avoid creating an array of objects seems to caused problems when deserealizing
            }
          }
        });
      }
      recurse(stage.children[0], dataObj);

      var mousePos = scene.globalToLocal(stage.mouseX, stage.mouseY);
      var data = {frame: imageCounter++, dataObj: dataObj, x: mousePos.x, y: mousePos.y, clicking: mouseClicking};
      sendData(data);
      if(imageCounter > maxFrames) evt.remove();
    }
  });
}

gc.startCapture = startCapture;
})(gamecap = gamecap||{});
var gamecap;
