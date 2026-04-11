import cv2
import numpy as np


class Overlay:
    def __init__(self):
        self.prev_w = None
        self.prev_h = None
        self.prev_x = None
        self.prev_y = None

    def apply(self, image, clothing_path, landmarks):
        clothing = cv2.imread(clothing_path, cv2.IMREAD_UNCHANGED)

        if clothing is None:
            print("⚠️ Clothing not found:", clothing_path)
            return image

        # Ensure alpha
        if clothing.shape[2] == 3:
            b, g, r = cv2.split(clothing)
            alpha = np.ones(b.shape, dtype=b.dtype) * 255
            clothing = cv2.merge((b, g, r, alpha))

        if not landmarks:
            print("⚠️ No person detected → skipping overlay")
            return image

        try:
            ls = landmarks["left_shoulder"]
            rs = landmarks["right_shoulder"]
            lh = landmarks["left_hip"]
            rh = landmarks["right_hip"]

            x1, y1 = int(ls[0]), int(ls[1])
            x2, y2 = int(rs[0]), int(rs[1])

            # ---- SIZE ----
            shoulder_width = abs(x2 - x1)

            if lh is not None and rh is not None:
                hip_y = int((lh[1] + rh[1]) / 2)
                shoulder_y = int((y1 + y2) / 2)
                torso_height = abs(hip_y - shoulder_y)
            else:
                torso_height = int(abs(y2 - y1) * 2.2)

            if shoulder_width <= 0 or torso_height <= 0:
                return image

            new_w = int(shoulder_width * 1.5)
            new_h = int(torso_height * 1.8)

            # ---- SMOOTH SIZE ----
            if self.prev_w is not None:
                new_w = int(0.7 * self.prev_w + 0.3 * new_w)
                new_h = int(0.7 * self.prev_h + 0.3 * new_h)

            self.prev_w = new_w
            self.prev_h = new_h

            clothing_resized = cv2.resize(clothing, (new_w, new_h))

            # ---- ROTATION ----
            angle = np.degrees(np.arctan2(y2 - y1, x2 - x1))

            # 🔥 FIX upside-down issue
            if angle > 90:
                angle -= 180
            elif angle < -90:
                angle += 180
            center = (new_w // 2, new_h // 2)

            M = cv2.getRotationMatrix2D(center, angle, 1.0)
            clothing_resized = cv2.warpAffine(
                clothing_resized,
                M,
                (new_w, new_h),
                flags=cv2.INTER_LINEAR,
                borderMode=cv2.BORDER_TRANSPARENT,
            )

            # ---- POSITION ----
            center_x = (x1 + x2) // 2
            neck_y = int((y1 + y2) / 2)

            x = int(center_x - new_w / 2)
            y = int(neck_y - new_h * 0.25)

            # ---- SMOOTH POSITION ----
            if self.prev_x is not None:
                x = int(0.7 * self.prev_x + 0.3 * x)
                y = int(0.7 * self.prev_y + 0.3 * y)

            self.prev_x = x
            self.prev_y = y

            print("Overlay pos:", x, y, "size:", new_w, new_h)

            return self._blend(image, clothing_resized, x, y)

        except Exception as e:
            print("🔥 Overlay error:", e)
            return image

    def _blend(self, image, overlay, x, y):
        h, w = overlay.shape[:2]
        img_h, img_w = image.shape[:2]

        # ---- CLIP ----
        if x < 0:
            overlay = overlay[:, -x:]
            w = overlay.shape[1]
            x = 0

        if y < 0:
            overlay = overlay[-y:, :]
            h = overlay.shape[0]
            y = 0

        if x + w > img_w:
            overlay = overlay[:, : img_w - x]
            w = overlay.shape[1]

        if y + h > img_h:
            overlay = overlay[: img_h - y, :]
            h = overlay.shape[0]

        if w <= 0 or h <= 0:
            return image

        # ---- BLEND ----
        if overlay.shape[2] == 4:
            alpha = overlay[:, :, 3] / 255.0

            for c in range(3):
                image[y : y + h, x : x + w, c] = (
                    alpha * overlay[:, :, c]
                    + (1 - alpha) * image[y : y + h, x : x + w, c]
                ).astype(np.uint8)
        else:
            image[y : y + h, x : x + w] = overlay

        return image
