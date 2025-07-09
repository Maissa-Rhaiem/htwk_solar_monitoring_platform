@echo off
echo ========================================
echo Starting Power Prediction API Server
echo ========================================
echo.

echo Activating virtual environment...
call venv\Scripts\activate.bat
if errorlevel 1 (
    echo ERROR: Virtual environment not found!
    echo Please run 'setup-only.bat' first
    pause
    exit /b 1
)

echo.
echo Starting server...
echo.
echo ========================================
echo API Endpoints:
echo   • Main API: http://localhost:8000
echo   • Interactive Docs: http://localhost:8000/docs  
echo   • Alternative Docs: http://localhost:8000/redoc
echo ========================================
echo.
echo Press Ctrl+C to stop the server
echo.

uvicorn main:app --host 0.0.0.0 --port 8000 --reload

echo.
echo Server stopped.
pause
