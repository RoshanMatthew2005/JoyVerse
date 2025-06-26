import cv2                                         # Import OpenCV for video capture and image processing
import torch                                       # Import PyTorch for model inference
import numpy as np                                 # Import NumPy for numerical operations
from torchvision import transforms                 # Import torchvision transforms for preprocessing
from model import VisionTransformerWithLandmarks, CLASS_NAMES, IMG_SIZE, device  # Import model and constants
from pymongo import MongoClient                    # Import MongoClient to connect to MongoDB
import time                                        # Import time for timestamps and timing
from collections import Counter                    # Import Counter for counting emotions
import mediapipe as mp                             # Import MediaPipe for face mesh detection

# Initialize MediaPipe Face Mesh and drawing utilities
mp_face_mesh = mp.solutions.face_mesh              # Reference to the face mesh module
mp_drawing = mp.solutions.drawing_utils            # Drawing utilities for landmarks
mp_drawing_styles = mp.solutions.drawing_styles    # Drawing styles for face mesh

face_mesh = mp_face_mesh.FaceMesh(static_image_mode=False, max_num_faces=1)  # Initialize face mesh detector

# Define image transforms for preprocessing
def get_test_transforms():
    return transforms.Compose([
        transforms.ToPILImage(),                   # Convert NumPy array to PIL Image
        transforms.Resize((IMG_SIZE, IMG_SIZE)),   # Resize image to model input size
        transforms.ToTensor(),                     # Convert PIL Image to tensor
        transforms.Normalize([0.5, 0.5, 0.5], [0.5, 0.5, 0.5])  # Normalize tensor
    ])

# Connect to MongoDB
client = MongoClient("mongodb://localhost:27017/") # Create MongoDB client
db = client["emotion_db"]                          # Access 'emotion_db' database
collection = db["emotion_predictions"]             # Access 'emotion_predictions' collection

# Load the trained model
model = VisionTransformerWithLandmarks().to(device)    # Instantiate model and move to device
model.load_state_dict(torch.load("best_model_5class.pth", map_location=device))  # Load weights
model.eval()                                           # Set model to evaluation mode

transform = get_test_transforms()                  # Get image transforms
cap = cv2.VideoCapture(0)                         # Open webcam for video capture

emotion_counter = Counter()                        # Counter to keep track of detected emotions
last_store_time = time.time()                      # Track last time data was stored in DB

print("📸 Starting emotion detection with face mesh...")  # Notify user that detection has started

try:
    while True:                                   # Main loop for real-time detection
        ret, frame = cap.read()                   # Read frame from webcam
        if not ret:                               # If frame not captured
            print("❌ Failed to grab frame")       # Print error message
            break                                 # Exit loop

        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)  # Convert frame to RGB for MediaPipe
        results = face_mesh.process(rgb_frame)              # Detect face landmarks

        # Default landmark array if no face detected
        landmarks_np = np.zeros((468, 2), dtype=np.float32) # Initialize landmarks to zeros

        if results.multi_face_landmarks:                    # If face landmarks detected
            face_landmarks = results.multi_face_landmarks[0]    # Get first detected face
            h, w, _ = rgb_frame.shape                        # Get image dimensions
            landmarks_np = np.array([[lm.x * w, lm.y * h] for lm in face_landmarks.landmark], dtype=np.float32)  # Convert normalized landmarks to pixel coordinates

            # Draw face mesh on frame
            mp_drawing.draw_landmarks(
                image=frame,
                landmark_list=face_landmarks,
                connections=mp_face_mesh.FACEMESH_TESSELATION,
                landmark_drawing_spec=None,
                connection_drawing_spec=mp_drawing_styles
                    .get_default_face_mesh_tesselation_style()
            )

            # Draw bounding box around face
            x_coords = landmarks_np[:, 0]                 # X coordinates of landmarks
            y_coords = landmarks_np[:, 1]                 # Y coordinates of landmarks
            x_min = int(np.min(x_coords))                 # Minimum X (left)
            y_min = int(np.min(y_coords))                 # Minimum Y (top)
            x_max = int(np.max(x_coords))                 # Maximum X (right)
            y_max = int(np.max(y_coords))                 # Maximum Y (bottom)
            cv2.rectangle(frame, (x_min, y_min), (x_max, y_max), (0, 255, 255), 2)  # Draw rectangle

        # Normalize landmarks for model input
        landmarks_norm = landmarks_np.flatten() / max(frame.shape[0], frame.shape[1])  # Flatten and normalize
        landmarks_tensor = torch.tensor(landmarks_norm, dtype=torch.float32).unsqueeze(0).to(device)  # Convert to tensor

        transformed = transform(rgb_frame).unsqueeze(0).to(device)  # Transform image and add batch dimension

        with torch.no_grad():                           # Disable gradient calculation for inference
            output = model(transformed, landmarks_tensor)   # Get model output
            probs = torch.softmax(output, dim=1)[0].cpu().numpy()  # Apply softmax to get probabilities
            pred_idx = np.argmax(probs)                  # Get index of highest probability
            pred_label = CLASS_NAMES[pred_idx]           # Get emotion label
            confidence = probs[pred_idx]                 # Get confidence score

        emotion_counter[pred_label] += 1                 # Update emotion counter

        cv2.putText(frame, f"{pred_label} ({confidence:.2f})", (10, 30),  # Overlay prediction on frame
                    cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)

        cv2.imshow("Emotion Detection", frame)           # Show frame in window

        current_time = time.time()                       # Get current time
        if current_time - last_store_time >= 10:         # If 10 seconds have passed since last DB store
            data = {
                "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),  # Current timestamp
                "emotion": pred_label,                            # Predicted emotion
                "confidence": float(confidence),                  # Confidence score
                "probs": {CLASS_NAMES[i]: float(probs[i]) for i in range(len(CLASS_NAMES))}  # All probabilities
            }
            collection.insert_one(data)                  # Insert data into MongoDB
            print(f"✅ Stored to DB: {data}")             # Print confirmation
            last_store_time = current_time               # Update last store time

        if cv2.waitKey(1) & 0xFF == ord('q'):            # If 'q' is pressed, exit loop
            break

finally:
    cap.release()                                        # Release webcam
    cv2.destroyAllWindows()                              # Close OpenCV windows
    face_mesh.close()                                    # Release MediaPipe resources
    print("👋 Webcam and resources released.")            # Print
