(function (gc) {
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
function startCapture(stage, width = 540, height = 960, maxFrames = 3600) {
  sendData({width, height});

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
    var url = canvas.toDataURL();
    var data = {frame: ++imageCounter, url: url, x: stage.mouseX, y: stage.mouseY, clicking: mouseClicking};
    sendData(data);

    if(imageCounter > maxFrames) evt.remove();
  });
}

gc.startCapture = startCapture;
})(gamecap = gamecap||{});
var gamecap;
