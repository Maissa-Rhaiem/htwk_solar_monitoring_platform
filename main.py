# ------------------ IMPORTS ------------------
import pandas as pd
import numpy as np
import os
from datetime import timedelta
from sklearn.preprocessing import MinMaxScaler
from tensorflow.keras.models import Sequential, load_model
from tensorflow.keras.layers import LSTM, Dense

# ------------------ CONFIGURATION ------------------
INPUT_EXCEL = "InverterSA1ES111K4H349-Detailed Data-20250630.xlsx"
MODEL_PATH = "Model_LSTM_learning_with data transformation method_with early stopping_with ressampling_1min then15min.keras"
REAL_DATA_PATH = "full_training_data.csv"
PREDICTION_PATH = "prediction.csv"
SEQ_LENGTH = 96  # 24h = 96 samples (15min interval)
PREDICTION_HORIZON = 4  # 1h ahead = 4 steps

# ------------------ INIT FILES ------------------
def init_files():
    os.makedirs("Prediction", exist_ok=True)
    if not os.path.exists(REAL_DATA_PATH):
        pd.DataFrame(columns=["timestamp", "real_power"]).to_csv(REAL_DATA_PATH, index=False)
    if not os.path.exists(PREDICTION_PATH):
        pd.DataFrame(columns=["timestamp", "predicted_power"]).to_csv(PREDICTION_PATH, index=False)

# ------------------ CREATE SEQUENCES ------------------
def create_sequences(values, seq_length, horizon):
    X, y = [], []
    for i in range(len(values) - seq_length - horizon + 1):
        X.append(values[i:i + seq_length])
        y.append(values[i + seq_length:i + seq_length + horizon])
    return np.array(X), np.array(y)

# ------------------ RETRAIN MODEL ------------------
def retrain_model():
    df = pd.read_csv(REAL_DATA_PATH)
    if len(df) < SEQ_LENGTH + PREDICTION_HORIZON:
        print("⚠️ Not enough data to retrain.")
        return

    df['timestamp'] = pd.to_datetime(df['timestamp'])
    values = df['real_power'].values
    scaler = MinMaxScaler()
    scaled = scaler.fit_transform(values.reshape(-1, 1))

    X, y = create_sequences(scaled, SEQ_LENGTH, PREDICTION_HORIZON)
    X = X.reshape(-1, SEQ_LENGTH, 1)
    y = y.reshape(-1, PREDICTION_HORIZON)

    if os.path.exists(MODEL_PATH):
        model = load_model(MODEL_PATH)

   
    print("🔁✅ Model retrained after 24 hours of data.\n")

# ------------------ REAL-TIME SIMULATION ------------------
def run_realtime_simulation():
    df_raw = pd.read_excel(INPUT_EXCEL, engine='openpyxl')

    df_raw = df_raw[[
        'Updated Time',
        'Total AC Output Power (Active)(W)',
        'Daily Production (Active)(kWh)',
        'AC Current R/U/A(A)',
        'AC Voltage R/U/A(V)',
        'Temperature- Inverter(℃)',
        'Cumulative Production (Active)(kWh)',
        'AC Output Frequency R(Hz)'
    ]]
    df_raw.columns = [
        'timestamp',
        'real_power',
        'daily_prod',
        'ac_current',
        'ac_voltage',
        'temp_inverter',
        'cumulative_prod',
        'ac_freq'
    ]

    df_raw['timestamp'] = pd.to_datetime(df_raw['timestamp'])
    df_raw = df_raw.sort_values('timestamp')

    buffer = []
    retrained = False

    for idx, row in df_raw.iterrows():
        buffer.append(row)
        pd.DataFrame([row[['timestamp', 'real_power']]]).to_csv(REAL_DATA_PATH, mode='a', header=False, index=False)

        print(f"\n🟢 Row {idx + 1} ➜ Time: {row['timestamp']}")
        print(f"   🔸 Power(W): {row['real_power']}")
        print(f"   🔸 Daily Prod(kWh): {row['daily_prod']}")
        print(f"   🔸 AC Current(A): {row['ac_current']}")
        print(f"   🔸 AC Voltage(V): {row['ac_voltage']}")
        print(f"   🔸 Inverter Temp(℃): {row['temp_inverter']}")
        print(f"   🔸 Cumulative Prod(kWh): {row['cumulative_prod']}")
        print(f"   🔸 AC Frequency(Hz): {row['ac_freq']}")

        if len(buffer) >= SEQ_LENGTH:
            df_buffer = pd.DataFrame(buffer[-SEQ_LENGTH:])
            scaler = MinMaxScaler()
            scaled = scaler.fit_transform(df_buffer['real_power'].values.reshape(-1, 1))
            X_input = scaled.reshape(1, SEQ_LENGTH, 1)

            model = load_model(MODEL_PATH)
            preds_scaled = model.predict(X_input, verbose=0).flatten()
            preds = scaler.inverse_transform(preds_scaled.reshape(-1, 1)).flatten()

            for i, pred in enumerate(preds):
                future_time = row['timestamp'] + timedelta(minutes=15 * (i + 1))
                print(f"\n📈 Prediction {i + 1} ➜ {future_time}")
                print(f"   🔮 Predicted Power: {pred:.2f} W")
                pd.DataFrame([{
                    'timestamp': future_time,
                    'predicted_power': pred
                }]).to_csv(PREDICTION_PATH, mode='a', header=False, index=False)

        if not retrained and len(buffer) == SEQ_LENGTH:
            retrain_model()
            retrained = True

# ------------------ RUN EVERYTHING ------------------
if __name__ == "__main__":
    init_files()
    run_realtime_simulation()
