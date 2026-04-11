from flask import Flask, request, jsonify, send_from_directory
import os
import cv2
import numpy as np
import base64

from pose_detector import PoseDetector
from overlay import Overlay

app = Flask(__name__)
pose_detector = PoseDetector()
overlay = Overlay()

ROOT_DIR = os.path.dirname(os.path.abspath(__file__))


# CORS
@app.after_request
def after_request(response):
    response.headers.add("Access-Control-Allow-Origin", "*")
    response.headers.add("Access-Control-Allow-Headers", "Content-Type")
    response.headers.add("Access-Control-Allow-Methods", "GET,POST")
    return response


@app.route("/status")
def status():
    return jsonify({"status": "ok"})


@app.route("/process_frame", methods=["POST"])
def process_frame():
    print("🚀 API HIT")
    try:
        data = request.json
        frame_data = data.get("frame")
        shirt = data.get("shirt", "shirt1.png")

        if not frame_data:
            return jsonify({"error": "No frame received"})

        # decode image
        image_data = frame_data.split(",")[1]
        image_bytes = base64.b64decode(image_data)
        np_arr = np.frombuffer(image_bytes, np.uint8)
        frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
        if frame is None:
            return jsonify({"error": "Frame decode failed"})

        # pose detection
        landmarks = pose_detector.get_landmarks(frame)

        # shirt path (support multiple shirts)
        clothing_path = os.path.join(ROOT_DIR, shirt)
        if not os.path.isfile(clothing_path):
            print("⚠️ Shirt file missing, fallback to shirt1.png")
            clothing_path = os.path.join(ROOT_DIR, "shirt1.png")

        # overlay
        frame = overlay.apply(frame, clothing_path, landmarks)

        # encode back
        _, buffer = cv2.imencode(".jpg", frame)
        output = base64.b64encode(buffer).decode("utf-8")
        return jsonify({"processed_frame": f"data:image/jpeg;base64,{output}"})

    except Exception as e:
        print("🔥 ERROR:", e)
        return jsonify({"error": str(e)})


@app.route("/<path:path>")
def serve_files(path):
    return send_from_directory(ROOT_DIR, path)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
