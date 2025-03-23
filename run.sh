#!/bin/bash

echo "Starting Focus Peaking Application..."

# Check if the sample video exists
if [ ! -f "frontend/public/sample.mp4" ]; then
    echo "ERROR: Sample video not found!"
    echo "Please run ./install.sh first or manually download the sample video."
    echo "Video URL: https://drive.google.com/file/d/1h0vtWUQvB3bjYyGRKsDpHyVKVpz5jEnJ/view"
    echo "Please download it and place it at: frontend/public/sample.mp4"
    exit 1
fi

# Function to check if port is available
port_is_available() {
    if command -v netstat &> /dev/null; then
        ! netstat -tuln | grep -q ":$1 "
        return $?
    elif command -v ss &> /dev/null; then
        ! ss -tuln | grep -q ":$1 "
        return $?
    else
        # If neither tool is available, assume port is available
        return 0
    fi
}

# Check if ports are available
BACKEND_PORT=5000
FRONTEND_PORT=3000

if ! port_is_available $BACKEND_PORT; then
    echo "ERROR: Port $BACKEND_PORT is already in use. Please free it up and try again."
    exit 1
fi

if ! port_is_available $FRONTEND_PORT; then
    echo "ERROR: Port $FRONTEND_PORT is already in use. Please free it up and try again."
    exit 1
fi

# Create a file to store pids
echo -n "" > .pids.txt

# Start the Python backend server
echo "Starting backend server..."
cd backend
python3 main.py &
BACKEND_PID=$!
cd ..
echo $BACKEND_PID > .pids.txt

# Wait for the backend to start up
echo "Waiting for backend to start..."
sleep 3

# Check if backend started successfully
if ! port_is_available $BACKEND_PORT; then
    echo "Backend started successfully on port $BACKEND_PORT"
else
    echo "ERROR: Backend failed to start. Please check for errors."
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

# Start the React frontend
echo "Starting frontend application..."
cd frontend
npm start &
FRONTEND_PID=$!
cd ..
echo $FRONTEND_PID >> .pids.txt

# Function to handle script termination
cleanup() {
    echo "Shutting down application..."
    if [ -f .pids.txt ]; then
        for pid in $(cat .pids.txt); do
            kill $pid 2>/dev/null
        done
        rm .pids.txt
    fi
    exit 0
}

# Set up trap to catch termination signals
trap cleanup SIGINT SIGTERM

echo ""
echo "Focus Peaking Application is running!"
echo "- Backend server: http://localhost:5000"
echo "- Frontend application: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop the application."
echo ""

# Keep the script running
wait