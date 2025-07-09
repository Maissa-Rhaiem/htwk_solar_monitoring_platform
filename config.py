import os
from pathlib import Path

class Config:
    # Model configuration
    MODEL_PATH = os.getenv("MODEL_PATH", "models/best_model.keras")
    SEQ_LENGTH = int(os.getenv("SEQ_LENGTH", "96"))
    
    # File paths
    UPLOAD_DIR = Path("uploads")
    OUTPUT_DIR = Path("outputs")
    MODEL_DIR = Path("models")
    
    # API configuration
    HOST = os.getenv("HOST", "0.0.0.0")
    PORT = int(os.getenv("PORT", "8000"))
    DEBUG = os.getenv("DEBUG", "False").lower() == "true"
    
    # File size limits (in bytes)
    MAX_FILE_SIZE = int(os.getenv("MAX_FILE_SIZE", "100000000"))  # 100MB
    
    # Job cleanup (hours)
    JOB_RETENTION_HOURS = int(os.getenv("JOB_RETENTION_HOURS", "24"))
    
    @classmethod
    def create_directories(cls):
        """Create necessary directories"""
        cls.UPLOAD_DIR.mkdir(exist_ok=True)
        cls.OUTPUT_DIR.mkdir(exist_ok=True)
        cls.MODEL_DIR.mkdir(exist_ok=True)
