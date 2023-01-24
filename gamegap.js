(function (sc) {
if(!createjs) console.log( "createjs undefined");
if(!Array.prototype.flat) {
    Object.defineProperty(Array.prototype, 'flat', {
        value: function(depth = 1, stack = []) {
            for (let item of this) {
                if (item instanceof Array && depth > 0) {
                    item.flat(depth - 1, stack);
                }
                else {
                    stack.push(item);
                }
            }
            return stack;
        }
    });
}

if(typeof require === "undefined") return;
var {ipcRenderer, remote} = require('electron');
var main = remote.require("./main.js");
const {dialog} = remote;
const fs = remote.require('fs');

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
      
            if(i.children && i.children.length > 0) recurse(i, obj);
          }
          else {
            if(i instanceof createjs.Bitmap) {
              var srcMatches = i.image.src.match(/\w*\.\w*$/);
              if(srcMatches.length > 0) {
                dataObj.bitmaps = dataObj.bitmaps || [];
                dataObj.bitmaps.push(srcMatches[0]);
              }
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

sc.startCapture = startCapture;
})(screencap = screencap||{});
var screencap;
