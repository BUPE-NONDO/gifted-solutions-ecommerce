@echo off
echo Starting Gifted Solutions Development Server...
cd /d "%~dp0"
echo Current directory: %CD%
echo.
echo Checking Node.js installation...
node --version
npm --version
echo.
echo Starting development server...
npm run dev
pause
