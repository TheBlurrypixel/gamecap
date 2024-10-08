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

for full screen capture use screencap.js instead<br/>

For example:
```
// function startCapture(stage[, {useJpeg = false, zoomFactor = 1, skipFrame = 0, width = 540, height = 960, maxFrames = 3600}])
if(gamecap && gamecap.startCapture) gamecap.startCapture(stage, this, {zoomFactor: 0.5});

// for screen capture instead
if(screencap && screencap.startCapture) screencap.startCapture(stage, {zoomFactor: 0.5});
```

File > Publish

Make sure html output is index.html (change this in main.js)

Then run the program:

```
npm start
```

Interact with the board!

When you are done simply close the window. Note, it is creating an image sequence 30 fps into the output folder. Therefore, I have put in a 60sec timeout to keep it from overflowing.

NOTE: Adobe Animate with components and jQuery not working in electron app
problem is with this code in jQuery

```
if ( typeof module === "object" && typeof module.exports === "object" ) {
  // set jQuery in `module`
} else {
  // set jQuery in `window`
}
```

Solution is to add the following code after the jQuery code

```
window.$ = window.jQuery = module.exports;
```

or change 

```
if ( typeof module === "object" && typeof module.exports === "object" ) {
```
to
```
if (typeof module === "object" && module.exports) {
```

this is because in electorn typeof module.exports returns "function" and NOT "object"!

If you are using naru you can use the following regex and substitution callback

regex
```
/(\/\*\!\sjQuery.*$)([\r\n]*.*)/gm
```

substitution callback
```
(match) => { return match + "\nif(typeof module == \"object\" && module.exports) window.$ = window.jQuery = module.exports;"; }
```
