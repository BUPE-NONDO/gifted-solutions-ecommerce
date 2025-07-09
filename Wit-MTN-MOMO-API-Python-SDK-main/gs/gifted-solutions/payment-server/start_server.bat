@echo off
echo Starting MTN MOMO Payment Server...
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo Error: Python is not installed or not in PATH
    echo Please install Python 3.7+ and try again
    pause
    exit /b 1
)

REM Install requirements if needed
echo Installing Python dependencies...
pip install -r requirements.txt

REM Start the Flask server
echo.
echo Starting Flask server on http://localhost:5000
echo Press Ctrl+C to stop the server
echo.
python app.py

pause
