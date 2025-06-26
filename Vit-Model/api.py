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
    face_mesh = mp_face_mesh.FaceMesh(static_image_mode=True, max_num_faces=1)  # Initialize face mesh detector
    logger.info("✅ MediaPipe Face Mesh initialized successfully.")
except Exception as e:
    logger.error(f"❌ Error initializing MediaPipe Face Mesh: {e}")
    face_mesh = None

# MongoDB setup
try:
    client = MongoClient("mongodb+srv://joyadmin:joy123@joyverse.wh2ssu9.mongodb.net/joyverse?retryWrites=true&w=majority&appName=JoyVerse", serverSelectionTimeoutMS=5000)
    client.server_info()
    db = client["joyverse"]  # Use the same database as the main backend
    collection = db["emotion_predictions"]  # Use (or create) 'emotion_predictions' collection
    logger.info("✅ Successfully connected to MongoDB Atlas.")
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

    # Face mesh detection
    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)  # Convert BGR to RGB
    results = face_mesh.process(rgb_frame)  # Detect face landmarks
    if not results.multi_face_landmarks:
        logger.warning("No face detected in the uploaded image.")
        return JSONResponse({"error": "No face detected."}, status_code=400)  # Changed to 400 for client error

    # Get landmarks from the first detected face
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

    # Store prediction in MongoDB
    if collection is not None:
        data = {
            "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),  # Current timestamp
            "emotion": emotion,  # Predicted emotion
            "confidence": confidence,  # Confidence score
            "probs": {CLASS_NAMES[i]: float(probs[i]) for i in range(len(CLASS_NAMES))}  # All class probabilities
        }
        collection.insert_one(data)  # Insert prediction into MongoDB
    else:
        logger.warning("MongoDB not connected. Skipping database insertion.")

    logger.info(f"Prediction successful: {emotion} ({confidence:.2f})")
    # Return prediction as JSON response
    return {
        "emotion": emotion,
        "confidence": confidence,
        "probs": data["probs"]
    }

@app.get("/test")
def test():
    return {"message": "Test successful"}