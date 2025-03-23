import os
import cv2
import base64
import numpy as np
from flask import Flask, request, jsonify, Response
from flask_cors import CORS
from focus_peaking import process_video_frame

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route('/api/process-frame', methods=['POST'])
def process_frame():
    """
    API endpoint to process a video frame with focus peaking.
    
    Expects:
        - frame: Base64 encoded image
        - enable_peaking: Boolean flag to enable/disable focus peaking
        
    Returns:
        - Processed frame as Base64 encoded image
    """
    data = request.json
    frame_data = data.get('frame')
    enable_peaking = data.get('enablePeaking', True)
    
    # Decode base64 image
    frame_bytes = base64.b64decode(frame_data.split(',')[1])
    frame_array = np.frombuffer(frame_bytes, np.uint8)
    frame = cv2.imdecode(frame_array, cv2.IMREAD_COLOR)
    
    # Get color from request (default to green if not specified)
    color_name = data.get('color', 'green')
    
    # Process the frame
    processed_frame = process_video_frame(
        frame, 
        enable_peaking=enable_peaking,
        threshold=30,
        color_name=color_name,
        intensity=0.7
    )
    
    # Encode processed frame to base64
    _, buffer = cv2.imencode('.jpg', processed_frame)
    encoded_frame = base64.b64encode(buffer).decode('utf-8')
    
    return jsonify({
        'processedFrame': f'data:image/jpeg;base64,{encoded_frame}'
    })

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "ok"})

if __name__ == '__main__':
    print("Starting Focus Peaking Server...")
    app.run(host='127.0.0.1', port=5000, debug=False)