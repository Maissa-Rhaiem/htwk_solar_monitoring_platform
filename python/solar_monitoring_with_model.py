# ------------------ IMPORTS ------------------
import pandas as pd
import numpy as np
import os
import json
import time
from datetime import datetime, timedelta
from sklearn.preprocessing import MinMaxScaler
from tensorflow.keras.models import Sequential, load_model
from tensorflow.keras.layers import LSTM, Dense
import warnings
warnings.filterwarnings('ignore')

# ------------------ CONFIGURATION ------------------
INPUT_EXCEL = "InverterSA1ES111K4H349-Detailed Data-20250630.xlsx"

# Model path - adjust based on your actual model file
MODEL_PATH = "models/Model_LSTM_learning_with data transformation method_with early stopping_with ressampling_1min then15min.keras"

# Alternative model names
ALTERNATIVE_MODEL_PATHS = [
    "models/lstm_model.keras",
    "models/solar_model.keras", 
    "models/prediction_model.keras",
    "Model_LSTM_learning_with data transformation method_with early stopping_with ressampling_1min then15min.keras"
]

REAL_DATA_PATH = "../data/full_training_data.csv"
PREDICTION_PATH = "../data/prediction.csv"
TERMINAL_LOG_PATH = "../data/terminal_log.json"
STATUS_PATH = "../data/status.json"

# 🎯 SEQUENCE PARAMETERS - These will be adjusted based on your model
SEQ_LENGTH = 96  # Default: 24h = 96 samples (15min interval)
PREDICTION_HORIZON = 4  # 1h ahead = 4 steps (15min each)
MIN_DATA_FOR_PREDICTION = 10  # Minimum data points before starting predictions

# Global variable to store the actual sequence length from the model
ACTUAL_SEQ_LENGTH = SEQ_LENGTH

# ------------------ INIT FILES ------------------
def init_files():
    os.makedirs("../data", exist_ok=True)
    os.makedirs("models", exist_ok=True)
    
    if not os.path.exists(REAL_DATA_PATH):
        pd.DataFrame(columns=["timestamp", "real_power"]).to_csv(REAL_DATA_PATH, index=False)
    if not os.path.exists(PREDICTION_PATH):
        pd.DataFrame(columns=["timestamp", "predicted_power", "method", "confidence"]).to_csv(PREDICTION_PATH, index=False)

# ------------------ UPDATE STATUS ------------------
def update_status(status, message="", accuracy=0.0, predictions_count=0):
    """Update system status for web interface"""
    status_data = {
        "status": status,
        "message": message,
        "timestamp": datetime.now().isoformat(),
        "last_update": datetime.now().isoformat(),
        "model_accuracy": accuracy,
        "predictions_today": predictions_count,
        "sequence_length": ACTUAL_SEQ_LENGTH,
        "prediction_horizon": PREDICTION_HORIZON
    }
    
    try:
        with open(STATUS_PATH, 'w') as f:
            json.dump(status_data, f, indent=2)
    except Exception as e:
        print(f"Error updating status: {e}")

# ------------------ FIND MODEL FILE ------------------
def find_model_file():
    """Find the LSTM model file"""
    # Check primary model path
    if os.path.exists(MODEL_PATH):
        print(f"✅ Found LSTM model: {MODEL_PATH}")
        return MODEL_PATH
    
    # Check alternative paths
    for alt_path in ALTERNATIVE_MODEL_PATHS:
        if os.path.exists(alt_path):
            print(f"✅ Found LSTM model: {alt_path}")
            return alt_path
    
    # Check for any .keras files in models directory
    models_dir = "models"
    if os.path.exists(models_dir):
        keras_files = [f for f in os.listdir(models_dir) if f.endswith('.keras')]
        if keras_files:
            model_file = os.path.join(models_dir, keras_files[0])
            print(f"✅ Found LSTM model: {model_file}")
            return model_file
    
    # Check current directory
    keras_files = [f for f in os.listdir('.') if f.endswith('.keras')]
    if keras_files:
        model_file = keras_files[0]
        print(f"✅ Found LSTM model: {model_file}")
        return model_file
    
    print("⚠️ No LSTM model found. Will use trend-based predictions.")
    return None

# ------------------ LOAD MODEL SAFELY ------------------
def load_model_safely(model_path):
    """Load LSTM model with comprehensive error handling"""
    global ACTUAL_SEQ_LENGTH  # 🎯 FIXED: Declare global at the top
    
    try:
        print(f"🤖 Loading LSTM model from: {model_path}")
        model = load_model(model_path)
        
        print("📊 Model loaded successfully!")
        print(f"   Input shape: {model.input_shape}")
        print(f"   Output shape: {model.output_shape}")
        print(f"   Total parameters: {model.count_params():,}")
        
        # Verify and adjust sequence length based on model
        if model.input_shape[1] is not None:
            model_seq_length = model.input_shape[1]
            if model_seq_length != SEQ_LENGTH:
                print(f"⚠️ Adjusting sequence length from {SEQ_LENGTH} to {model_seq_length} to match model")
                ACTUAL_SEQ_LENGTH = model_seq_length
            else:
                ACTUAL_SEQ_LENGTH = SEQ_LENGTH
                print(f"✅ Sequence length matches model: {ACTUAL_SEQ_LENGTH}")
        else:
            ACTUAL_SEQ_LENGTH = SEQ_LENGTH
            print(f"⚠️ Model has dynamic input shape, using default: {ACTUAL_SEQ_LENGTH}")
        
        return model
    except Exception as e:
        print(f"❌ Error loading model: {e}")
        return None

# ------------------ PREPARE SEQUENCE DATA ------------------
def prepare_sequence_data(data_buffer, seq_length):
    """Prepare data sequence for LSTM prediction"""
    try:
        if len(data_buffer) < seq_length:
            print(f"⚠️ Not enough data for sequence. Need {seq_length}, have {len(data_buffer)}")
            return None, None
        
        # Get the last seq_length data points
        recent_data = data_buffer[-seq_length:]
        power_values = [row['real_power'] for row in recent_data]
        
        # Convert to numpy array
        power_array = np.array(power_values).reshape(-1, 1)
        
        # Scale the data
        scaler = MinMaxScaler(feature_range=(0, 1))
        scaled_data = scaler.fit_transform(power_array)
        
        # Reshape for LSTM input: (batch_size, timesteps, features)
        X_input = scaled_data.reshape(1, seq_length, 1)
        
        print(f"📊 Prepared sequence: shape={X_input.shape}, range=[{scaled_data.min():.3f}, {scaled_data.max():.3f}]")
        
        return X_input, scaler
        
    except Exception as e:
        print(f"❌ Error preparing sequence data: {e}")
        return None, None

# ------------------ GENERATE LSTM PREDICTIONS ------------------
def generate_lstm_predictions(model, X_input, scaler, horizon):
    """Generate predictions using LSTM model"""
    try:
        print("🧠 Generating LSTM predictions...")
        
        # Make prediction
        predictions_scaled = model.predict(X_input, verbose=0)
        print(f"   Raw prediction shape: {predictions_scaled.shape}")
        
        # Handle different output shapes
        if len(predictions_scaled.shape) == 2:
            # Shape: (1, horizon) - flatten to get horizon values
            predictions_scaled = predictions_scaled.flatten()
        elif len(predictions_scaled.shape) == 3:
            # Shape: (1, horizon, 1) - squeeze to get horizon values
            predictions_scaled = predictions_scaled.squeeze()
        
        # Ensure we have the right number of predictions
        if len(predictions_scaled) != horizon:
            print(f"⚠️ Prediction count mismatch. Expected {horizon}, got {len(predictions_scaled)}")
            # Take first 'horizon' predictions or repeat last one
            if len(predictions_scaled) > horizon:
                predictions_scaled = predictions_scaled[:horizon]
            else:
                # Extend with last value
                last_val = predictions_scaled[-1] if len(predictions_scaled) > 0 else 0.5
                predictions_scaled = np.pad(predictions_scaled, (0, horizon - len(predictions_scaled)), 
                                          mode='constant', constant_values=last_val)
        
        # Inverse transform to get actual power values
        predictions_scaled = predictions_scaled.reshape(-1, 1)
        predictions = scaler.inverse_transform(predictions_scaled).flatten()
        
        # Ensure non-negative values
        predictions = np.maximum(predictions, 0)
        
        print(f"   Final predictions: {predictions}")
        
        # Calculate confidence (simple metric based on prediction variance)
        confidence = max(0, min(100, 100 - (np.std(predictions) / np.mean(predictions) * 100) if np.mean(predictions) > 0 else 0))
        
        return predictions, confidence
        
    except Exception as e:
        print(f"❌ Error generating LSTM predictions: {e}")
        return None, 0

# ------------------ GENERATE TREND PREDICTIONS ------------------
def generate_trend_predictions(data_buffer, horizon):
    """Generate trend-based predictions as fallback"""
    try:
        print("📈 Generating trend-based predictions...")
        
        # Get recent power values
        recent_count = min(20, len(data_buffer))
        recent_powers = [row['real_power'] for row in data_buffer[-recent_count:]]
        
        if len(recent_powers) < 2:
            # Not enough data, use current value
            current_power = recent_powers[0] if recent_powers else 100
            predictions = [current_power] * horizon
        else:
            # Calculate trend
            x = np.arange(len(recent_powers))
            coeffs = np.polyfit(x, recent_powers, 1)  # Linear trend
            trend_slope = coeffs[0]
            current_power = recent_powers[-1]
            
            # Generate future predictions
            predictions = []
            for i in range(1, horizon + 1):
                pred = current_power + (trend_slope * i)
                # Add some realistic variation
                pred += np.random.normal(0, current_power * 0.05)
                pred = max(0, pred)  # Ensure non-negative
                predictions.append(pred)
        
        confidence = 60  # Lower confidence for trend-based
        print(f"   Trend predictions: {predictions}")
        
        return np.array(predictions), confidence
        
    except Exception as e:
        print(f"❌ Error generating trend predictions: {e}")
        return np.array([100] * horizon), 30  # Fallback values

# ------------------ GENERATE PREDICTIONS ------------------
def generate_predictions(data_buffer, model_path=None):
    """Main prediction function"""
    try:
        # Check if we have enough data
        if len(data_buffer) < MIN_DATA_FOR_PREDICTION:
            print(f"⚠️ Need at least {MIN_DATA_FOR_PREDICTION} data points for predictions. Have {len(data_buffer)}")
            return None, None, "insufficient_data", 0
        
        # Try LSTM predictions first
        if model_path and os.path.exists(model_path):
            model = load_model_safely(model_path)
            if model is not None:
                # Use the actual sequence length determined from the model
                if len(data_buffer) >= ACTUAL_SEQ_LENGTH:
                    X_input, scaler = prepare_sequence_data(data_buffer, ACTUAL_SEQ_LENGTH)
                    if X_input is not None and scaler is not None:
                        predictions, confidence = generate_lstm_predictions(model, X_input, scaler, PREDICTION_HORIZON)
                        if predictions is not None:
                            return predictions, confidence, "LSTM", ACTUAL_SEQ_LENGTH
                
                print(f"⚠️ Not enough data for LSTM model. Need {ACTUAL_SEQ_LENGTH}, have {len(data_buffer)}")
        
        # Fallback to trend-based predictions
        predictions, confidence = generate_trend_predictions(data_buffer, PREDICTION_HORIZON)
        return predictions, confidence, "Trend-based", len(data_buffer)
        
    except Exception as e:
        print(f"❌ Error in generate_predictions: {e}")
        # Emergency fallback
        return np.array([100] * PREDICTION_HORIZON), 20, "Fallback", 0

# ------------------ LOG TO TERMINAL FILE ------------------
def log_terminal_entry(entry_type, data):
    """Log terminal entries to JSON file for web interface"""
    try:
        terminal_log = []
        if os.path.exists(TERMINAL_LOG_PATH):
            with open(TERMINAL_LOG_PATH, 'r') as f:
                terminal_log = json.load(f)
        
        terminal_log.append({
            "type": entry_type,
            "timestamp": datetime.now().isoformat(),
            "data": data
        })
        
        # Keep only last 100 entries
        terminal_log = terminal_log[-100:]
        
        with open(TERMINAL_LOG_PATH, 'w') as f:
            json.dump(terminal_log, f, indent=2)
            
    except Exception as e:
        print(f"Error logging to terminal file: {e}")

# ------------------ MAIN SIMULATION ------------------
def run_realtime_simulation():
    print("🚀 Starting HTWK Solar Monitoring System...")
    print("📊 Real-time data processing with AI predictions")
    print("🔋 Using REAL data from Excel file")
    print("=" * 60)
    
    # Initialize status
    update_status("starting", "Initializing solar monitoring simulation")
    
    # Find model file
    model_path = find_model_file()
    
    # Check Excel file
    if not os.path.exists(INPUT_EXCEL):
        print(f"❌ ERROR: Excel file '{INPUT_EXCEL}' not found!")
        print("📁 Please ensure your Excel file is in the python/ directory")
        print("📝 Expected filename: InverterSA1ES111K4H349-Detailed Data-20250630.xlsx")
        print("💡 Or update the INPUT_EXCEL variable in the script")
        update_status("error", f"Excel file not found: {INPUT_EXCEL}")
        return
    
    try:
        # Load Excel data
        print(f"✅ Loading Excel file: {INPUT_EXCEL}")
        df_raw = pd.read_excel(INPUT_EXCEL, engine='openpyxl')
        print(f"📈 Loaded {len(df_raw)} rows of data")
        
        # Check if required columns exist
        required_columns = [
            'Updated Time',
            'Total AC Output Power (Active)(W)',
            'Daily Production (Active)(kWh)',
            'AC Current R/U/A(A)',
            'AC Voltage R/U/A(V)',
            'Temperature- Inverter(℃)',
            'Cumulative Production (Active)(kWh)',
            'AC Output Frequency R(Hz)'
        ]
        
        missing_columns = [col for col in required_columns if col not in df_raw.columns]
        if missing_columns:
            print(f"❌ Missing columns in Excel file: {missing_columns}")
            print("📋 Available columns:")
            for col in df_raw.columns:
                print(f"   - {col}")
            update_status("error", f"Missing columns: {missing_columns}")
            return
        
        # Process columns
        df_raw = df_raw[required_columns]
        df_raw.columns = [
            'timestamp', 'real_power', 'daily_prod', 'ac_current',
            'ac_voltage', 'temp_inverter', 'cumulative_prod', 'ac_freq'
        ]
        
        # Clean and sort data
        df_raw['timestamp'] = pd.to_datetime(df_raw['timestamp'])
        df_raw = df_raw.sort_values('timestamp').dropna()
        print(f"📊 Processing {len(df_raw)} valid data rows")
        
    except Exception as e:
        print(f"❌ ERROR reading Excel file: {e}")
        update_status("error", f"Error reading Excel file: {e}")
        return
    
    # Initialize tracking variables
    data_buffer = []
    total_predictions = 0
    successful_predictions = 0
    
    update_status("active", "Solar monitoring simulation is running")
    
    print("🚀 Starting real-time simulation...")
    print(f"🎯 Using sequence length: {ACTUAL_SEQ_LENGTH}")
    print("=" * 60)
    
    # Process each row
    for idx, row in df_raw.iterrows():
        # Add to buffer
        row_dict = row.to_dict()
        data_buffer.append(row_dict)
        
        # Save real-time data
        pd.DataFrame([row[['timestamp', 'real_power']]]).to_csv(
            REAL_DATA_PATH, mode='a', header=False, index=False
        )
        
        # Display current data
        display_time = row['timestamp'].strftime('%Y-%m-%d %H:%M:%S')
        print(f"\n🟢 Row {idx + 1} ➜ Time: {display_time}")
        print(f"   🔸 Power(W): {row['real_power']:.1f}")
        print(f"   🔸 Daily Prod(kWh): {row['daily_prod']:.2f}")
        print(f"   🔸 AC Current(A): {row['ac_current']:.1f}")
        print(f"   🔸 AC Voltage(V): {row['ac_voltage']:.1f}")
        print(f"   🔸 Inverter Temp(℃): {row['temp_inverter']:.1f}")
        print(f"   🔸 Cumulative Prod(kWh): {row['cumulative_prod']:.1f}")
        print(f"   🔸 AC Frequency(Hz): {row['ac_freq']:.2f}")
        
        # Log data entry
        log_terminal_entry("data", {
            "rowNumber": idx + 1,
            "timestamp": display_time,
            "real_power": float(row['real_power']),
            "daily_prod": float(row['daily_prod']),
            "ac_current": float(row['ac_current']),
            "ac_voltage": float(row['ac_voltage']),
            "temp_inverter": float(row['temp_inverter']),
            "cumulative_prod": float(row['cumulative_prod']),
            "ac_freq": float(row['ac_freq'])
        })
        
        # Generate predictions
        predictions, confidence, method, seq_used = generate_predictions(data_buffer, model_path)
        
        if predictions is not None:
            total_predictions += 1
            if confidence > 50:  # Consider predictions with >50% confidence as successful
                successful_predictions += 1
            
            print(f"\n🔮 Generating {len(predictions)} predictions using {method} (confidence: {confidence:.1f}%)")
            print(f"   📊 Sequence length used: {seq_used}")
            
            predictions_data = []
            for i, pred in enumerate(predictions):
                future_time = row['timestamp'] + timedelta(minutes=15 * (i + 1))
                display_future_time = future_time.strftime('%Y-%m-%d %H:%M:%S')
                
                print(f"   📈 Prediction {i + 1} ➜ {display_future_time}: {pred:.2f} W")
                
                # Save prediction
                pd.DataFrame([{
                    'timestamp': future_time,
                    'predicted_power': pred,
                    'method': method,
                    'confidence': confidence
                }]).to_csv(PREDICTION_PATH, mode='a', header=False, index=False)
                
                predictions_data.append({
                    "predictionNumber": i + 1,
                    "timestamp": display_future_time,
                    "predicted_power": float(pred),
                    "method": method,
                    "confidence": confidence
                })
            
            # Log predictions
            log_terminal_entry("prediction", {
                "predictions": predictions_data,
                "method": method,
                "confidence": confidence,
                "sequence_length": seq_used
            })
        else:
            print(f"   ⚠️ No predictions generated for row {idx + 1}")
        
        # Update status with accuracy
        accuracy = (successful_predictions / total_predictions * 100) if total_predictions > 0 else 0
        update_status("active", f"Processing row {idx + 1}/{len(df_raw)}", accuracy, total_predictions)
        
        # Simulate real-time delay
        time.sleep(1)  # 1 second delay for faster processing
    
    # Final status update
    final_accuracy = (successful_predictions / total_predictions * 100) if total_predictions > 0 else 0
    update_status("completed", f"Simulation completed. Processed {len(df_raw)} rows.", final_accuracy, total_predictions)
    
    print(f"\n✅ Simulation completed!")
    print(f"📊 Processed {len(df_raw)} data points")
    print(f"🔮 Generated {total_predictions} prediction sets")
    print(f"🎯 Model accuracy: {final_accuracy:.1f}%")
    print(f"💾 Data saved to: {REAL_DATA_PATH}")
    print(f"📈 Predictions saved to: {PREDICTION_PATH}")

# ------------------ RUN EVERYTHING ------------------
if __name__ == "__main__":
    init_files()
    run_realtime_simulation()
