let currentShirt = null;
let shirtImg = new Image();

const videoElement = document.getElementById('video');
const canvasElement = document.getElementById('output');
const canvasCtx = canvasElement.getContext('2d');

function setShirt(src) {
  if (src) {
    shirtImg.src = 'images/' + src;
    currentShirt = shirtImg;
  } else {
    currentShirt = null;
  }
}

const pose = new Pose.Pose({
  locateFile: (file) => https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file},
});
pose.setOptions({
  modelComplexity: 1,
  smoothLandmarks: true,
  enableSegmentation: false,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5,
});
pose.onResults(onResults);

const camera = new Camera.Camera(videoElement, {
  onFrame: async () => {
    await pose.send({ image: videoElement });
  },
  width: 640,
  height: 480
});
camera.start();

function onResults(results) {
  canvasElement.width = videoElement.videoWidth;
  canvasElement.height = videoElement.videoHeight;

  canvasCtx.save();
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

  if (currentShirt && results.poseLandmarks) {
    const leftShoulder = results.poseLandmarks[11];
    const rightShoulder = results.poseLandmarks[12];

    const x = (leftShoulder.x + rightShoulder.x) / 2 * canvasElement.width;
    const y = (leftShoulder.y + rightShoulder.y) / 2 * canvasElement.height;

    const shirtWidth = Math.abs(rightShoulder.x - leftShoulder.x) * canvasElement.width * 1.8;
    const shirtHeight = shirtWidth * 1.2;

   // Calculate rotation angle based on shoulder slope
const shoulderAngle = Math.atan2(rightShoulder.y - leftShoulder.y, rightShoulder.x - leftShoulder.x);

// Move the shirt a bit below shoulders (optional)
const adjustedY = y + shirtWidth * 0.3;

// Rotate & draw shirt aligned with shoulders
canvasCtx.translate(x, adjustedY);
canvasCtx.rotate(shoulderAngle);
canvasCtx.drawImage(currentShirt, -shirtWidth / 2, 0, shirtWidth, shirtHeight);
canvasCtx.rotate(-shoulderAngle);
canvasCtx.translate(-x, -adjustedY);
  }

  canvasCtx.restore();
}
