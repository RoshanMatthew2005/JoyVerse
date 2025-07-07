import torch  # PyTorch for model operations
import cv2  # OpenCV for image processing
import numpy as np  # NumPy for numerical operations
import mediapipe as mp  # MediaPipe for face mesh detection
import time  # For timestamps
from fastapi import FastAPI, UploadFile, File, HTTPException  # FastAPI for API creation
from fastapi.responses import JSONResponse  # For custom JSON responses
from fastapi.middleware.cors import CORSMiddleware  # CORS middleware
from model import VisionTransformerWithLandmarks, CLASS_NAMES, IMG_SIZE, device  # Import model and constants
from pymongo import MongoClient  # MongoDB client for database operations
from torchvision import transforms  # Image transformations for model input
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()  # Create FastAPI app instance

# Enable CORS for frontend-backend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # You can restrict this to ["http://localhost:3000"] for more security
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize MediaPipe Face Mesh
try:
    mp_face_mesh = mp.solutions.face_mesh  # Get face mesh solution from MediaPipe
    face_mesh = mp_face_mesh.FaceMesh(
        static_image_mode=True, 
        max_num_faces=1,
        refine_landmarks=False,
        min_detection_confidence=0.3,  # Lower confidence threshold
        min_tracking_confidence=0.3    # Lower tracking confidence
    )  # Initialize face mesh detector
    logger.info("✅ MediaPipe Face Mesh initialized successfully.")
except Exception as e:
    logger.error(f"❌ Error initializing MediaPipe Face Mesh: {e}")
    face_mesh = None

# MongoDB setup
try:
    client = MongoClient("mongodb://localhost:27017/joyverse", serverSelectionTimeoutMS=5000)
    client.server_info()
    db = client["joyverse"]  # Use the same database as the main backend
    collection = db["emotion_predictions"]  # Use (or create) 'emotion_predictions' collection
    logger.info("✅ Successfully connected to MongoDB.")
except Exception as e:
    logger.error(f"❌ Could not connect to MongoDB: {e}")
    db = None
    collection = None

# Model setup
try:
    model = VisionTransformerWithLandmarks().to(device)  # Instantiate the model and move to device (CPU/GPU)
    model.load_state_dict(torch.load("best_model_5class.pth", map_location=device))  # Load trained weights
    model.eval()  # Set model to evaluation mode
    logger.info("✅ Model loaded successfully.")
except FileNotFoundError:
    logger.error("❌ Error: The model file 'best_model_5class.pth' was not found.")
    model = None
except Exception as e:
    logger.error(f"❌ An unexpected error occurred while loading the model: {e}")
    model = None

def get_test_transforms():
    # Define image transformations for preprocessing before model inference
    return transforms.Compose([
        transforms.ToPILImage(),  # Convert NumPy array to PIL Image
        transforms.Resize((IMG_SIZE, IMG_SIZE)),  # Resize image to model input size
        transforms.ToTensor(),  # Convert PIL Image to PyTorch tensor
        transforms.Normalize([0.5, 0.5, 0.5], [0.5, 0.5, 0.5])  # Normalize tensor
    ])

transform = get_test_transforms()  # Initialize the transform pipeline

@app.post("/predict")  # Define POST endpoint for prediction
async def predict(file: UploadFile = File(...)):
    logger.info("Received request for /predict endpoint.")
    if not face_mesh:
        raise HTTPException(status_code=500, detail="MediaPipe Face Mesh is not initialized.")
    if not model:
        raise HTTPException(status_code=500, detail="Model is not loaded. Check server logs for errors.")

    # Read image file from the request
    contents = await file.read()
    np_arr = np.frombuffer(contents, np.uint8)  # Convert bytes to NumPy array
    frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)  # Decode image from array
    if frame is None:
        raise HTTPException(status_code=400, detail="Invalid image file.")  # Error if image is invalid

    # Save debug image to see what we're receiving
    debug_filename = f"debug_image_{int(time.time())}.jpg"
    cv2.imwrite(debug_filename, frame)
    logger.info(f"Debug image saved as {debug_filename}, dimensions: {frame.shape}")

    # Face mesh detection
    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)  # Convert BGR to RGB
    results = face_mesh.process(rgb_frame)  # Detect face landmarks
    
    if not results.multi_face_landmarks:
        logger.warning("No face detected with MediaPipe, trying with OpenCV fallback...")
        
        # Fallback: Try with OpenCV Haar Cascade face detection with multiple scales
        try:
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
            
            # Try multiple detection parameters for better results
            faces = face_cascade.detectMultiScale(gray, 1.1, 3, minSize=(30, 30))
            if len(faces) == 0:
                faces = face_cascade.detectMultiScale(gray, 1.05, 3, minSize=(20, 20))
            if len(faces) == 0:
                faces = face_cascade.detectMultiScale(gray, 1.3, 3, minSize=(40, 40))
            
            if len(faces) == 0:
                logger.warning("No face detected with OpenCV either. Image dimensions: {}x{}".format(frame.shape[1], frame.shape[0]))
                # Instead of failing, use a default emotion with low confidence
                logger.info("Using default 'neutral' emotion due to no face detection")
                return JSONResponse({
                    "emotion": "neutral",
                    "confidence": 0.1,
                    "probs": {
                        "anger": 0.1,
                        "disgust": 0.1,
                        "fear": 0.1,
                        "happiness": 0.1,
                        "sadness": 0.1,
                        "surprise": 0.1,
                        "neutral": 0.4
                    },
                    "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
                    "note": "Default emotion used - no face detected"
                })
            
            # If OpenCV detects a face, create dummy landmarks for the center of the detected face
            x, y, w, h = faces[0]  # Use the first detected face
            center_x = (x + w/2) / frame.shape[1]  # Normalize to 0-1
            center_y = (y + h/2) / frame.shape[0]  # Normalize to 0-1
            
            # Create simplified landmarks (just using face center repeated)
            landmarks = np.array([center_x, center_y] * 468, dtype=np.float32)  # 468 landmarks * 2 coordinates
            landmarks = torch.tensor(landmarks).unsqueeze(0).to(device)
            
            logger.info("Using OpenCV face detection with simplified landmarks at ({:.2f}, {:.2f})".format(center_x, center_y))
            
        except Exception as e:
            logger.error(f"OpenCV fallback failed: {e}")
            # Return default emotion instead of failing
            return JSONResponse({
                "emotion": "neutral",
                "confidence": 0.1,
                "probs": {
                    "anger": 0.1,
                    "disgust": 0.1,
                    "fear": 0.1,
                    "happiness": 0.1,
                    "sadness": 0.1,
                    "surprise": 0.1,
                    "neutral": 0.4
                },
                "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
                "note": "Default emotion used - face detection error"
            })
    else:
        # Get landmarks from the first detected face (MediaPipe)
        landmarks = []
        for landmark in results.multi_face_landmarks[0].landmark:
            landmarks.extend([landmark.x, landmark.y])  # Flatten x and y coordinates, ignoring z
        landmarks = np.array(landmarks, dtype=np.float32)  # Convert to NumPy array
        landmarks = torch.tensor(landmarks).unsqueeze(0).to(device)  # Convert to tensor and add batch dimension

    # Transform image for model input
    img = transform(frame).unsqueeze(0).to(device)  # Apply transforms and add batch dimension

    # Prediction
    with torch.no_grad():  # Disable gradient calculation for inference
        outputs = model(img, landmarks)  # Get model output
        probs = torch.softmax(outputs, dim=1).cpu().numpy()[0]  # Apply softmax to get probabilities
        pred_idx = np.argmax(probs)  # Get index of highest probability
        emotion = CLASS_NAMES[pred_idx]  # Get emotion label
        confidence = float(probs[pred_idx])  # Get confidence score

    # Prepare data for response and MongoDB
    probs_dict = {CLASS_NAMES[i]: float(probs[i]) for i in range(len(CLASS_NAMES))}
    data = {
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),  # Current timestamp
        "emotion": emotion,  # Predicted emotion
        "confidence": confidence,  # Confidence score
        "probs": probs_dict  # All class probabilities
    }

    # Store prediction in MongoDB
    if collection is not None:
        collection.insert_one(data)  # Insert prediction into MongoDB
    else:
        logger.warning("MongoDB not connected. Skipping database insertion.")

    logger.info(f"Prediction successful: {emotion} ({confidence:.2f})")
    # Return prediction as JSON response
    return {
        "emotion": emotion,
        "confidence": confidence,
        "probs": probs_dict
    }

@app.get("/test")
def test():
    return {"message": "Test successful"}

# Run the server
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)