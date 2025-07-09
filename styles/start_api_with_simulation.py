import subprocess
import sys
import time
import threading
import os

def start_fastapi_server():
    """Start the FastAPI server"""
    print("🚀 Starting FastAPI server...")
    try:
        subprocess.run([sys.executable, "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"])
    except KeyboardInterrupt:
        print("🛑 FastAPI server stopped")

def start_simulation():
    """Start the simulation after a delay"""
    print("⏳ Waiting 5 seconds before starting simulation...")
    time.sleep(5)
    print("🔄 Starting simulation...")
    try:
        subprocess.run([sys.executable, "main_fixed.py"])
    except KeyboardInterrupt:
        print("🛑 Simulation stopped")

if __name__ == "__main__":
    print("🌞 Starting HTWK Solar Monitoring Platform")
    print("=" * 50)
    
    # Start FastAPI server in background
    api_thread = threading.Thread(target=start_fastapi_server, daemon=True)
    api_thread.start()
    
    # Start simulation
    start_simulation()
