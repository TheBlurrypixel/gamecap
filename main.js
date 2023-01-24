const {dialog, ipcMain} = require('electron');
//var fs = require('fs');
const fs = require('fs');
const path = require('path');
const url = require('url');

const electron = require('electron');
const app = electron.app;

//const path = require('path');

var screenCapture = true;



var frameData = [];

var useJpeg = false;
var initalized = false;

var width = 960
var height = 960;
var framerate = 30;

const DEV_MODE = true;

const ASPECT = "landscape";



const BrowserWindow = electron.BrowserWindow;

var mainWindow;

var shouldQuit = app.makeSingleInstance(function(commandLine, workingDirectory) {
  // Someone tried to run a second instance, we should focus our window.
  if (mainWindow) {
    mainWindow.show();
  }
});

if (shouldQuit) {
  app.quit();
  return;
}

if(!fs.existsSync("output\\"))
	fs.mkdirSync("output\\");

var saveFile = function(filename, content, type, callback) {
  try {
    fs.writeFile(filename, content, type, callback);
  }
  catch(e) { alert('Failed to save the file !'); }
}


function isObject(item) {
	return (item && typeof item === 'object' && !Array.isArray(item));
}

function mergeDeepObjectProps(target, frame, srcNextCheck, srcPrevCheck, currentIndex, ...sources) {
	if (!sources.length) return target;
	const source = sources.shift();

	if (isObject(target) && isObject(source)) {
		for (const ky in source) {
			var key = ky;
			if (isObject(source[key])) {
				var src = source[key];
				if (!target[key]) {
					var propObj = {};
					propObj[key] = {index: src.index, startFrames: [], endFrames: [], position: [{frame: frame, value: [src.x, src.y]}], anchorPoint: [{frame: frame, value: [src.regX, src.regY]}], scale: [{frame: frame, value: [src.scaleX, src.scaleY]}], rotation: [{frame: frame, value: src.rotation}], opacity: [{frame: frame, value: src.visible ? src.opacity : 0}]};
					if(!!src.bitmaps) propObj[key].bitmaps = src.bitmaps.slice();
					Object.assign(target, propObj);
				}
				else { // target[key] already exists
					target[key] = Object.assign({}, target[key])

					var pos = target[key].position[target[key].position.length-1];
					if(pos.value[0] != src.x || pos.value[1] != src.y) target[key].position.push({frame: frame, value: [src.x, src.y]});

					var anchorPt = target[key].anchorPoint[target[key].anchorPoint.length-1];
					if(anchorPt.value[0] != src.regX || anchorPt.value[1] != src.regY) target[key].anchorPoint.push({frame: frame, value: [src.regX, src.regY]});

					var scale = target[key].scale[target[key].scale.length-1];
					if(scale.value[0] != src.scaleX || scale.value[1] != src.scaleY) target[key].scale.push({frame: frame, value: [src.scaleX, src.scaleY]});

					var rotation = target[key].rotation[target[key].rotation.length-1];
					if(rotation.value != src.rotation) target[key].rotation.push({frame: frame, value: src.rotation});

					var opacity = target[key].opacity[target[key].opacity.length-1];
					var srcOpacity = src.visible ? src.opacity : 0;
					if(opacity.value != srcOpacity) target[key].opacity.push({frame: frame, value: src.visible ? src.opacity : 0});
				}

				if(!srcNextCheck || !(key in srcNextCheck)) {
					target[key].endFrames.push(frame+1)
				}

				if(!srcPrevCheck || !(key in srcPrevCheck)) {
					target[key].startFrames.push(frame)
				}

				mergeDeepObjectProps(target[key], frame, srcNextCheck && srcNextCheck[key], srcPrevCheck && srcPrevCheck[key], currentIndex, src);
			}
		}
	}

	return mergeDeepObjectProps(target, frame, srcNextCheck, srcPrevCheck, currentIndex, ...sources);
}

ipcMain.on('async', (event, arg) => {
  if(!initalized) {
    framerate = arg.framerate;
    width = arg.width;
    screenCapture = arg.screenCapture;

    mainWindow.setSize(arg.width, arg.height);
    mainWindow.webContents.setZoomFactor(arg.zoomFactor);
  // frame: false and mainWindow.setMenu(null) above to make sure size matches dims
    if(!DEV_MODE) mainWindow.setMenu(null);
    mainWindow.center();

    if(!!arg.useJpeg) useJpeg = true;
    framerate = arg.framerate;
    initalized = true;
    mainWindow.show();

    mainWindow.webContents.send('asynchronous-message', {initalized: true});
  }
  else
    frameData.push(arg);
});

app.on('window-all-closed', () => {
    if(!!frameData) {
  }

  var positionalArray = [];
  var frameDataArray = [];
  if(!!frameData) {
    if(screenCapture) {
      if(!!frameData) {
        frameData.forEach(data => {
          const {frame, url} = data;
          var base64data = url.split(';base64,')[1];
          saveFile("output\\image_"+frame+(useJpeg?".jpg":".png"), base64data, 'base64', (err) => {
            if(err) console.log("Err: " + err);
          });
          positionalArray.push({frame: data.frame, x: data.x, y: data.y, clicking: data.clicking});
        });
      }
      fs.writeFileSync("output\\positions.json", JSON.stringify(positionalArray), 'utf-8');
    }
    else {
      frameData.forEach(data => {
        // const {frame, url} = data;
        // var base64data = url.split(';base64,')[1];
        // saveFile("output\\image_"+frame+(useJpeg?".jpg":".png"), base64data, 'base64', (err) => {
        //   if(err) console.log("Err: " + err);
        // });
        frameDataArray.push({frame: data.frame, dataObj: data.dataObj, pointer: {x: data.x, y: data.y, clicking: data.clicking}});
      });
  
  //    var sceneData = {framerate: framerate, duration: frameDataArray.length/framerate, width: width, height: height, frameData: frameDataArray}
  //  fs.writeFileSync("output\\frame_data.json", JSON.stringify(sceneData), 'utf-8');
  //  var jsonStr = fs.readFileSync('../output/frame_data.json', 'utf8');
  
  //  var sceneData = JSON.parse(jsonStr);
  //    var framesArr = sceneData.frameData;
  
    // framerate, duration and all the transforms must be reserved words so do NOT use for MOVIECLIP naming
      var mergedSceneData = {duration: frameDataArray.length/framerate, framerate: framerate, width: width, height: height};
      mergedSceneData.frameData = frameDataArray.reduce((acc, cur, curInd, arr) => {
        return mergeDeepObjectProps(acc, cur.frame, !!arr[curInd+1] ? arr[curInd+1].dataObj : null, !!arr[curInd-1] ? arr[curInd-1].dataObj : null, curInd, cur.dataObj);
  //        return acc;
      }, {});
  
      mergedSceneData.pointer = {};
      mergedSceneData.pointer.position = [];
      mergedSceneData.pointer.clicking = [];
      frameDataArray.forEach(frameData => {
        var lastPosition = mergedSceneData.pointer.position[mergedSceneData.pointer.position.length-1];
        if(!lastPosition || lastPosition.value[0] != frameData.pointer.x || lastPosition.value[1] != frameData.pointer.y) mergedSceneData.pointer.position.push({frame: frameData.frame, value: [frameData.pointer.x, frameData.pointer.y]});
  
        var lastClicking = mergedSceneData.pointer.clicking[mergedSceneData.pointer.clicking.length-1];
        if(!lastClicking || lastClicking.value != frameData.pointer.clicking) mergedSceneData.pointer.clicking.push({frame: frameData.frame, value: frameData.pointer.clicking});
      });
  
      // obj is all object props merged into single
      // this represents the project hierarchy
      fs.writeFileSync("./mergedObjs.json", JSON.stringify(mergedSceneData, null, '\t'), 'utf-8');
    }
  }

  app.quit()
});

app.on('ready', function() {
  // frame: false and mainWindow.setMenu(null) above to make sure size matches dims
  mainWindow = new BrowserWindow({show: false, frame: DEV_MODE, backgroundColor:'#000000'});
  mainWindow.on('closed', () => app.quit());
  mainWindow.loadURL(url.format({
      pathname: path.join(__dirname, 'index.html'),
      protocol: 'file',
      slashes: true
    }));
	}
);
