// this was a node.js app's index.js before
// but renamed it for archiving

// this was source convertformat code for taking framedata from gamecapture and
// merging the frames into keyframe arrays that culled dupe keyframes and therefore smalled json file
// we have since refactored and merged this code into the main gamecap.js code and so
// this separate node.js app is no longer needed but I keep it here fore research purposes

// To replicate game capture from Adobe Animate gamecap project into an After Effects project:
// This task is used to take the JSON output from our gamecap.js file and merges so we can see ALL images needing to be replicated in an After Effects file.

// reads json file with array of object with a dataObj property.

// This takes that dataObj property of each item in array and merges into one, merging in properties that don't exist in the target and are objects themselves.

const fs = require('fs');
const path = require('path');

// if(!fs.existsSync("output\\"))
// 	fs.mkdirSync("output\\");

// var jsonStr = fs.readFileSync('../output/frame_data.json', 'utf8');

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

var jsonStr = fs.readFileSync('../output/frame_data.json', 'utf8');

var sceneData = JSON.parse(jsonStr);
var framesArr = sceneData.frameData;

// framerate, duration and all the transforms must be reserved words so do NOT use for MOVIECLIP naming
var mergedSceneData = {duration: sceneData.duration, framerate: sceneData.framerate, width: sceneData.width, height: sceneData.height};
mergedSceneData.frameData = framesArr.reduce((acc, cur, curInd, arr) => {
    mergeDeepObjectProps(acc, cur.frame, !!arr[curInd+1] ? arr[curInd+1].dataObj : null, !!arr[curInd-1] ? arr[curInd-1].dataObj : null, curInd, cur.dataObj);
    return acc;
}, {});

// obj is all object props merged into single
// this represents the project hierarchy
fs.writeFileSync("./mergedObjs.json", JSON.stringify(mergedSceneData, null, '\t'), 'utf-8');
