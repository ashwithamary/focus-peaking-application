import React, { useRef, useState, useEffect } from 'react';
import axios from 'axios';

const VideoPlayer = ({ focusPeakingEnabled, peakingColor = 'green' }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const webcamRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [error, setError] = useState(null);
  const [currentColor, setCurrentColor] = useState(peakingColor);
  const [useWebcam, setUseWebcam] = useState(false);
  const [webcamActive, setWebcamActive] = useState(false);
  const processingRef = useRef(false);

  // Handle video playing state
  const togglePlay = () => {
    if (useWebcam) {
      toggleWebcam();
    } else if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Toggle between webcam and sample video
  const toggleSource = async () => {
    // Stop any ongoing processing
    processingRef.current = false;
    
    // Stop video if playing
    if (videoRef.current && isPlaying && !useWebcam) {
      videoRef.current.pause();
    }
    
    // Stop webcam if active
    if (webcamRef.current && webcamActive && useWebcam) {
      const stream = webcamRef.current.srcObject;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      webcamRef.current.srcObject = null;
      setWebcamActive(false);
    }
    
    // Clear canvas
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
    
    setIsPlaying(false);
    setUseWebcam(!useWebcam);
  };
  
  // Initialize or toggle webcam
  const toggleWebcam = async () => {
    if (!webcamActive) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            width: { ideal: 1280 },
            height: { ideal: 720 }
          } 
        });
        
        if (webcamRef.current) {
          webcamRef.current.srcObject = stream;
          setWebcamActive(true);
          setIsPlaying(true);
          processingRef.current = true;
          
          // Set canvas size to match webcam once it starts
          webcamRef.current.onloadedmetadata = () => {
            if (canvasRef.current && webcamRef.current) {
              canvasRef.current.width = webcamRef.current.videoWidth;
              canvasRef.current.height = webcamRef.current.videoHeight;
            }
          };
        }
      } catch (err) {
        console.error("Error accessing webcam:", err);
        setError("Could not access webcam. Please ensure you have granted camera permissions.");
      }
    } else {
      // Stop webcam
      if (webcamRef.current) {
        const stream = webcamRef.current.srcObject;
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
        webcamRef.current.srcObject = null;
      }
      setWebcamActive(false);
      setIsPlaying(false);
      processingRef.current = false;
    }
  };

  // Handle video loaded
  const handleVideoLoaded = () => {
    setVideoLoaded(true);
    
    // Set canvas size to match video
    if (canvasRef.current && videoRef.current) {
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
    }
  };

  // Handle color changes by completely resetting the video/webcam
  useEffect(() => {
    if (peakingColor !== currentColor) {
      console.log(`Color changing from ${currentColor} to ${peakingColor}`);
      
      // Stop any ongoing processing
      processingRef.current = false;
      
      // For both video and webcam: stop current processing and clear canvas
      if (videoRef.current) {
        videoRef.current.pause();
        setIsPlaying(false);
      }
      
      // Stop webcam if active
      if (webcamRef.current && webcamActive) {
        const stream = webcamRef.current.srcObject;
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
        webcamRef.current.srcObject = null;
        setWebcamActive(false);
      }
      
      // Clear canvas
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
      
      // Reset video position if using video
      if (!useWebcam && videoRef.current) {
        videoRef.current.currentTime = 0;
      }
      
      // Update the current color after a small delay to ensure reset is complete
      setTimeout(() => {
        setCurrentColor(peakingColor);
        // Restart webcam if it was active
        if (useWebcam && isPlaying) {
          toggleWebcam();
        }
      }, 100);
    }
  }, [peakingColor, currentColor, useWebcam, webcamActive, isPlaying, toggleWebcam]);

  // Process frames (video or webcam) when playing
  useEffect(() => {
    let animationFrameId;
    let lastTime = 0;
    const FPS = 15; // Target frames per second
    const frameInterval = 1000 / FPS;
    
    // Set processing flag to true when starting
    if ((isPlaying && !useWebcam) || (useWebcam && webcamActive)) {
      processingRef.current = true;
    } else {
      processingRef.current = false;
    }
    
    const processFrame = async (timestamp) => {
      // Exit if we're not supposed to be processing anymore
      if (!processingRef.current) {
        return;
      }
      
      // Check the proper source is available
      const sourceRef = useWebcam ? webcamRef : videoRef;
      if (!sourceRef.current || !canvasRef.current) {
        animationFrameId = requestAnimationFrame(processFrame);
        return;
      }
      
      // For video, only process if playing
      if (!useWebcam && !isPlaying) {
        animationFrameId = requestAnimationFrame(processFrame);
        return;
      }
      
      // For webcam, only process if active
      if (useWebcam && !webcamActive) {
        animationFrameId = requestAnimationFrame(processFrame);
        return;
      }

      // Throttle frame processing to target FPS
      if (timestamp - lastTime < frameInterval) {
        animationFrameId = requestAnimationFrame(processFrame);
        return;
      }
      
      lastTime = timestamp;

      try {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        
        // Draw current frame to canvas
        ctx.drawImage(sourceRef.current, 0, 0, canvas.width, canvas.height);
        
        // Get image data from canvas
        const imageData = canvas.toDataURL('image/jpeg');
        
        // Only process if we're still using the same color and processing flag is true
        if (focusPeakingEnabled && currentColor === peakingColor && processingRef.current) {
          const response = await axios.post('http://localhost:5000/api/process-frame', {
            frame: imageData,
            enablePeaking: focusPeakingEnabled,
            color: currentColor
          });
          
          // Check if we're still processing the same color before drawing
          if (currentColor === peakingColor && processingRef.current) {
            const processedImage = new Image();
            processedImage.onload = () => {
              // Final check before drawing to canvas
              if (currentColor === peakingColor && processingRef.current) {
                ctx.drawImage(processedImage, 0, 0, canvas.width, canvas.height);
              }
            };
            processedImage.src = response.data.processedFrame;
          }
        }
      } catch (err) {
        console.error('Error processing frame:', err);
        setError('Error processing video frame. Please check if the backend server is running.');
      }
      
      // Continue the animation loop only if we're still processing
      if (processingRef.current) {
        animationFrameId = requestAnimationFrame(processFrame);
      }
    };

    if ((isPlaying && !useWebcam) || (useWebcam && webcamActive)) {
      animationFrameId = requestAnimationFrame(processFrame);
    }

    return () => {
      // Stop processing on cleanup
      processingRef.current = false;
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isPlaying, focusPeakingEnabled, currentColor, peakingColor, useWebcam, webcamActive]);

  return (
    <div className="relative">
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-100 bg-opacity-80 z-10 p-4 rounded">
          <p className="text-red-700 text-center">{error}</p>
          <button 
            className="ml-2 px-2 py-1 bg-red-600 text-white rounded text-sm"
            onClick={() => setError(null)}
          >
            Dismiss
          </button>
        </div>
      )}
      
      <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
        {/* Original video (hidden) */}
        <video
          ref={videoRef}
          src="/sample.mp4"
          className="hidden"
          preload="auto"
          onLoadedData={handleVideoLoaded}
          loop
        />
        
        {/* Webcam video (hidden) */}
        <video
          ref={webcamRef}
          className="hidden"
          autoPlay
          playsInline
        />
        
        {/* Canvas for displaying processed frames */}
        <canvas
          ref={canvasRef}
          className="w-full h-full object-contain"
          onClick={togglePlay}
        />
        
        {/* Play/pause overlay for video mode */}
        {!useWebcam && !isPlaying && videoLoaded && (
          <div 
            className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 cursor-pointer"
            onClick={togglePlay}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
          </div>
        )}
        
        {/* Webcam start overlay for webcam mode */}
        {useWebcam && !webcamActive && (
          <div 
            className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 cursor-pointer"
            onClick={togglePlay}
          >
            <div className="flex flex-col items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-white mb-2" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
              </svg>
              <span className="text-white font-medium">Start Webcam</span>
            </div>
          </div>
        )}
        
        {/* Loading indicator */}
        {!useWebcam && !videoLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
          </div>
        )}
        
        {/* Color change indicator */}
        {currentColor !== peakingColor && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 z-20">
            <div className="text-white text-xl">Changing color...</div>
          </div>
        )}
      </div>
      
      <div className="mt-4 flex flex-wrap justify-between items-center gap-2">
        <div className="flex gap-2">
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
            onClick={togglePlay}
            disabled={currentColor !== peakingColor || (!videoLoaded && !useWebcam)}
          >
            {useWebcam 
              ? (webcamActive ? 'Stop Webcam' : 'Start Webcam')
              : (isPlaying ? 'Pause' : 'Play')
            }
          </button>
          
          <button
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
            onClick={toggleSource}
            disabled={currentColor !== peakingColor}
          >
            Switch to {useWebcam ? 'Video' : 'Webcam'}
          </button>
        </div>
        
        <div className="text-sm text-gray-600">
          {focusPeakingEnabled 
            ? `Focus Peaking: Active (${currentColor})` 
            : 'Focus Peaking: Inactive'}
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;