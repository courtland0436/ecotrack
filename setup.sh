#!/bin/bash

# EcoTrack: Automated Setup and Launch Script

# 1. Backend Environment and Database Seed
echo "Setting up Python Backend..."
if [ -d "server" ]; then
    cd server
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    python seed.py
    # Start Flask in the background
    python app.py &
    BACKEND_PID=$!
    cd ..
else
    echo "Error: server directory not found."
    exit 1
fi

# 2. Frontend Dependencies and Launch
echo "Setting up React Frontend..."
if [ -d "client" ]; then
    cd client
    npm install
    # Start Vite in the background
    npm run dev &
    FRONTEND_PID=$!
    cd ..
else
    echo "Error: client directory not found."
    exit 1
fi

# Function to kill both processes on exit
cleanup() {
    echo ""
    echo "Shutting down EcoTrack..."
    kill $BACKEND_PID
    kill $FRONTEND_PID
    exit
}

trap cleanup SIGINT

echo "------------------------------------------------"
echo "EcoTrack is now running!"
echo "Backend: http://127.0.0.1:5555"
echo "Frontend: Check the Vite URL above (usually http://localhost:5173)"
echo "------------------------------------------------"
echo "Press Ctrl+C to stop both servers."

# Keep the script alive so the processes don't close
wait