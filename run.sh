#!/bin/bash
echo "Starting Focus Peaking Application..."

# Check if the sample video exists
if [ ! -f "frontend/public/sample.mp4" ]; then
    echo "ERROR: Sample video not found!"
    echo "Please run ./install.sh first or manually download the sample video."
    exit 1
fi

# Check if port 5000 is already in use and kill the process if needed
if command -v lsof &> /dev/null; then
    if lsof -Pi :5000 -sTCP:LISTEN -t >/dev/null ; then
        echo "Port 5000 is already in use. Stopping the previous process..."
        kill $(lsof -t -i:5000) 2>/dev/null || true
        sleep 1
    fi
elif command -v ss &> /dev/null; then
    if ss -tuln | grep -q ":5000 "; then
        echo "Port 5000 is already in use. Please free it up and try again."
        exit 1
    fi
fi

# Activate the virtual environment
source venv/bin/activate

# Start the Python backend server
echo "Starting backend server..."
cd backend
python main.py &
BACKEND_PID=$!
cd ..

# Wait for the backend to start up
echo "Waiting for backend to start..."
sleep 3

# Check if backend is running
if ! ps -p $BACKEND_PID > /dev/null; then
    echo "ERROR: Backend failed to start. Please check for errors."
    deactivate
    exit 1
fi

echo "✓ Backend started successfully."

# Start the React frontend
echo "Starting frontend..."
cd frontend
npm start

# This will only run after npm start finishes (user presses Ctrl+C)
echo "Shutting down application..."
kill $BACKEND_PID 2>/dev/null

# Exit the virtual environment
deactivate
