# JoyVerse Project - Complete Setup & Run Guide

## 📋 Prerequisites

### System Requirements
- **Python 3.8+** (for emotion recognition backend)
- **Node.js 16+** (for frontend development)
- **MongoDB** (for data storage)
- **Git** (for version control)

### Required Python Packages
```bash
pip install fastapi uvicorn torch torchvision pillow opencv-python mediapipe pymongo numpy
```

### Required Node.js Packages
```bash
npm install (handled automatically in setup steps)
```

## 🚀 Quick Start Guide

### Step 1: Clone and Navigate to Project
```bash
git clone <your-repo-url>
cd JoyVerse
```

### Step 2: Set Up Python Environment (Recommended)
```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install Python dependencies
pip install fastapi uvicorn torch torchvision pillow opencv-python mediapipe pymongo numpy
```

### Step 3: Start MongoDB
```bash
# Make sure MongoDB is running on localhost:27017
# If using MongoDB Community Edition:
mongod

# Or if using MongoDB as a service:
# Windows: net start MongoDB
# macOS: brew services start mongodb-community
# Linux: sudo systemctl start mongod
```

### Step 4: Start the Emotion Recognition Backend
```bash
# Navigate to backend directory
cd Vit-Model/backend

# Start the FastAPI server
python main.py

# Or using uvicorn directly:
uvicorn main:app --host 0.0.0.0 --port 8001 --reload
```

**Expected Output:**
```
INFO:     Started server process [XXXX]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8001 (Press CTRL+C to quit)
```

### Step 5: Start the Frontend Development Server
```bash
# Open new terminal and navigate to frontend directory
cd FrontEnd/joyverse-app

# Install dependencies
npm install

# Start development server
npm run dev
```

**Expected Output:**
```
VITE v4.5.14  ready in XXX ms

➜  Local:   http://localhost:5174/
➜  Network: use --host to expose
```

### Step 6: Verify Setup
1. **Backend API**: Visit `http://localhost:8001/docs` - Should show FastAPI documentation
2. **Frontend**: Visit `http://localhost:5174` - Should show JoyVerse welcome page
3. **Test Integration**: Use the integration test script

```bash
cd JoyVerse
python integration_test.py
```

## 🎮 Using the Application

### For Children
1. Go to `http://localhost:5174`
2. Click "Sign Up" → "Child Account"
3. Create an account with child credentials
4. Access games from the child dashboard:
   - Space Math Game
   - Pac-Man Game
   - Art Studio
   - Music Fun
   - Missing Letter Pop

### For Therapists
1. Go to `http://localhost:5174`
2. Click "Sign Up" → "Therapist Account"
3. Create an account with therapist credentials
4. Access the therapist dashboard to:
   - View child progress
   - Analyze emotional data
   - Generate reports

### For Super Admin
1. Go to `http://localhost:5174`
2. Use super admin credentials to log in
3. Access system-wide analytics and management

## 🔧 Development Commands

### Backend Development
```bash
# Start backend in development mode
cd Vit-Model/backend
python main.py

# Run with auto-reload
uvicorn main:app --reload --host 0.0.0.0 --port 8001
```

### Frontend Development
```bash
# Start frontend development server
cd FrontEnd/joyverse-app
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Testing
```bash
# Run integration tests
python integration_test.py

# Test emotion API directly
# Visit: http://localhost:8001/docs
# Use the /predict/ endpoint with an image file
```

## 📁 Project Structure

```
JoyVerse/
├── Vit-Model/                          # Emotion Recognition Backend
│   ├── backend/
│   │   ├── main.py                     # FastAPI application
│   │   ├── vit_model.py                # Emotion model definition
│   │   └── models/
│   │       └── best_model_5class.pth   # Trained model weights
│   ├── frontend/                       # Emotion detection demo
│   └── *.ipynb                         # Jupyter notebooks for training
├── FrontEnd/
│   └── joyverse-app/                   # Main React application
│       ├── src/
│       │   ├── components/             # React components
│       │   │   └── games/              # Game components
│       │   ├── pages/                  # Application pages
│       │   ├── services/               # API services
│       │   └── context/                # React context
│       ├── package.json
│       └── vite.config.js
├── integration_test.py                 # System integration tests
├── MIGRATION_COMPLETE.md               # Migration documentation
└── README.md                          # This file
```

## 🚨 Troubleshooting

### Common Issues

#### 1. Backend Won't Start
```bash
# Check if Python dependencies are installed
pip install -r requirements.txt

# Verify model file exists
ls Vit-Model/backend/models/best_model_5class.pth

# Check MongoDB connection
mongo --eval "db.runCommand('ping')"
```

#### 2. Frontend Won't Start
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check Node.js version
node --version  # Should be 16+
```

#### 3. Database Connection Issues
```bash
# Start MongoDB
mongod

# Check if running
mongo --eval "db.runCommand('ping')"
```

#### 4. Port Conflicts
- Backend default: `8001`
- Frontend default: `5174` (or next available port)
- MongoDB default: `27017`

Change ports in:
- Backend: `main.py` or use `--port` flag
- Frontend: `vite.config.js` or use `--port` flag

## 🔐 Environment Variables

Create a `.env` file in the backend directory:
```env
MONGODB_URL=mongodb://localhost:27017/
DATABASE_NAME=emotion_db
COLLECTION_NAME=emotion_predictions
MODEL_PATH=models/best_model_5class.pth
```

## 📊 API Endpoints

### Emotion Recognition API (Port 8001)
- `GET /docs` - API documentation
- `POST /predict/` - Emotion prediction from image
  - Input: Image file (multipart/form-data)
  - Output: `{prediction, confidence, probabilities, landmarks}`

### Frontend API (Port 5174)
- `GET /` - Welcome page
- `GET /login` - Login page
- `GET /signup` - Registration page
- `GET /child-dashboard` - Child dashboard
- `GET /therapist-dashboard` - Therapist dashboard
- `GET /games/*` - Game routes

## 🎯 Production Deployment

### Backend
```bash
# Install production dependencies
pip install gunicorn

# Start with gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8001
```

### Frontend
```bash
# Build for production
npm run build

# Serve with nginx or any static file server
# Build files will be in 'dist' folder
```

## 📝 Additional Notes

1. **Model Training**: Use the Jupyter notebooks in `Vit-Model/` for retraining the emotion model
2. **Data Analysis**: Use `plot_emotions.py` to analyze emotion data from the database
3. **Backup**: Important files are backed up in timestamped folders
4. **Integration**: The emotion API is integrated into the frontend but may need activation in specific game components
5. **System Workflow**: See `WORKFLOW_DOCUMENTATION.md` for detailed system workflow and architecture

## 📚 Documentation Files

- **`README.md`** - This file, complete setup guide
- **`WORKFLOW_DOCUMENTATION.md`** - Detailed system workflow and architecture
- **`SETUP_GUIDE.md`** - Step-by-step startup instructions
- **`MIGRATION_COMPLETE.md`** - Migration history and changes
- **`requirements.txt`** - Python dependencies

## 🆘 Support

If you encounter issues:
1. Check the console logs in both backend and frontend terminals
2. Verify all dependencies are installed
3. Ensure MongoDB is running and accessible
4. Run the integration test script for system verification
5. Check the FastAPI docs at `http://localhost:8001/docs` for API testing

**Happy coding! 🎉**
