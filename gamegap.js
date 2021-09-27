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

// can call from the main process
//main.saveFile();

// or call from the renderer process using remote
// saves the image
var saveFile = function(filename, content, type, callback) {
	try {
		fs.writeFile(filename, content, type, callback);
	}
	catch(e) { alert('Failed to save the file !'); }
}

// sends positional data and saves as position.json on exit
var sendData = function(data) {
	ipcRenderer.send('async', data);
}

// screencapture code
function startCapture(stage, maxFrames = 3600) {
  var imageCounter = 0;
  var mouseClicking = false;

  stage.addEventListener('stagemousedown', () => {
    mouseClicking = true;
  });

  stage.addEventListener('stagemouseup', () => {
    mouseClicking = false;
  });

  var canvas = document.getElementById( 'canvas' );
  var bitmap = new createjs.Bitmap( canvas );
  bitmap.cache( 0, 0, canvas.width, canvas.height, 1 );

  //this.cache(0,0,lib.properties.width,lib.properties.height);
  createjs.Ticker.addEventListener('tick', (evt) => {
    bitmap.updateCache();
    var quality = 0.7;
    var url = bitmap.cacheCanvas.toDataURL('image/jpeg', quality);

    const base64data = url.replace(/^data:image\/jpeg;base64,/, "");
    saveFile("output\\image_"+(++imageCounter)+".jpg", base64data, 'base64', (err) => {
      if(err)
        console.log("Err: " + err);
    });

    // export mouseclick data
    var data = {type: "tick", data: {frame: imageCounter, x: stage.mouseX, y: stage.mouseY, clicking: mouseClicking}};
    sendData(data);

    if(imageCounter > maxFrames) evt.remove();
  });
}

gc.startCapture = startCapture;
})(gamecap = gamecap||{});
var gamecap;
