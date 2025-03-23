import React, { useState } from 'react';
import VideoPlayer from './components/VideoPlayer';
import ToggleButton from './components/ToggleButton';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from './components/ui/card';
import './App.css';

function App() {
  const [focusPeakingEnabled, setFocusPeakingEnabled] = useState(false);
  const [peakingColor, setPeakingColor] = useState('green');

  const toggleFocusPeaking = () => {
    setFocusPeakingEnabled(!focusPeakingEnabled);
  };
  
  const handleColorChange = (e) => {
    setPeakingColor(e.target.value);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle className="text-center">Focus Peaking Demo</CardTitle>
          <CardDescription className="text-center">
            Toggle the button below to enable/disable focus peaking. You can use the sample video or your webcam.
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <VideoPlayer 
            focusPeakingEnabled={focusPeakingEnabled}
            peakingColor={peakingColor} 
          />
          
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
            <ToggleButton 
              enabled={focusPeakingEnabled} 
              onChange={toggleFocusPeaking} 
              enabledLabel="Focus Peaking ON"
              disabledLabel="Focus Peaking OFF"
            />
            
            {focusPeakingEnabled && (
              <div className="flex items-center gap-2">
                <label htmlFor="colorSelect" className="font-medium text-gray-700">
                  Highlight Color:
                </label>
                
                <select
                  id="colorSelect"
                  value={peakingColor}
                  onChange={handleColorChange}
                  className={`
                    p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500
                    ${peakingColor === 'red' ? 'bg-red-100 text-red-800' : 
                    peakingColor === 'green' ? 'bg-green-100 text-green-800' : 
                    peakingColor === 'blue' ? 'bg-blue-100 text-blue-800' : 
                    'bg-yellow-100 text-yellow-800'}
                  `}
                >
                  <option value="green">Green</option>
                  <option value="red">Red</option>
                  <option value="blue">Blue</option>
                  <option value="yellow">Yellow</option>
                </select>
              </div>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col justify-center gap-2">
          <p className="text-center text-gray-500 text-sm">
            Focus peaking highlights areas of high contrast (sharp focus)
          </p>
          <p className="text-center text-gray-500 text-xs">
            Webcam mode allows you to see focus peaking in real-time with your camera
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

export default App;