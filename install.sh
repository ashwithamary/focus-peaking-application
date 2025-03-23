#!/bin/bash
echo "Installing dependencies for Focus Peaking Application..."

# Create Python virtual environment
echo "Creating Python virtual environment..."
python3.10 -m venv venv
source venv/bin/activate

# Create necessary directories if they don't exist
mkdir -p frontend/public

# Download the sample video if it doesn't exist
if [ ! -f "frontend/public/sample.mp4" ]; then
    echo "Downloading sample video... (this may take a moment)"
    
    # Check if curl is available
    if command -v curl &> /dev/null; then
        curl -s -L "https://drive.google.com/uc?export=download&id=1h0vtWUQvB3bjYyGRKsDpHyVKVpz5jEnJ" -o frontend/public/sample.mp4
    # Check if wget is available
    elif command -v wget &> /dev/null; then
        wget -q --no-check-certificate "https://drive.google.com/uc?export=download&id=1h0vtWUQvB3bjYyGRKsDpHyVKVpz5jEnJ" -O frontend/public/sample.mp4
    else
        echo "ERROR: Neither curl nor wget is installed. Please install one of them or manually download the sample video."
        echo "Video URL: https://drive.google.com/file/d/1h0vtWUQvB3bjYyGRKsDpHyVKVpz5jEnJ/view"
        echo "Please download it and place it at: frontend/public/sample.mp4"
        deactivate
        exit 1
    fi
    
    if [ ! -f "frontend/public/sample.mp4" ] || [ ! -s "frontend/public/sample.mp4" ]; then
        echo "WARNING: Failed to download the sample video automatically."
        echo "Please manually download it from: https://drive.google.com/file/d/1h0vtWUQvB3bjYyGRKsDpHyVKVpz5jEnJ/view"
        echo "And place it at: frontend/public/sample.mp4"
    else
        echo "✓ Sample video downloaded successfully."
    fi
fi

# Install Python dependencies quietly
echo "Installing Python dependencies..."
pip install -q -r backend/requirements.txt
echo "✓ Python dependencies installed successfully."

# Exit the virtual environment
deactivate

# Install Node.js dependencies quietly
echo "Installing Node.js dependencies..."
(cd frontend && npm install --silent)
echo "✓ Node.js dependencies installed successfully."

echo "All dependencies installed successfully!"
echo "Run './run.sh' to start the application."
