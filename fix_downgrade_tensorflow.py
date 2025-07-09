"""Fix by using compatible TensorFlow version"""

import subprocess
import sys
import os

def check_tensorflow_version():
    """Check current TensorFlow version"""
    try:
        import tensorflow as tf
        print(f"📊 Current TensorFlow version: {tf.__version__}")
        return tf.__version__
    except ImportError:
        print("❌ TensorFlow not installed")
        return None

def install_compatible_tensorflow():
    """Install TensorFlow version compatible with your model"""
    
    print("🔄 Installing compatible TensorFlow version...")
    
    # TensorFlow versions that support batch_shape
    compatible_versions = [
        "tensorflow==2.10.0",
        "tensorflow==2.9.0", 
        "tensorflow==2.8.0"
    ]
    
    for version in compatible_versions:
        try:
            print(f"📦 Trying to install {version}...")
            
            # Uninstall current version
            subprocess.check_call([sys.executable, "-m", "pip", "uninstall", "tensorflow", "-y"])
            
            # Install compatible version
            subprocess.check_call([sys.executable, "-m", "pip", "install", version])
            
            # Test if it works
            import tensorflow as tf
            print(f"✅ Successfully installed TensorFlow {tf.__version__}")
            
            # Test loading your model
            try:
                model = tf.keras.models.load_model("models/best_model.keras")
                print("✅ Your original model loads successfully!")
                return True
            except Exception as e:
                print(f"⚠️ Model still doesn't load: {e}")
                continue
                
        except Exception as e:
            print(f"❌ Failed to install {version}: {e}")
            continue
    
    print("❌ No compatible TensorFlow version found")
    return False

def create_virtual_env_with_old_tf():
    """Create a separate environment with old TensorFlow"""
    
    print("🔧 Creating separate environment with compatible TensorFlow...")
    
    commands = [
        "python -m venv venv_old_tf",
        "venv_old_tf\\Scripts\\activate && pip install tensorflow==2.10.0",
        "venv_old_tf\\Scripts\\activate && pip install fastapi uvicorn pandas numpy scikit-learn scipy openpyxl"
    ]
    
    for cmd in commands:
        try:
            print(f"🔄 Running: {cmd}")
            os.system(cmd)
        except Exception as e:
            print(f"❌ Command failed: {e}")
    
    print("✅ Old TensorFlow environment created!")
    print("📝 To use it:")
    print("   1. venv_old_tf\\Scripts\\activate")
    print("   2. python -m uvicorn main:app --host 0.0.0.0 --port 8000")

if __name__ == "__main__":
    print("🚀 TensorFlow Compatibility Fix")
    print("=" * 40)
    
    current_version = check_tensorflow_version()
    
    if current_version:
        print(f"📊 You have TensorFlow {current_version}")
        
        # Try to load your model with current version
        try:
            import tensorflow as tf
            model = tf.keras.models.load_model("models/best_model.keras")
            print("✅ Your model already works with current TensorFlow!")
        except Exception as e:
            print(f"❌ Your model doesn't work with current version: {e}")
            
            choice = input("\n🤔 What would you like to do?\n1. Try compatible TensorFlow versions\n2. Create separate environment\n3. Exit\nChoice (1-3): ")
            
            if choice == "1":
                install_compatible_tensorflow()
            elif choice == "2":
                create_virtual_env_with_old_tf()
            else:
                print("👋 Exiting...")
