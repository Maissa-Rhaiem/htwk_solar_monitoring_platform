"""
PowerAI Model Diagnostic Tool
This script will help identify why your model is not loading
"""
import os
import sys
import traceback
from pathlib import Path

def check_python_environment():
    """Check Python and package versions"""
    print("🔍 PYTHON ENVIRONMENT CHECK")
    print("=" * 50)
    print(f"Python version: {sys.version}")
    print(f"Python executable: {sys.executable}")
    
    # Check required packages
    required_packages = [
        'tensorflow', 'keras', 'numpy', 'pandas', 
        'scikit-learn', 'scipy', 'fastapi', 'uvicorn'
    ]
    
    for package in required_packages:
        try:
            module = __import__(package)
            version = getattr(module, '__version__', 'Unknown')
            print(f"✅ {package}: {version}")
        except ImportError:
            print(f"❌ {package}: NOT INSTALLED")
        except Exception as e:
            print(f"⚠️ {package}: ERROR - {e}")

def check_model_files():
    """Check for model files in common locations"""
    print("\n🔍 MODEL FILES CHECK")
    print("=" * 50)
    
    # Common model file locations
    model_paths = [
        "models/best_model.keras",
        "models/best_model.h5",
        "best_model.keras",
        "best_model.h5",
        "model.keras",
        "model.h5",
        "models/model.keras",
        "models/model.h5"
    ]
    
    found_models = []
    
    for path in model_paths:
        if os.path.exists(path):
            size = os.path.getsize(path) / (1024 * 1024)  # MB
            print(f"✅ Found: {path} ({size:.1f} MB)")
            found_models.append(path)
        else:
            print(f"❌ Not found: {path}")
    
    # Search for any .keras or .h5 files
    print("\n🔍 Searching for any model files...")
    current_dir = Path(".")
    keras_files = list(current_dir.rglob("*.keras"))
    h5_files = list(current_dir.rglob("*.h5"))
    
    if keras_files:
        print("📁 Found .keras files:")
        for file in keras_files:
            size = file.stat().st_size / (1024 * 1024)
            print(f"   {file} ({size:.1f} MB)")
    
    if h5_files:
        print("📁 Found .h5 files:")
        for file in h5_files:
            size = file.stat().st_size / (1024 * 1024)
            print(f"   {file} ({size:.1f} MB)")
    
    return found_models + [str(f) for f in keras_files + h5_files]

def test_model_loading(model_path):
    """Test loading a specific model"""
    print(f"\n🔍 TESTING MODEL: {model_path}")
    print("=" * 50)
    
    if not os.path.exists(model_path):
        print(f"❌ File does not exist: {model_path}")
        return False
    
    try:
        # Method 1: Standard loading
        print("🔄 Attempting standard loading...")
        import tensorflow as tf
        from tensorflow import keras
        
        model = keras.models.load_model(model_path)
        print("✅ Standard loading successful!")
        print(f"Model summary:")
        model.summary()
        return True
        
    except Exception as e1:
        print(f"❌ Standard loading failed: {e1}")
        
        try:
            # Method 2: Load without compilation
            print("🔄 Attempting loading without compilation...")
            model = keras.models.load_model(model_path, compile=False)
            print("✅ Loading without compilation successful!")
            
            # Try to recompile
            model.compile(optimizer='adam', loss='mse', metrics=['mae'])
            print("✅ Model recompiled successfully!")
            print(f"Model summary:")
            model.summary()
            return True
            
        except Exception as e2:
            print(f"❌ Loading without compilation failed: {e2}")
            
            try:
                # Method 3: Check if it's a SavedModel format
                print("🔄 Attempting SavedModel loading...")
                model = tf.saved_model.load(model_path)
                print("✅ SavedModel loading successful!")
                return True
                
            except Exception as e3:
                print(f"❌ SavedModel loading failed: {e3}")
                print(f"\n🔍 Full error traceback:")
                traceback.print_exc()
                return False

def check_tensorflow_gpu():
    """Check TensorFlow GPU availability"""
    print("\n🔍 TENSORFLOW GPU CHECK")
    print("=" * 50)
    
    try:
        import tensorflow as tf
        print(f"TensorFlow version: {tf.__version__}")
        print(f"Keras version: {tf.keras.__version__}")
        
        # Check GPU
        gpus = tf.config.list_physical_devices('GPU')
        if gpus:
            print(f"✅ GPU available: {len(gpus)} device(s)")
            for i, gpu in enumerate(gpus):
                print(f"   GPU {i}: {gpu}")
        else:
            print("⚠️ No GPU detected (using CPU)")
        
        # Check if TensorFlow can create tensors
        test_tensor = tf.constant([1, 2, 3])
        print(f"✅ TensorFlow working: {test_tensor}")
        
    except Exception as e:
        print(f"❌ TensorFlow error: {e}")

def suggest_solutions():
    """Suggest solutions based on common issues"""
    print("\n💡 COMMON SOLUTIONS")
    print("=" * 50)
    print("1. 🔧 Model file path issue:")
    print("   - Check if model file exists in 'models/' directory")
    print("   - Update model path in your main.py file")
    print()
    print("2. 🔧 TensorFlow version compatibility:")
    print("   - Try: pip install tensorflow==2.15.0")
    print("   - Or: pip install tensorflow --upgrade")
    print()
    print("3. 🔧 Model format issue:")
    print("   - Convert .h5 to .keras format")
    print("   - Use compile=False when loading")
    print()
    print("4. 🔧 Dependencies issue:")
    print("   - pip install -r requirements.txt")
    print("   - Check all packages are installed")
    print()
    print("5. 🔧 Model architecture issue:")
    print("   - Model might be corrupted")
    print("   - Try loading with custom_objects=None")

def main():
    """Main diagnostic function"""
    print("🚀 POWERAI MODEL DIAGNOSTIC TOOL")
    print("=" * 60)
    
    # Step 1: Check Python environment
    check_python_environment()
    
    # Step 2: Check TensorFlow
    check_tensorflow_gpu()
    
    # Step 3: Find model files
    model_files = check_model_files()
    
    # Step 4: Test loading each found model
    if model_files:
        print(f"\n🔍 TESTING {len(model_files)} MODEL FILE(S)")
        print("=" * 50)
        
        for model_path in model_files:
            success = test_model_loading(model_path)
            if success:
                print(f"✅ WORKING MODEL FOUND: {model_path}")
                break
        else:
            print("❌ No working models found")
    else:
        print("\n❌ NO MODEL FILES FOUND!")
    
    # Step 5: Suggest solutions
    suggest_solutions()
    
    print("\n" + "=" * 60)
    print("🔍 Diagnosis complete! Check the results above.")
    print("📧 Share this output to get specific help.")

if __name__ == "__main__":
    main()
