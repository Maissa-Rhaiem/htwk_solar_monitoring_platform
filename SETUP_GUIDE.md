# Power Prediction API - Complete Setup Guide for VS Code

## Prerequisites

Before starting, make sure you have:
- Python 3.8 or higher installed
- VS Code installed
- Git (optional, but recommended)

## Step 1: Check Python Installation

1. Open **Command Prompt** or **PowerShell** on Windows (or Terminal on Mac/Linux)
2. Check Python version:
   \`\`\`bash
   python --version
   \`\`\`
   or
   \`\`\`bash
   python3 --version
   \`\`\`
3. If Python is not installed, download it from [python.org](https://www.python.org/downloads/)

## Step 2: Create Project Directory

1. Open **File Explorer** and create a new folder:
   \`\`\`
   C:\PowerPredictionAPI
   \`\`\`
   (or any location you prefer)

2. Open **VS Code**
3. Go to **File > Open Folder** and select your `PowerPredictionAPI` folder

## Step 3: Set Up Project Structure

In VS Code, create the following folder structure:
\`\`\`
PowerPredictionAPI/
├── main.py
├── config.py
├── client_example.py
├── requirements.txt
├── Dockerfile
├── docker-compose.yml
├── run.bat (for Windows)
├── run.sh (for Mac/Linux)
├── models/
├── uploads/
└── outputs/
\`\`\`

## Step 4: Create Files

Copy all the code files from the previous response into your VS Code project:

1. Create `main.py` and paste the FastAPI code
2. Create `config.py` and paste the configuration code
3. Create `requirements.txt` and paste the dependencies
4. Create `client_example.py` for testing
5. Create the batch/shell scripts for easy execution

## Step 5: Create Virtual Environment

1. Open **Terminal** in VS Code (`Ctrl + ` ` or View > Terminal)
2. Create virtual environment:
   \`\`\`bash
   python -m venv venv
   \`\`\`

## Step 6: Activate Virtual Environment

**For Windows:**
\`\`\`bash
venv\Scripts\activate
\`\`\`

**For Mac/Linux:**
\`\`\`bash
source venv/bin/activate
\`\`\`

You should see `(venv)` at the beginning of your terminal prompt.

## Step 7: Install Dependencies

With the virtual environment activated, install required packages:
\`\`\`bash
pip install -r requirements.txt
\`\`\`

This will install:
- FastAPI
- Uvicorn
- Pandas
- NumPy
- Scikit-learn
- TensorFlow
- And other dependencies

## Step 8: Create Required Directories

In VS Code terminal, create the necessary directories:
\`\`\`bash
mkdir models uploads outputs
\`\`\`

## Step 9: Add Your Model File

1. Copy your `best_model.keras` file (or whatever your model is named)
2. Place it in the `models/` folder
3. If your model has a different name, update the `MODEL_PATH` in `config.py`

## Step 10: Run the API

In VS Code terminal (with virtual environment activated):
\`\`\`bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
\`\`\`

You should see output like:
\`\`\`
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Model loaded successfully from models/best_model.keras
INFO:     Application startup complete.
\`\`\`

## Step 11: Test the API

1. Open your web browser
2. Go to: `http://localhost:8000`
3. You should see a JSON response with API information

4. For interactive documentation, go to: `http://localhost:8000/docs`

## Step 12: Test with Your Excel File

1. Prepare your Excel file (similar to the one you used in Colab)
2. Use the interactive docs at `/docs` to upload and test, OR
3. Use the Python client example (see next step)

## Step 13: Use Python Client (Optional)

1. Update `client_example.py` with your Excel file path
2. In a new terminal (with venv activated):
   \`\`\`bash
   python client_example.py
   \`\`\`

## Troubleshooting Common Issues

### Issue 1: Python not found
**Solution:** Make sure Python is installed and added to PATH

### Issue 2: Virtual environment not activating
**Windows Solution:**
\`\`\`bash
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
\`\`\`

### Issue 3: TensorFlow installation issues
**Solution:** Try installing TensorFlow separately:
\`\`\`bash
pip install tensorflow==2.15.0
\`\`\`

### Issue 4: Model not loading
**Solution:** 
- Check if model file exists in `models/` folder
- Verify model file is not corrupted
- Check file permissions

### Issue 5: Port already in use
**Solution:** Use a different port:
\`\`\`bash
uvicorn main:app --host 0.0.0.0 --port 8001 --reload
\`\`\`

## VS Code Extensions (Recommended)

Install these VS Code extensions for better development experience:
1. **Python** (Microsoft)
2. **Pylance** (Microsoft)
3. **REST Client** (for testing API endpoints)
4. **Thunder Client** (alternative API testing tool)

## Testing the API Endpoints

### Using VS Code REST Client Extension

Create a file called `test_api.http`:
```http
### Test API Status
GET http://localhost:8000/

### Upload Excel File for Prediction
POST http://localhost:8000/predict
Content-Type: multipart/form-data; boundary=boundary

--boundary
Content-Disposition: form-data; name="file"; filename="your_data.xlsx"
Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet

< ./your_data.xlsx
--boundary--

### Check Job Status (replace with actual job_id)
GET http://localhost:8000/status/your-job-id-here

### Download Results (replace with actual job_id)
GET http://localhost:8000/download/your-job-id-here
