# 🪞 Virtual Dressing Room Using AR

A real-time web-based augmented reality clothing try-on application built with Python, OpenCV, and MediaPipe. The application captures webcam video feed, tracks body pose landmarks in real time, and overlays selected clothing items seamlessly onto the user.

---

## ✨ Features

- **Live Video Pose Estimation:** Tracks key torso and shoulder landmarks with MediaPipe.
- **Dynamic Garment Overlay:** Automatically scales, rotates, and aligns shirt textures to match body orientation.
- **Interactive UI:** Select multiple apparel items directly from the gallery.
- **Snapshot Capture:** Allows users to capture and save preview frames.

---

## 🛠️ Tech Stack

- **Backend:** Python, Flask
- **Computer Vision:** OpenCV, MediaPipe
- **Frontend:** Vanilla JavaScript, HTML5 Canvas, CSS3

---

## 🚀 Getting Started
### 1. Clone the repository
```bash
git clone https://github.com/rudradeshmukh1312/Virtual-dressing-room-using-ar-.git
cd Virtual-dressing-room-using-ar-
```
### 2. Set up a virtual environment
```bash
python -m venv venv
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate
```
### 3.install dependencies
```bash
pip install -r requirements.txt
```
### 4.Run the application
```bash
python app.py
```
Open your browser and navigate to `http://localhost:5000`.
