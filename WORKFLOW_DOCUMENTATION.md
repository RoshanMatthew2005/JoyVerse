# JoyVerse System Workflow Documentation

## 🔄 Complete System Workflow

### 1. System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    JoyVerse System Architecture                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│  │   Frontend  │    │   Backend   │    │  Database   │         │
│  │   (React)   │◄──►│  (FastAPI)  │◄──►│  (MongoDB)  │         │
│  │  Port 5174  │    │  Port 8001  │    │ Port 27017  │         │
│  └─────────────┘    └─────────────┘    └─────────────┘         │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┤
│  │              AI/ML Components                               │
│  │                                                             │
│  │  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐     │
│  │  │   Vision    │    │  Emotion    │    │  Landmark   │     │
│  │  │Transformer  │    │   Model     │    │ Detection   │     │
│  │  │   (ViT)     │    │ (5-class)   │    │ (MediaPipe) │     │
│  │  └─────────────┘    └─────────────┘    └─────────────┘     │
│  └─────────────────────────────────────────────────────────────┤
└─────────────────────────────────────────────────────────────────┘
```

## 🚀 Startup Workflow

### Step 1: Database Initialization
```bash
mongod  # Start MongoDB daemon
```
**What happens:**
- MongoDB server starts on port 27017
- Creates `emotion_db` database if it doesn't exist
- Prepares `emotion_predictions` collection for storing results

### Step 2: Backend Initialization
```bash
cd Vit-Model/backend
python main.py
```
**What happens:**
1. **Model Loading:**
   - Loads Vision Transformer (ViT) model from `models/best_model_5class.pth`
   - Initializes MediaPipe face mesh for facial landmark detection
   - Sets up CUDA/CPU device for inference

2. **API Server Setup:**
   - Creates FastAPI application instance
   - Configures CORS middleware for cross-origin requests
   - Sets up `/predict/` endpoint for emotion recognition
   - Starts Uvicorn server on port 8001

3. **Database Connection:**
   - Connects to MongoDB at `mongodb://localhost:27017/`
   - Initializes collections for storing emotion data

### Step 3: Frontend Initialization
```bash
cd FrontEnd/joyverse-app
npm run dev
```
**What happens:**
1. **Vite Development Server:**
   - Starts React development server on port 5174
   - Enables hot module replacement (HMR)
   - Compiles and serves React components

2. **Service Layer Setup:**
   - Initializes API services (`authAPI.js`, `emotionAPI.js`, `gameScoreAPI.js`)
   - Sets up React Router for navigation
   - Configures authentication context

## 🎮 User Interaction Workflow

### 1. User Registration & Authentication

```
User visits http://localhost:5174
         ↓
┌─────────────────────────────────────────────────────────────────┐
│                    Welcome Page                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │   Sign Up   │  │   Log In    │  │ Super Admin │              │
│  │             │  │             │  │             │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
└─────────────────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────────────────┐
│                   User Type Selection                           │
│  ┌─────────────┐                    ┌─────────────┐              │
│  │   Child     │                    │  Therapist  │              │
│  │  Account    │                    │   Account   │              │
│  └─────────────┘                    └─────────────┘              │
└─────────────────────────────────────────────────────────────────┘
```

**Authentication Flow:**
1. User selects account type (Child/Therapist)
2. Fills registration form
3. Data sent to backend via `authAPI.js`
4. Backend validates and stores user data
5. JWT token issued for session management
6. User redirected to appropriate dashboard

### 2. Child User Workflow

```
Child Dashboard (http://localhost:5174/child-dashboard)
         ↓
┌─────────────────────────────────────────────────────────────────┐
│                    Available Games                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │ Space Math  │  │   Pac-Man   │  │ Art Studio  │              │
│  │    Game     │  │    Game     │  │             │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐                              │
│  │ Music Fun   │  │ Missing     │                              │
│  │             │  │ Letter Pop  │                              │
│  └─────────────┘  └─────────────┘                              │
└─────────────────────────────────────────────────────────────────┘
```

**Game Play Workflow:**
1. Child selects a game
2. Game component loads (e.g., `SpaceMathGame.jsx`)
3. Game initializes with difficulty settings
4. Child plays game with real-time feedback
5. Scores and progress tracked via `gameScoreAPI.js`
6. [Optional] Emotion detection during gameplay
7. Results stored in database for therapist analysis

### 3. Therapist User Workflow

```
Therapist Dashboard (http://localhost:5174/therapist-dashboard)
         ↓
┌─────────────────────────────────────────────────────────────────┐
│                  Child Progress Overview                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │  Child A    │  │  Child B    │  │  Child C    │              │
│  │ Progress    │  │ Progress    │  │ Progress    │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┤
│  │              Analytics Dashboard                            │
│  │  • Emotion trends over time                                │
│  │  • Game performance metrics                                │
│  │  • Learning progress indicators                            │
│  │  • Behavioral insights                                     │
│  └─────────────────────────────────────────────────────────────┤
└─────────────────────────────────────────────────────────────────┘
```

**Analytics Workflow:**
1. Therapist selects child from dashboard
2. System queries MongoDB for child's data
3. Charts and graphs rendered using Recharts
4. Emotional data visualization
5. Therapist can add comments and observations
6. Generate reports for parents/caregivers

## 🤖 AI/ML Emotion Recognition Workflow

### 1. Input Requirements for Games

**What Games Should Send:**
- **Image Only** - Games send camera-captured images (JPG/PNG format)
- **No Manual Landmarks** - The backend automatically extracts facial landmarks
- **File Upload Format** - Multipart form data with 'file' field

```javascript
// Example: How games should call the emotion API
const formData = new FormData();
formData.append('file', imageBlob); // Just the image file

const response = await fetch('http://localhost:8001/predict/', {
  method: 'POST',
  body: formData // Only the image, no landmarks needed
});
```

### 2. Backend Processing Pipeline

```
Image Input → Preprocessing → Feature Extraction → Prediction → Storage
     ↓              ↓               ↓              ↓          ↓
┌─────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────┐  ┌─────────┐
│ Webcam  │  │   Resize    │  │ Facial      │  │   ViT   │  │MongoDB  │
│ Image   │  │ Normalize   │  │ Landmarks   │  │ Model   │  │Storage  │
│ Upload  │  │ Transform   │  │ MediaPipe   │  │ Infer   │  │         │
└─────────┘  └─────────────┘  └─────────────┘  └─────────┘  └─────────┘
```

**Key Points:**
- **Games**: Send images only (128x128 recommended but API handles resizing)
- **Backend**: Automatically extracts 468 facial landmarks using MediaPipe
- **Model**: Uses both image features (ViT) + facial landmarks for prediction

### 3. Detailed Emotion Detection Process

**API Endpoint:** `POST /predict/`

**Input:** Single image file (multipart/form-data)

```python
# Step 1: Image Reception (Backend automatically handles this)
file = await file.read()  # Receives image from game
image = Image.open(io.BytesIO(contents)).convert("RGB")

# Step 2: Image Preprocessing (Automatic)
transform = transforms.Compose([
    transforms.Resize((128, 128)),        # Resize to model input size
    transforms.ToTensor(),                # Convert to tensor
    transforms.Normalize([0.5, 0.5, 0.5], [0.5, 0.5, 0.5])  # Normalize
])
image_tensor = transform(image).unsqueeze(0)

# Step 3: Facial Landmark Detection (Automatic - MediaPipe)
mp_face_mesh = mp.solutions.face_mesh
landmarks_tensor, landmarks_list = extract_landmarks(image_tensor)
# Extracts 468 facial landmark points (x, y coordinates)

# Step 4: Model Inference (Both image + landmarks)
with torch.no_grad():
    outputs = model(image_tensor, landmarks_tensor)  # Dual input model
    probabilities = torch.softmax(outputs, dim=1)
    predicted_class = torch.argmax(probabilities)

# Step 5: Result Processing
emotion_classes = ['anger', 'happiness', 'neutral', 'sadness', 'surprise']
prediction = emotion_classes[predicted_class.item()]
confidence = probabilities[0][predicted_class].item() * 100

# Step 6: Database Storage
record = {
    "timestamp": datetime.now().isoformat(),
    "emotion": prediction,
    "confidence": confidence,
    "landmarks": landmarks_list,       # 936 values (468 points × 2 coordinates)
    "probabilities": prob_dict
}
collection.insert_one(record)
```

**Model Architecture:**
- **Vision Transformer (ViT)**: Processes 128×128 image patches
- **Landmark Network**: Processes 936 landmark features (468 points × 2)
- **Fusion Layer**: Combines image features + landmark features
- **Output**: 5-class emotion classification

## 🔄 Data Flow Architecture

### 1. Frontend to Backend Communication

```
React Component → API Service → HTTP Request → FastAPI Backend
     ↓                ↓             ↓              ↓
┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│ Game.jsx    │  │emotionAPI.js│  │   Axios     │  │   main.py   │
│ Component   │  │Service      │  │   Request   │  │   Endpoint  │
└─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘
```

**Example API Call:**
```javascript
// In emotionAPI.js
export const predictEmotion = async (imageFile) => {
  const formData = new FormData();
  formData.append('file', imageFile);
  
  const response = await fetch('http://localhost:8001/predict/', {
    method: 'POST',
    body: formData
  });
  
  const data = await response.json();
  
  // Transform API response to match frontend expectations
  return {
    emotion: data.prediction,
    confidence: data.confidence / 100, // Convert to 0-1 scale
    probs: data.probabilities
  };
};
```

### 2. Database Operations Flow

```
API Request → Data Validation → Database Operation → Response
     ↓              ↓                  ↓               ↓
┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│ POST/GET    │  │ FastAPI     │  │ MongoDB     │  │ JSON        │
│ Request     │  │ Validation  │  │ Operation   │  │ Response    │
└─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘
```

## 🎯 Game-Specific Workflows

### 1. Space Math Game Flow

```
Game Start → Problem Generation → User Input → Validation → Scoring
     ↓              ↓                  ↓           ↓          ↓
┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────┐  ┌─────────┐
│ Initialize  │  │ Math Problem│  │ Answer      │  │ Check   │  │ Update  │
│ Level 1     │  │ Display     │  │ Input       │  │ Correct │  │ Score   │
└─────────────┘  └─────────────┘  └─────────────┘  └─────────┘  └─────────┘
```

### 2. Emotion-Enhanced Gaming (Future Feature)

```
Game Start → Camera Access → Emotion Detection → Adaptive Gameplay
     ↓              ↓              ↓                    ↓
┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│ Game Init   │  │ Webcam      │  │ Real-time   │  │ Difficulty  │
│ with Camera │  │ Capture     │  │ Emotion     │  │ Adjustment  │
└─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘
```

## 🔧 Development & Deployment Workflow

### 1. Development Process

```
Code Changes → Hot Reload → Testing → Integration → Deployment
     ↓              ↓          ↓          ↓            ↓
┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────┐  ┌─────────┐
│ Edit Code   │  │ Vite HMR    │  │ Unit Tests  │  │ API     │  │ Build   │
│ in VSCode   │  │ Updates     │  │ Component   │  │ Testing │  │ Process │
└─────────────┘  └─────────────┘  └─────────────┘  └─────────┘  └─────────┘
```

### 2. Testing Workflow

```bash
# Run integration tests
python integration_test.py

# Test individual components
npm test  # Frontend tests
pytest    # Backend tests (if configured)

# Manual testing
# - Visit http://localhost:5174 for frontend
# - Visit http://localhost:8001/docs for API testing
```

## 🗄️ Data Management Workflow

### 1. Data Collection Points

```
User Registration → Game Scores → Emotion Data → Therapist Notes
        ↓               ↓            ↓               ↓
┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│ User Profile│  │ Performance │  │ AI Analysis │  │ Clinical    │
│ Database    │  │ Metrics     │  │ Results     │  │ Observations│
└─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘
```

### 2. Database Schema

```javascript
// User Collection
{
  _id: ObjectId,
  username: String,
  userType: "child" | "therapist" | "admin",
  createdAt: Date,
  profile: {
    age: Number,
    therapistId: ObjectId // for children
  }
}

// Emotion Predictions Collection
{
  _id: ObjectId,
  timestamp: Date,
  userId: ObjectId,
  emotion: String,
  confidence: Number,
  probabilities: Object,
  landmarks: Array,
  gameContext: String
}

// Game Scores Collection
{
  _id: ObjectId,
  userId: ObjectId,
  gameType: String,
  score: Number,
  level: Number,
  timestamp: Date,
  emotionData: ObjectId // reference to emotion prediction
}
```

## 🚀 Production Deployment Workflow

### 1. Backend Deployment

```bash
# Install production dependencies
pip install gunicorn

# Start production server
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8001
```

### 2. Frontend Deployment

```bash
# Build for production
npm run build

# Serve static files
# Copy dist/ folder to web server (nginx, Apache, etc.)
```

### 3. Database Setup

```bash
# Set up MongoDB replica set for production
# Configure authentication and SSL
# Set up automated backups
```

## 🔍 Monitoring & Analytics Workflow

### 1. Real-time Monitoring

```
Application Logs → Error Tracking → Performance Metrics → Alerts
        ↓               ↓               ↓               ↓
┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│ FastAPI     │  │ Sentry/     │  │ Response    │  │ Email/SMS   │
│ Logs        │  │ Rollbar     │  │ Times       │  │ Notifications│
└─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘
```

### 2. Analytics Dashboard

```
User Activity → Data Aggregation → Visualization → Insights
      ↓              ↓               ↓              ↓
┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│ User Events │  │ MongoDB     │  │ Recharts    │  │ Therapeutic │
│ Tracking    │  │ Aggregation │  │ Charts      │  │ Insights    │
└─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘
```

## 🔐 Security Workflow

### 1. Authentication & Authorization

```
User Login → JWT Token → Route Protection → API Access Control
     ↓           ↓            ↓                   ↓
┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│ Credentials │  │ Token       │  │ Protected   │  │ Role-based  │
│ Validation  │  │ Generation  │  │ Routes      │  │ Permissions │
└─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘
```

### 2. Data Privacy

```
Data Collection → Encryption → Storage → Access Control
       ↓             ↓          ↓           ↓
┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│ GDPR        │  │ TLS/SSL     │  │ Encrypted   │  │ Audit       │
│ Compliance  │  │ Encryption  │  │ Database    │  │ Logs        │
└─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘
```

This comprehensive workflow documentation shows how all components of the JoyVerse system work together to provide a complete therapeutic gaming platform with AI-powered emotion recognition capabilities.
