# PowerShell startup script
Write-Host "Setting TensorFlow compatibility environment..." -ForegroundColor Green

$env:TF_ENABLE_ONEDNN_OPTS = "0"
$env:TF_CPP_MIN_LOG_LEVEL = "2" 
$env:CUDA_VISIBLE_DEVICES = "-1"
$env:TF_FORCE_GPU_ALLOW_GROWTH = "true"
$env:TF_ENABLE_EAGER_EXECUTION = "1"

Write-Host "Starting API with your original model..." -ForegroundColor Green
python -m uvicorn main:app --host 0.0.0.0 --port 8000
