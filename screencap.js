(function (sc) {
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
function startCapture(stage, options) {
  //  useJpeg = false, zoomFactor = 1, skipFrame = 0, width = 540, height = 960, maxFrames = 3600
  var useJpeg = options && "useJpeg" in options ? options.useJpeg : false;
  var zoomFactor = options && "zoomFactor" in options ? options.zoomFactor : 1;
  var skipFrame = options && "skipFrame" in options ? options.skipFrame : 0;
  var width = options && "width" in options ? options.width : 540;
  var height = options && "height" in options ? options.height : 960;
  var maxFrames = options && "maxFrames" in options ? options.maxFrames : 3600;
  var initialized = false;

  ipcRenderer.on('asynchronous-message', function handler(evt, message) {
    initialized = true;
    ipcRenderer.removeListener('asynchronous-message', handler);
  });
  sendData({screenCapture: true, width, height, useJpeg, zoomFactor, framerate: (createjs.Ticker.framerate + 0.5)|0});

  var imageCounter = 0;
  var mouseClicking = false;

  stage.addEventListener('stagemousedown', () => {
    mouseClicking = true;
  });

  stage.addEventListener('stagemouseup', () => {
    mouseClicking = false;
  });

  var canvas = document.getElementById( 'canvas' );
  createjs.Ticker.addEventListener('tick', (evt) => {
    if(initialized) {
      if(skipFrame == 0 || tickCounter % skipFrame == 0) {

        // for transparency without params
        // for jpeg set to canvas.toDataURL('image/jpeg', 1.0);
        var url = useJpeg ? canvas.toDataURL('image/jpeg', 1.0) : canvas.toDataURL();
        var data = {frame: ++imageCounter, url: url, x: stage.mouseX, y: stage.mouseY, clicking: mouseClicking};
        sendData(data);  
      }
      if(imageCounter > maxFrames) evt.remove();        
    }
  });
}

sc.startCapture = startCapture;
})(screencap = screencap||{});
var screencap;
