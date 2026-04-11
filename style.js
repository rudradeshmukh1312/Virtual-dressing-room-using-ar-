const videoElement = document.getElementById('video');
const canvasElement = document.getElementById('output');
const canvasCtx = canvasElement.getContext('2d');
const statusText = document.getElementById('statusText');
const cameraPanel = document.getElementById('camera-panel');
const gallery = document.getElementById('gallery');
const changeShirtBtn = document.getElementById('changeShirtBtn');
const tryBtn = document.getElementById('tryBtn');

let selectedShirt = '';
let stream = null;
let animationFrameId = null;
const captureCanvas = document.createElement('canvas');
const captureCtx = captureCanvas.getContext('2d');

function updateStatus(message) {
  statusText.textContent = message;
}

function selectShirt(filename, imgElement) {
  selectedShirt = filename;
  document.querySelectorAll('.product-card img').forEach(img => img.classList.remove('selected'));
  imgElement.classList.add('selected');
  updateStatus('Shirt selected. Press Try On to start.');
}

async function startCamera() {
  if (!selectedShirt) {
    alert('Select a shirt first!');
    return;
  }

  gallery.style.display = 'none';
  tryBtn.style.display = 'none';
  cameraPanel.style.display = 'block';
  changeShirtBtn.style.display = 'inline-block';
  updateStatus('Starting camera...');

  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
    videoElement.srcObject = stream;
    await videoElement.play();
    updateStatus('Camera started. Sending frames to backend...');
    processFrames();
  } catch (error) {
    console.error('Camera failed:', error);
    updateStatus('Could not start camera. Allow permissions and try again.');
  }
}

function openGallery() {
  stopCamera();
  gallery.style.display = 'flex';
  tryBtn.style.display = 'inline-block';
  cameraPanel.style.display = 'none';
  changeShirtBtn.style.display = 'none';
  updateStatus('Select a shirt and press Try On.');
}

function stopCamera() {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
    stream = null;
  }
  videoElement.srcObject = null;
}

function takeSnapshot() {
  if (!canvasElement.width || !canvasElement.height) {
    alert('No image available yet.');
    return;
  }
  const link = document.createElement('a');
  link.href = canvasElement.toDataURL('image/png');
  link.download = 'virtual_tryon.png';
  link.click();
}

const BACKEND_URL = 'http://localhost:5000';

async function processFrames() {
  if (!stream || videoElement.readyState < 2) {
    animationFrameId = requestAnimationFrame(processFrames);
    return;
  }

  captureCanvas.width = videoElement.videoWidth;
  captureCanvas.height = videoElement.videoHeight;
  captureCtx.drawImage(videoElement, 0, 0, captureCanvas.width, captureCanvas.height);
  const frameData = captureCanvas.toDataURL('image/jpeg', 0.8);

  try {
    const response = await fetch(`${BACKEND_URL}/process_frame`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ frame: frameData, shirt: selectedShirt }),
    });

    const data = await response.json();
    if (data.processed_frame) {
      const img = new Image();
      img.onload = () => {
        canvasElement.width = img.width;
        canvasElement.height = img.height;
        canvasCtx.drawImage(img, 0, 0);
      };
      img.src = data.processed_frame;
      updateStatus('Live try-on active.');
    } else {
      console.error('Backend error:', data.error);
      updateStatus('Processing error. Check console for details.');
    }
  } catch (error) {
    console.error('Frame processing failed:', error);
    updateStatus(`Connection error. Backend may be offline. ${error.message || error}`);
  }

  animationFrameId = requestAnimationFrame(processFrames);
}
