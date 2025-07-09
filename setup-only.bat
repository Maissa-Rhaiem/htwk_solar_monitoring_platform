@echo off
echo ========================================
echo Power Prediction API - Setup Only
echo ========================================
echo.

echo [1/5] Checking Python installation...
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python from https://www.python.org/downloads/
    pause
    exit /b 1
)
echo ✅ Python found

echo.
echo [2/5] Creating virtual environment...
if not exist "venv" (
    python -m venv venv
    echo ✅ Virtual environment created
) else (
    echo ✅ Virtual environment already exists
)

echo.
echo [3/5] Activating virtual environment...
call venv\Scripts\activate.bat
if errorlevel 1 (
    echo ERROR: Failed to activate virtual environment
    pause
    exit /b 1
)
echo ✅ Virtual environment activated

echo.
echo [4/5] Installing dependencies...
pip install -r requirements.txt
if errorlevel 1 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)
echo ✅ Dependencies installed

echo.
echo [5/5] Creating necessary directories...
if not exist "models" mkdir models
if not exist "uploads" mkdir uploads  
if not exist "outputs" mkdir outputs
echo ✅ Directories created

echo.
echo ========================================
echo ✅ Setup completed successfully!
echo ========================================
echo.
echo Next steps:
echo 1. Place your model file (.keras) in the 'models' folder
echo 2. Run 'start-api.bat' to start the server
echo 3. Or manually run: venv\Scripts\activate.bat then uvicorn main:app --reload
echo.
pause
