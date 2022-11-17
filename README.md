# gamecap.js
Michael Gochoco © 2020
This will create a fullboard which will output an image sequence a position.json file with mouse position data

To run it first make sure that all dependencies are install:

```
npm i
```

Copy FLA to folder
Then open up FLA in Animate
add gamecap.js to Include Scripts
add the following to first frame script:
```
gamecap.startCapture(stage);
```

File > Publish

Make sure html output is index.html (change this in main.js)

Then run the program:

```
npm start
```

Interact with the board!

When you are done simply close the window. Note, it is creating an image sequence 30 fps into the output folder. Therefore, I have put in a 60sec timeout to keep it from overflowing.
