const {dialog, ipcMain} = require('electron');
var fs = require('fs');

﻿const electron = require('electron');
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

var positionalArray = [];
if(!fs.existsSync("output\\"))
	fs.mkdirSync("output\\");

ipcMain.on('async', (event, arg) => {
    if(arg.type == "tick")
      positionalArray.push({frame: arg.data.frame, x: arg.data.x, y: arg.data.y, clicking: arg.data.clicking});

	// It is possile inside main process, to send message from renderer process to itself or another renderer process
    // Reply on async message from renderer process
//    event.sender.send('async-reply', 2);
});


// Make method externaly visible
// exports.saveFile = arg => {
//   try {
//     var options = {
//       title: "Save file",
//       defaultPath : "my_filename",
//       buttonLabel : "Save",
//
//       filters :[
//         {name: 'txt', extensions: ['txt',]},
//         {name: 'All Files', extensions: ['*']}
//        ]
//     }
//
//     dialog.showSaveDialog( options, (filename) => {
//       fs.writeFileSync(filename, "hello world", 'utf-8');
//     })
//   }
//   catch(e) { alert('Failed to save the file !'); }
// }



app.on('window-all-closed', () => {
  fs.writeFileSync("output\\positions.json", JSON.stringify(positionalArray), 'utf-8');
  app.quit()
});

app.on('ready', function() {
		mainWindow = new BrowserWindow({width: 1080, height: 1080, backgroundColor:'#000000'});

//		mainWindow.on( "close", () => {mainWindow = null} );
		mainWindow.on('closed', () => app.quit());

		mainWindow.loadURL(url.format({
				pathname: path.join(__dirname, 'index.html'),
				protocol: 'file',
				slashes: true
			}));
	}
);
