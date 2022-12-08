const {dialog, ipcMain} = require('electron');
var fs = require('fs');

const electron = require('electron');
const app = electron.app;

const path = require('path');
const url = require('url');


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

var frameData = [];

var useJpeg = false;
var initalized = false;

const DEV_MODE = false;

ipcMain.on('async', (event, arg) => {
  if(!initalized) {
    mainWindow.setSize(arg.width, arg.height);
    mainWindow.webContents.setZoomFactor(arg.zoomFactor);
  // frame: false and mainWindow.setMenu(null) above to make sure size matches dims
    if(!DEV_MODE) mainWindow.setMenu(null);
    mainWindow.center();

    if(!!arg.useJpeg) useJpeg = true;
    initalized = true;
    mainWindow.show();

    mainWindow.webContents.send('asynchronous-message', {initalized: true});
  }
  else
    frameData.push(arg);
});

app.on('window-all-closed', () => {
  var positionalArray = [];
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

  app.quit()
});

const ASPECT = "landscape";

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
