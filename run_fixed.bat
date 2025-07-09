@echo off
echo ========================================
echo Power Prediction API - Fixed Version
echo ========================================
echo.

echo Activating virtual environment...
call venv\Scripts\activate.bat

echo.
echo Starting API with model compatibility fixes...
echo.
echo ========================================
echo API Endpoints:
echo   • Main API: http://localhost:8000
echo   • Interactive Docs: http://localhost:8000/docs
echo ========================================
echo.

uvicorn main_fixed:app --host 0.0.0.0 --port 8000 --reload

pause
