const videoElement = document.getElementById('input_video');
const canvasElement = document.querySelector('.output_canvas');
const canvasCtx = canvasElement.getContext('2d');
const overlayImg = document.getElementById('shirt');

function startCamera() {
  navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
    videoElement.srcObject = stream;
  });
}

const pose = new Pose({
  locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
});

pose.setOptions({
  modelComplexity: 1,
  smoothLandmarks: true,
  enableSegmentation: false,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5
});

pose.onResults((results) => {
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

  // Overlay image
  canvasCtx.drawImage(overlayImg, 150, 100, 200, 200);
});

const camera = new Camera(videoElement, {
  onFrame: async () => await pose.send({ image: videoElement }),
  width: 640,
  height: 480
});

startCamera();
camera.start();
