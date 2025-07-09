@echo off
echo ========================================
echo Power Prediction API Setup and Launch
echo ========================================
echo.

echo [1/6] Checking Python installation...
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python from https://www.python.org/downloads/
    pause
    exit /b 1
)
echo ✅ Python found

echo.
echo [2/6] Creating virtual environment...
if not exist "venv" (
    python -m venv venv
    echo ✅ Virtual environment created
) else (
    echo ✅ Virtual environment already exists
)

echo.
echo [3/6] Activating virtual environment...
call venv\Scripts\activate.bat
if errorlevel 1 (
    echo ERROR: Failed to activate virtual environment
    pause
    exit /b 1
)
echo ✅ Virtual environment activated

echo.
echo [4/6] Installing dependencies...
pip install -r requirements.txt
if errorlevel 1 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)
echo ✅ Dependencies installed

echo.
echo [5/6] Creating necessary directories...
if not exist "models" mkdir models
if not exist "uploads" mkdir uploads  
if not exist "outputs" mkdir outputs
echo ✅ Directories created

echo.
echo [6/6] Starting API server...
echo.
echo ========================================
echo API will be available at:
echo   • Main API: http://localhost:8000
echo   • Interactive Docs: http://localhost:8000/docs
echo   • Alternative Docs: http://localhost:8000/redoc
echo ========================================
echo.
echo 📝 IMPORTANT: Make sure to place your model file in the 'models' folder!
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.

uvicorn main:app --host 0.0.0.0 --port 8000 --reload

echo.
echo Server stopped.
pause
