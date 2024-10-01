# gamecap.js
Michael Gochoco © 2020
This will create a fullboard which will output an image sequence a position.json file with mouse position data

To run it first make sure that all dependencies are install:

```
npm i
```

Copy FLA to folder <br/>
Then open up FLA in Animate <br/>
add gamecap.js to Include Scripts <br/>
add the gamecap.startCapture code to the first frame script

For example:
```
// function startCapture(stage[, {useJpeg = false, zoomFactor = 1, skipFrame = 0, width = 540, height = 960, maxFrames = 3600}])
if(gamecap && gamecap.startCapture) gamecap.startCapture(stage, this, {zoomFactor: 0.5});
```

File > Publish

Make sure html output is index.html (change this in main.js)

Then run the program:

```
npm start
```

Interact with the board!

When you are done simply close the window. Note, it is creating an image sequence 30 fps into the output folder. Therefore, I have put in a 60sec timeout to keep it from overflowing.
