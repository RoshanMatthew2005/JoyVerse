from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import io, torch, cv2
import torchvision.transforms as transforms
import numpy as np
from datetime import datetime
from pymongo import MongoClient
import mediapipe as mp

from vit_model import ViTEmotionModel

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"],
)

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = ViTEmotionModel().to(device)
model.load_state_dict(torch.load("models/best_model_5class.pth", map_location=device))
model.eval()

CLASS_NAMES = ['anger', 'happiness', 'neutral', 'sadness', 'surprise']
IMG_SIZE = 128
LANDMARK_FEATURES = 468 * 2

# DB setup
client = MongoClient("mongodb+srv://joyadmin:joy123@joyverse.wh2ssu9.mongodb.net/joyverse?retryWrites=true&w=majority&appName=JoyVerse")
db = client["emotion_db"]
collection = db["emotion_predictions"]

# Face mesh
mp_face_mesh = mp.solutions.face_mesh
face_mesh = mp_face_mesh.FaceMesh(static_image_mode=True, max_num_faces=1)

# Preprocessing
transform = transforms.Compose([
    transforms.Resize((IMG_SIZE, IMG_SIZE)),
    transforms.ToTensor(),
    transforms.Normalize([0.5, 0.5, 0.5], [0.5, 0.5, 0.5])
])

def extract_landmarks(image_tensor):
    image_np = image_tensor.permute(1, 2, 0).cpu().numpy()
    image_np = ((image_np * 0.5 + 0.5) * 255).astype(np.uint8)
    results = face_mesh.process(cv2.cvtColor(image_np, cv2.COLOR_RGB2BGR))

    landmarks = []
    if results.multi_face_landmarks:
        for lm in results.multi_face_landmarks[0].landmark:
            landmarks.extend([round(lm.x, 6), round(lm.y, 6)])
    else:
        landmarks = [0.0] * LANDMARK_FEATURES
    return torch.tensor(landmarks, dtype=torch.float32), landmarks

@app.post("/predict/")
async def predict(file: UploadFile = File(...)):
    contents = await file.read()
    image = Image.open(io.BytesIO(contents)).convert("RGB")
    image_tensor = transform(image).unsqueeze(0).to(device)

    landmarks_tensor, landmarks_list = extract_landmarks(image_tensor.squeeze(0))
    landmarks_tensor = landmarks_tensor.unsqueeze(0).to(device)

    with torch.no_grad():
        outputs = model(image_tensor, landmarks_tensor)
        probs = torch.softmax(outputs, dim=1)[0]
        predicted_class = torch.argmax(probs).item()

    pred_label = CLASS_NAMES[predicted_class]
    confidence = round(probs[predicted_class].item() * 100, 2)
    prob_dict = {CLASS_NAMES[i]: round(p.item() * 100, 2) for i, p in enumerate(probs)}

    # Save to MongoDB
    record = {
        "timestamp": datetime.now().isoformat(),
        "emotion": pred_label,
        "confidence": confidence,
        "landmarks": landmarks_list,
        "probs": prob_dict
    }
    collection.insert_one(record)

    return {
        "prediction": pred_label,
        "confidence": confidence,
        "probabilities": prob_dict,
        "landmarks": landmarks_list  # You will see this in Thunder Client
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
