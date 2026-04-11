# Virtual Dressing Room using AR

This project is a connected frontend/backend virtual try-on system.
It lets users open a webpage, turn on their camera, and see clothing overlaid onto their body in real time.
The core of the system is a Flask backend that receives webcam frames, detects body landmarks with MediaPipe, and returns processed frames with a shirt overlay.

## How It Works

- Frontend: `index.html`, `script.css`, `style.js`
  - Shows the product gallery and camera view
  - Captures frames from the webcam
  - Sends frames to the backend API
  - Displays the returned processed frame on a canvas

- Backend: `backend/main.py`
  - Receives frames at `/process_frame`
  - Uses `backend/pose_detector.py` to detect pose landmarks
  - Uses `backend/overlay.py` to overlay the selected shirt image
  - Returns the processed frame as a base64 JPEG

## Project Structure

- `index.html` — frontend page layout
- `script.css` — frontend styling
- `style.js` — frontend camera handling and backend communication
- `shirt1.png`, `shirt2.png`, `shirt3.png` — shirt images
- `backend/main.py` — Flask backend server
- `backend/pose_detector.py` — MediaPipe pose detection module
- `backend/overlay.py` — image overlay module
- `requirements.txt` — Python dependencies

## Setup Instructions

1. Install the Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
2. Start the backend server from the `backend` folder:
   ```bash
   python backend/main.py
   ```
3. Open your browser and go to:
   ```text
   http://localhost:5000
   ```

## Notes

- Do not open `index.html` directly from the file system.
- The app must run through the Flask backend so `/process_frame` can receive and process webcam frames.
- If the shirt is not appearing, make sure the backend server is running and the browser console has no network errors.

## Features

- Live webcam frame capture
- Backend pose detection with MediaPipe
- Dynamic shirt overlay using OpenCV
- Screenshot download
- Easy to extend with more clothes or improved overlay logic
</content>
<parameter name="filePath">c:\Users\RUDRA\OneDrive\Documents\GitHub\Virtual-dressing-room-using-ar-\README.md