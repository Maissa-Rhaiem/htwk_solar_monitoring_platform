import subprocess
import sys
import os

def fix_protobuf_tensorflow_conflict():
    """Fix protobuf and TensorFlow version conflict"""
    
    print("🔧 Fixing protobuf 'builder' import error...")
    
    # Step 1: Check current versions
    try:
        import google.protobuf
        print(f"📊 Current protobuf version: {google.protobuf.__version__}")
    except ImportError:
        print("❌ Protobuf not installed or broken")
    
    # Step 2: Fix the versions with specific compatible versions
    print("\n🔄 Installing compatible versions...")
    
    commands = [
        # Uninstall conflicting packages
        [sys.executable, "-m", "pip", "uninstall", "protobuf", "-y"],
        [sys.executable, "-m", "pip", "uninstall", "tensorflow", "-y"],
        
        # Clear pip cache
        [sys.executable, "-m", "pip", "cache", "purge"],
        
        # Install specific compatible versions
        [sys.executable, "-m", "pip", "install", "protobuf==3.20.3"],
        [sys.executable, "-m", "pip", "install", "tensorflow==2.10.0"],
        
        # Reinstall other dependencies
        [sys.executable, "-m", "pip", "install", "fastapi", "uvicorn", "pandas", "numpy", "scikit-learn", "scipy", "openpyxl", "python-multipart"]
    ]
    
    for cmd in commands:
        try:
            print(f"🔄 Running: {' '.join(cmd)}")
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=300)
            if result.returncode != 0:
                print(f"⚠️ Warning: {result.stderr}")
        except Exception as e:
            print(f"❌ Error: {e}")
    
    print("\n✅ Installation complete!")
    
    # Step 3: Test the fix
    print("🧪 Testing the fix...")
    try:
        import tensorflow as tf
        print(f"✅ TensorFlow {tf.__version__} imported successfully!")
        return True
        
    except Exception as e:
        print(f"❌ Still failed: {e}")
        return False

if __name__ == "__main__":
    print("🚀 TensorFlow Protobuf 'builder' Error Fix")
    print("=" * 50)
    
    success = fix_protobuf_tensorflow_conflict()
    
    if success:
        print("\n🎉 SUCCESS! Your environment is fixed!")
        print("📝 You can now run: python main.py")
    else:
        print("\n❌ Fix failed. Trying alternative method...")
        print("📝 Manual fix commands:")
        print("pip uninstall protobuf tensorflow -y")
        print("pip install protobuf==3.20.3")
        print("pip install tensorflow==2.10.0")

