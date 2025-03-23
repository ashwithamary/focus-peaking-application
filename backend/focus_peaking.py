import cv2
import numpy as np

def apply_focus_peaking(frame, threshold=20, color=(0, 255, 0), intensity=0.4):
    """
    Apply focus peaking effect to a video frame.
    
    Args:
        frame: Input video frame (numpy array)
        threshold: Edge detection threshold
        color: Highlight color in BGR format (default: green)
        intensity: Highlight intensity (0.0 to 1.0)
        
    Returns:
        Frame with focus peaking overlay
    """
    # Convert to grayscale for edge detection
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    
    # Apply Laplacian filter for edge detection
    laplacian = cv2.Laplacian(gray, cv2.CV_64F)
    
    # Convert to absolute values and normalize
    abs_laplacian = np.absolute(laplacian)
    norm_laplacian = cv2.normalize(abs_laplacian, None, 0, 255, cv2.NORM_MINMAX, dtype=cv2.CV_8U)
    
    # Create a mask for areas with high contrast
    _, mask = cv2.threshold(norm_laplacian, threshold, 255, cv2.THRESH_BINARY)
    
    # Create colored overlay
    overlay = frame.copy()
    overlay[mask > 0] = color
    
    # Blend the original frame with the overlay
    result = cv2.addWeighted(frame, 1 - intensity, overlay, intensity, 0)
    
    return result

def process_video_frame(frame, enable_peaking=True, threshold=30, color_name="green", intensity=0.7):
    """
    Process a video frame with optional focus peaking.
    
    Args:
        frame: Input video frame
        enable_peaking: Whether to apply focus peaking
        threshold: Edge detection threshold
        color_name: Color name for highlights ('green', 'red', 'blue', or 'yellow')
        intensity: Highlight intensity
        
    Returns:
        Processed frame
    """
    # Define color mapping (in BGR format)
    color_map = {
        "red": (0, 0, 255),     # BGR for red
        "green": (0, 255, 0),   # BGR for green
        "blue": (255, 0, 0),    # BGR for blue
        "yellow": (0, 255, 255) # BGR for yellow
    }
    
    # Get the color in BGR format
    color = color_map.get(color_name.lower(), (0, 255, 0))  # Default to green
    """
    Process a video frame with optional focus peaking.
    
    Args:
        frame: Input video frame
        enable_peaking: Whether to apply focus peaking
        threshold: Edge detection threshold
        color: Highlight color in BGR format
        intensity: Highlight intensity
        
    Returns:
        Processed frame
    """
    if enable_peaking:
        return apply_focus_peaking(frame, threshold, color, intensity)
    return frame