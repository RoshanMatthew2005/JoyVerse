@echo off
REM JoyVerse Startup Script for Windows
REM This script starts all necessary services for the JoyVerse project

echo 🚀 Starting JoyVerse Project...
echo ================================

REM Check prerequisites
echo 📋 Checking prerequisites...

python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python not found. Please install Python 3.8+
    pause
    exit /b 1
)

node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js not found. Please install Node.js 16+
    pause
    exit /b 1
)

npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm not found. Please install npm
    pause
    exit /b 1
)

echo ✅ Prerequisites check passed

REM Check if MongoDB is running
echo 🗄️  Checking MongoDB...
netstat -an | find ":27017" >nul
if %errorlevel% neq 0 (
    echo ⚠️  MongoDB not running on port 27017
    echo    Please start MongoDB manually:
    echo    - Windows: net start MongoDB
    echo    - Or run: mongod
    pause
)

REM Start Backend
echo 🔧 Starting Emotion Recognition Backend...
cd Vit-Model\backend

if not exist "models\best_model_5class.pth" (
    echo ❌ Model file not found at models\best_model_5class.pth
    echo    Please ensure the model file is in the correct location
    pause
    exit /b 1
)

REM Start backend in new window
start "JoyVerse Backend" cmd /k "python main.py"
echo ✅ Backend started on http://localhost:8001

REM Give backend time to start
timeout /t 3 /nobreak >nul

REM Start Frontend
echo 🌐 Starting Frontend...
cd ..\..\FrontEnd\joyverse-app

REM Install dependencies if needed
if not exist "node_modules" (
    echo 📦 Installing frontend dependencies...
    npm install
)

REM Start frontend in new window
start "JoyVerse Frontend" cmd /k "npm run dev"
echo ✅ Frontend started

REM Wait for frontend to be ready
timeout /t 5 /nobreak >nul

REM Run integration tests
echo 🧪 Running integration tests...
cd ..\..
python integration_test.py

echo.
echo 🎉 JoyVerse is ready!
echo ================================
echo 🔧 Backend API: http://localhost:8001/docs
echo 🌐 Frontend: http://localhost:5174
echo 🧪 Test again: python integration_test.py
echo.
echo Services are running in separate windows.
echo Close the terminal windows to stop services.
echo.
pause
