from ultralytics import YOLO


class PoseDetector:
    def __init__(self):
        self.model = YOLO("yolov8n-pose.pt")

    def get_landmarks(self, frame):
        results = self.model(frame, imgsz=640, conf=0.3, verbose=False)

        # No detection
        if not results or len(results[0].keypoints.xy) == 0:
            print("⚠️ No keypoints detected")
            return None

        all_keypoints = results[0].keypoints.xy.cpu().numpy()

        # 🔥 Pick largest person (closest to camera)
        best_person = None
        max_width = 0

        for kp in all_keypoints:
            LS = kp[5]
            RS = kp[6]

            shoulder_width = abs(RS[0] - LS[0])

            if shoulder_width > max_width:
                max_width = shoulder_width
                best_person = kp

        if best_person is None:
            print("⚠️ No valid person found")
            return None

        LS = best_person[5]
        RS = best_person[6]
        LH = best_person[11]
        RH = best_person[12]

        print(f"✅ Using person with shoulder width: {max_width}")

        return {
            "left_shoulder": LS,
            "right_shoulder": RS,
            "left_hip": LH,
            "right_hip": RH,
        }