@echo off
echo Installing dependencies for Focus Peaking Application...

:: Create necessary directories if they don't exist
if not exist "frontend\public" mkdir frontend\public

:: Download the sample video if it doesn't exist
if not exist "frontend\public\sample.mp4" (
    echo Downloading sample video...
    
    :: Try to use PowerShell to download the file
    powershell -Command "& {try {$ProgressPreference = 'SilentlyContinue'; Invoke-WebRequest -Uri 'https://drive.google.com/uc?export=download&id=1h0vtWUQvB3bjYyGRKsDpHyVKVpz5jEnJ' -OutFile 'frontend\public\sample.mp4'} catch {Write-Host 'Error downloading sample video.'}}"
    
    if not exist "frontend\public\sample.mp4" (
        echo WARNING: Failed to download the sample video automatically.
        echo Please manually download it from: https://drive.google.com/file/d/1h0vtWUQvB3bjYyGRKsDpHyVKVpz5jEnJ/view
        echo And place it at: frontend\public\sample.mp4
    ) else (
        echo Sample video downloaded successfully.
    )
)

:: Check for Python 3.10
where python3.10 >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo Using Python 3.10...
    set PYTHON=python3.10
) else (
    where py -3.10 >nul 2>&1
    if %ERRORLEVEL% EQU 0 (
        echo Using Python 3.10 via py launcher...
        set PYTHON=py -3.10
    ) else (
        echo Python 3.10 not found, using default Python...
        set PYTHON=python
    )
)

:: Install Python dependencies individually
echo Installing Python dependencies...
%PYTHON% -m pip install flask==2.3.3
%PYTHON% -m pip install flask-cors==4.0.0
%PYTHON% -m pip install opencv-python==4.8.1.78
%PYTHON% -m pip install numpy

:: Install Node.js dependencies
echo Installing Node.js dependencies...
cd frontend
npm install
cd ..

echo All dependencies installed successfully!
echo Run 'run.bat' to start the application.