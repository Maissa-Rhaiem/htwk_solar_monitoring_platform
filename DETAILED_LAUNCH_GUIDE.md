# DETAILED STEP-BY-STEP LAUNCH GUIDE

## STEP 1: CREATE THE PROJECT FOLDER

1. **Open File Explorer** (Windows key + E)
2. **Navigate to your Desktop** or any location you prefer
3. **Right-click** in empty space
4. **Select "New" → "Folder"**
5. **Name the folder**: `PowerPredictionAPI`
6. **Press Enter**

## STEP 2: DOWNLOAD AND SAVE ALL FILES

1. **Open the folder** you just created (`PowerPredictionAPI`)
2. **Create these files** by copying the code from the previous responses:

### Files you need to create:
- `main.py` (copy the FastAPI code)
- `requirements.txt` (copy the dependencies list)
- `config.py` (copy the configuration code)
- `client_example.py` (copy the client code)
- `run.bat` (copy the batch script)
- `quick_test.py` (copy the test script)

### How to create each file:
1. **Right-click** inside the PowerPredictionAPI folder
2. **Select "New" → "Text Document"**
3. **Rename** the file (e.g., change "New Text Document.txt" to "main.py")
4. **Double-click** the file to open it
5. **Copy and paste** the corresponding code
6. **Save** the file (Ctrl + S)
7. **Repeat** for all files

## STEP 3: INSTALL PYTHON (IF NOT INSTALLED)

1. **Open Command Prompt**:
   - Press **Windows key + R**
   - Type `cmd`
   - Press **Enter**

2. **Check if Python is installed**:
   - Type: `python --version`
   - Press **Enter**

3. **If you see a version number** (like Python 3.9.0), Python is installed ✅
4. **If you get an error**, you need to install Python:
   - Go to [https://www.python.org/downloads/](https://www.python.org/downloads/)
   - Click **"Download Python"** (big yellow button)
   - **Run the installer**
   - **IMPORTANT**: Check "Add Python to PATH" during installation
   - Click **"Install Now"**

## STEP 4: OPEN VS CODE

1. **Download VS Code** if you don't have it: [https://code.visualstudio.com/](https://code.visualstudio.com/)
2. **Install VS Code**
3. **Open VS Code**
4. **Open your project folder**:
   - Click **"File" → "Open Folder"**
   - Navigate to your `PowerPredictionAPI` folder
   - Click **"Select Folder"**

## STEP 5: LAUNCH THE API (EASIEST METHOD)

### Method A: Using the Batch File (Windows)

1. **In VS Code**, you should see your files in the left panel
2. **Find the file** called `run.bat`
3. **Right-click** on `run.bat`
4. **Select "Reveal in File Explorer"**
5. **In File Explorer**, **double-click** `run.bat`
6. **A black window (Command Prompt) will open**
7. **Wait** for it to finish (you'll see messages about installing packages)
8. **When you see** "Uvicorn running on http://0.0.0.0:8000", it's ready! ✅

### Method B: Using VS Code Terminal (Alternative)

1. **In VS Code**, open the terminal:
   - Press **Ctrl + `** (backtick key)
   - Or go to **"View" → "Terminal"**

2. **Type these commands one by one** (press Enter after each):
   \`\`\`
   python -m venv venv
   \`\`\`
   Wait for it to finish, then:
   \`\`\`
   venv\Scripts\activate
   \`\`\`
   You should see `(venv)` at the beginning of the line, then:
   \`\`\`
   pip install -r requirements.txt
   \`\`\`
   Wait for all packages to install (this takes a few minutes), then:
   \`\`\`
   mkdir models uploads outputs
   \`\`\`
   Finally:
   \`\`\`
   uvicorn main:app --host 0.0.0.0 --port 8000 --reload
   \`\`\`

## STEP 6: ADD YOUR MODEL FILE

1. **Copy your model file** (the .keras file from your Google Colab)
2. **Paste it** into the `models` folder inside your PowerPredictionAPI folder
3. **Make sure** the file is named `best_model.keras` (or update the name in config.py)

## STEP 7: TEST THE API

1. **Open your web browser** (Chrome, Firefox, Edge, etc.)
2. **Go to**: `http://localhost:8000`
3. **You should see** a JSON response like:
   \`\`\`json
   {
     "message": "Power Prediction API",
     "version": "1.0.0",
     "status": "running",
     "model_loaded": true
   }
   \`\`\`

4. **For the interactive interface**, go to: `http://localhost:8000/docs`

## STEP 8: UPLOAD YOUR EXCEL FILE

1. **Go to**: `http://localhost:8000/docs`
2. **Find the section** that says "POST /predict"
3. **Click** "Try it out"
4. **Click** "Choose File" and select your Excel file
5. **Click** "Execute"
6. **You'll get a response** with a job_id
7. **Copy the job_id**

## STEP 9: CHECK PROGRESS

1. **Find the section** "GET /status/{job_id}"
2. **Click** "Try it out"
3. **Paste your job_id** in the text box
4. **Click** "Execute"
5. **Keep checking** until status shows "completed"

## STEP 10: DOWNLOAD RESULTS

1. **Find the section** "GET /download/{job_id}"
2. **Click** "Try it out"
3. **Paste your job_id**
4. **Click** "Execute"
5. **Click** "Download file" to get your predictions

## TROUBLESHOOTING

### Problem: "Python is not recognized"
**Solution**: 
1. Reinstall Python from python.org
2. Make sure to check "Add Python to PATH"

### Problem: "pip is not recognized"
**Solution**: 
1. Close command prompt
2. Reopen command prompt
3. Try again

### Problem: "Permission denied"
**Solution**: 
1. Right-click Command Prompt
2. Select "Run as administrator"

### Problem: "Port 8000 is already in use"
**Solution**: 
1. Change the port in the command:
   \`\`\`
   uvicorn main:app --host 0.0.0.0 --port 8001 --reload
   \`\`\`
2. Then use `http://localhost:8001` instead

### Problem: "Model not found"
**Solution**: 
1. Make sure your .keras file is in the `models` folder
2. Check the filename matches what's in config.py

## WHAT YOU SHOULD SEE

### When API starts successfully:
\`\`\`
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process [28720]
INFO:     Started server process [28720]
INFO:     Waiting for application startup.
INFO:     Model loaded successfully from models/best_model.keras
INFO:     Application startup complete.
\`\`\`

### When you visit http://localhost:8000:
\`\`\`json
{
  "message": "Power Prediction API",
  "version": "1.0.0", 
  "status": "running",
  "model_loaded": true
}
\`\`\`

## NEED HELP?

If you're still stuck:
1. Take a screenshot of any error messages
2. Tell me exactly which step you're having trouble with
3. Copy and paste any error text you see
\`\`\`

```batch file="SIMPLE_START.bat"
@echo off
title Power Prediction API Launcher
color 0A

echo.
echo  ╔══════════════════════════════════════════════════════════════╗
echo  ║                 POWER PREDICTION API LAUNCHER                ║
echo  ╚══════════════════════════════════════════════════════════════╝
echo.

echo  [INFO] This script will set up and launch your API automatically
echo  [INFO] Please wait while we prepare everything...
echo.

REM Check if Python is installed
echo  [1/7] Checking Python installation...
python --version >nul 2>&1
if errorlevel 1 (
    echo  [ERROR] Python not found!
    echo  [HELP] Please install Python from: https://www.python.org/downloads/
    echo  [HELP] Make sure to check 'Add Python to PATH' during installation
    echo.
    pause
    exit /b 1
)
echo  [OK] Python is installed ✓

REM Create virtual environment
echo  [2/7] Creating virtual environment...
if not exist "venv" (
    python -m venv venv
    if errorlevel 1 (
        echo  [ERROR] Failed to create virtual environment
        pause
        exit /b 1
    )
    echo  [OK] Virtual environment created ✓
) else (
    echo  [OK] Virtual environment already exists ✓
)

REM Activate virtual environment
echo  [3/7] Activating virtual environment...
call venv\Scripts\activate.bat
if errorlevel 1 (
    echo  [ERROR] Failed to activate virtual environment
    pause
    exit /b 1
)
echo  [OK] Virtual environment activated ✓

REM Install dependencies
echo  [4/7] Installing required packages (this may take a few minutes)...
pip install -r requirements.txt --quiet --disable-pip-version-check
if errorlevel 1 (
    echo  [ERROR] Failed to install packages
    echo  [HELP] Check your internet connection and try again
    pause
    exit /b 1
)
echo  [OK] All packages installed ✓

REM Create directories
echo  [5/7] Creating necessary folders...
if not exist "models" mkdir models
if not exist "uploads" mkdir uploads
if not exist "outputs" mkdir outputs
echo  [OK] Folders created ✓

REM Check for model file
echo  [6/7] Checking for model file...
if exist "models\*.keras" (
    echo  [OK] Model file found ✓
) else (
    echo  [WARNING] No model file found in 'models' folder
    echo  [HELP] Please copy your .keras model file to the 'models' folder
    echo  [HELP] The API will still start, but predictions won't work without a model
)

REM Start the API
echo  [7/7] Starting API server...
echo.
echo  ╔══════════════════════════════════════════════════════════════╗
echo  ║                        API IS STARTING                       ║
echo  ╠══════════════════════════════════════════════════════════════╣
echo  ║  Main API: http://localhost:8000                             ║
echo  ║  Interactive Docs: http://localhost:8000/docs                ║
echo  ║  Alternative Docs: http://localhost:8000/redoc               ║
echo  ╠══════════════════════════════════════════════════════════════╣
echo  ║  Press Ctrl+C to stop the server                            ║
echo  ╚══════════════════════════════════════════════════════════════╝
echo.

REM Start the server
uvicorn main:app --host 0.0.0.0 --port 8000 --reload

echo.
echo  [INFO] Server stopped
pause
