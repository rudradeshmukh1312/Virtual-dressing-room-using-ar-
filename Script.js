const video = document.getElementById('video');
const shirtOverlay = document.getElementById('shirt-overlay');

navigator.mediaDevices.getUserMedia({ video: true })
  .then((stream) => {
    video.srcObject = stream;
  })
  .catch((err) => {
    console.error('Error accessing webcam:', err);
  });
