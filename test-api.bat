@echo off
echo ========================================
echo Testing Power Prediction API
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
echo Running API tests...
python quick_test.py

echo.
pause
