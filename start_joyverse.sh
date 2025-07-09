#!/bin/bash
# JoyVerse Startup Script
# This script starts all necessary services for the JoyVerse project

echo "🚀 Starting JoyVerse Project..."
echo "================================"

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if a port is in use
port_in_use() {
    netstat -an | grep ":$1 " > /dev/null 2>&1
}

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command_exists python; then
    echo "❌ Python not found. Please install Python 3.8+"
    exit 1
fi

if ! command_exists node; then
    echo "❌ Node.js not found. Please install Node.js 16+"
    exit 1
fi

if ! command_exists npm; then
    echo "❌ npm not found. Please install npm"
    exit 1
fi

echo "✅ Prerequisites check passed"

# Check if MongoDB is running
echo "🗄️  Checking MongoDB..."
if ! port_in_use 27017; then
    echo "⚠️  MongoDB not running on port 27017"
    echo "   Please start MongoDB manually:"
    echo "   - Windows: net start MongoDB"
    echo "   - macOS: brew services start mongodb-community"
    echo "   - Linux: sudo systemctl start mongod"
    echo "   - Or run: mongod"
    read -p "Press Enter when MongoDB is ready..."
fi

# Start Backend
echo "🔧 Starting Emotion Recognition Backend..."
cd Vit-Model/backend
if [ ! -f "models/best_model_5class.pth" ]; then
    echo "❌ Model file not found at models/best_model_5class.pth"
    echo "   Please ensure the model file is in the correct location"
    exit 1
fi

# Start backend in background
python main.py &
BACKEND_PID=$!
echo "✅ Backend started (PID: $BACKEND_PID) on http://localhost:8001"

# Give backend time to start
sleep 3

# Start Frontend
echo "🌐 Starting Frontend..."
cd ../../FrontEnd/joyverse-app

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
fi

# Start frontend in background
npm run dev &
FRONTEND_PID=$!
echo "✅ Frontend started (PID: $FRONTEND_PID)"

# Wait for frontend to be ready
sleep 5

# Run integration tests
echo "🧪 Running integration tests..."
cd ../../
python integration_test.py

echo ""
echo "🎉 JoyVerse is ready!"
echo "================================"
echo "🔧 Backend API: http://localhost:8001/docs"
echo "🌐 Frontend: http://localhost:5174"
echo "🧪 Test again: python integration_test.py"
echo ""
echo "To stop services:"
echo "  kill $BACKEND_PID $FRONTEND_PID"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for interrupt
trap "echo 'Stopping services...'; kill $BACKEND_PID $FRONTEND_PID; exit 0" INT
wait
