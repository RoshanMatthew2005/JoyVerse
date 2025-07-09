# 🚀 JoyVerse Project - Complete Step-by-Step Guide

## Prerequisites Setup

### 1. Install Required Software
```bash
# Install Python 3.8+ from https://python.org
# Install Node.js 16+ from https://nodejs.org
# Install MongoDB Community Edition from https://mongodb.com
```

### 2. Install Python Dependencies
```bash
# Navigate to project root
cd JoyVerse

# Install Python packages
pip install -r requirements.txt
```

## 🔧 Step-by-Step Startup Process

### Step 1: Start MongoDB
```bash
# Option A: If MongoDB is installed as a service
net start MongoDB

# Option B: Start MongoDB manually
mongod

# Verify MongoDB is running
mongo --eval "db.runCommand('ping')"
```

### Step 2: Start the Backend (Emotion Recognition API)
```bash
# Open Terminal 1
cd JoyVerse/Vit-Model/backend

# Start the FastAPI server
python main.py

# Wait for this message:
# "INFO:     Uvicorn running on http://0.0.0.0:8001"
```

### Step 3: Start the Frontend
```bash
# Open Terminal 2
cd JoyVerse/FrontEnd/joyverse-app

# Install dependencies (first time only)
npm install

# Start development server
npm run dev

# Wait for this message:
# "Local:   http://localhost:5174/"
```

### Step 4: Verify Everything is Working
```bash
# Open Terminal 3
cd JoyVerse

# Run integration tests
python integration_test.py

# Expected output:
# Backend Health Check: ✅ PASS
# Frontend Health Check: ✅ PASS
# MongoDB Connection: ✅ PASS
# Emotion API Endpoint: ✅ PASS
```

## 🌐 Access the Application

### URLs to Test:
- **Backend API Documentation**: http://localhost:8001/docs
- **Frontend Application**: http://localhost:5174
- **Welcome Page**: http://localhost:5174/

### User Accounts:
1. **Child Account**: Sign up at http://localhost:5174/child-signup
2. **Therapist Account**: Sign up at http://localhost:5174/therapist-signup
3. **Super Admin**: Use existing credentials

## 🎮 Available Games

After logging in as a child, access these games:
- **Space Math Game**: http://localhost:5174/games/space-math
- **Pac-Man Game**: http://localhost:5174/games/pacman
- **Art Studio**: http://localhost:5174/games/art-studio
- **Music Fun**: http://localhost:5174/games/music-fun
- **Missing Letter Pop**: http://localhost:5174/games/missing-letter-pop

## 🧪 Testing the Emotion API

### Test with FastAPI Docs:
1. Go to http://localhost:8001/docs
2. Click on "POST /predict/"
3. Click "Try it out"
4. Upload an image file
5. Click "Execute"

### Test with HTML Test Page:
1. Open `test_transform_api.html` in browser
2. Use the file upload interface
3. Test emotion detection with various images

## 📊 For Therapists

### Therapist Dashboard Features:
1. **View Child Progress**: Monitor game performance
2. **Emotion Analytics**: View emotional data trends
3. **Generate Reports**: Create progress reports
4. **Manage Comments**: Add notes about child progress

Access at: http://localhost:5174/therapist-dashboard

## 🛠️ Development Commands

### Backend Development:
```bash
# Auto-reload backend during development
cd Vit-Model/backend
uvicorn main:app --reload --host 0.0.0.0 --port 8001
```

### Frontend Development:
```bash
# Development server with hot reload
cd FrontEnd/joyverse-app
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🚨 Troubleshooting Guide

### Backend Issues:
```bash
# Check if backend is running
curl http://localhost:8001/docs

# Check model file exists
ls Vit-Model/backend/models/best_model_5class.pth

# Check Python dependencies
pip list | grep -E "(fastapi|uvicorn|torch|opencv|mediapipe|pymongo)"
```

### Frontend Issues:
```bash
# Check if frontend is running
curl http://localhost:5174

# Clear and reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Check Node.js version
node --version  # Should be 16+
```

### Database Issues:
```bash
# Test MongoDB connection
mongo --eval "db.runCommand('ping')"

# Check if MongoDB is running
netstat -an | grep 27017
```

## 🔄 Quick Restart Process

### If Services Stop Working:
1. **Stop all services**: Close terminal windows or press Ctrl+C
2. **Restart MongoDB**: `mongod` or `net start MongoDB`
3. **Restart Backend**: `cd Vit-Model/backend && python main.py`
4. **Restart Frontend**: `cd FrontEnd/joyverse-app && npm run dev`
5. **Test**: `python integration_test.py`

## 📱 Using the Startup Scripts

### Windows:
```bash
# Run the automated startup script
start_joyverse.bat
```

### macOS/Linux:
```bash
# Make script executable
chmod +x start_joyverse.sh

# Run the automated startup script
./start_joyverse.sh
```

## 🎯 Production Deployment

### Backend Production:
```bash
# Install production server
pip install gunicorn

# Start with gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8001
```

### Frontend Production:
```bash
# Build for production
npm run build

# Files will be in 'dist' folder
# Deploy to any static hosting service
```

## 📋 Project Status Checklist

After following these steps, verify:
- [ ] MongoDB is running and accessible
- [ ] Backend API responds at http://localhost:8001/docs
- [ ] Frontend loads at http://localhost:5174
- [ ] Integration tests pass
- [ ] Games are accessible from child dashboard
- [ ] Therapist dashboard shows analytics
- [ ] Emotion API processes images correctly

## 🆘 Getting Help

If you encounter issues:
1. Check the terminal outputs for error messages
2. Verify all prerequisites are installed
3. Ensure ports 8001, 5174, and 27017 are not blocked
4. Run `python integration_test.py` to diagnose problems
5. Check the console logs in your browser's developer tools

**You're now ready to use JoyVerse! 🎉**
