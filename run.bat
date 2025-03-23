@echo off
echo Starting Focus Peaking Application...

:: Check if the sample video exists
if not exist "frontend\public\sample.mp4" (
    echo ERROR: Sample video not found!
    echo Please run install.bat first or manually download the sample video.
    echo Video URL: https://drive.google.com/file/d/1h0vtWUQvB3bjYyGRKsDpHyVKVpz5jEnJ/view
    echo Please download it and place it at: frontend\public\sample.mp4
    exit /b 1
)

:: Check if ports are already in use (basic check using netstat)
echo Checking if ports are available...
netstat -ano | findstr :5000 > nul
if %ERRORLEVEL% EQU 0 (
    echo ERROR: Port 5000 is already in use. Please free it up and try again.
    exit /b 1
)

netstat -ano | findstr :3000 > nul
if %ERRORLEVEL% EQU 0 (
    echo ERROR: Port 3000 is already in use. Please free it up and try again.
    exit /b 1
)


:: Check for Python 3.10
where python3.10 >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    set PYTHON=python3.10
) else (
    where py -3.10 >nul 2>&1
    if %ERRORLEVEL% EQU 0 (
        set PYTHON=py -3.10
    ) else (
        set PYTHON=python
    )
)

:: Start the Python backend server
echo Starting backend server...
start "Backend Server"  cmd /c "%PYTHON% backend\main.py"

:: Wait a moment for the backend to start
echo Waiting for backend to start...
timeout /t 3 /nobreak > nul

:: Check if backend started successfully
netstat -ano | findstr :5000 > nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Backend failed to start. Please check for errors.
    exit /b 1
) else (
    echo Backend started successfully on port 5000
)

:: Start the React frontend
echo Starting frontend application...
start "Frontend Application" cmd /c "cd frontend && npm start"

echo.
echo Focus Peaking Application is running!
echo - Backend server: http://localhost:5000
echo - Frontend application: http://localhost:3000
echo.
echo Close this window to stop the application.
echo.

:: Keep the window open
pause > nul