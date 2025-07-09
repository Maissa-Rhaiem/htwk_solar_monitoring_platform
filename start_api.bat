@echo off
echo Setting TensorFlow compatibility environment...
set TF_ENABLE_ONEDNN_OPTS=0
set TF_CPP_MIN_LOG_LEVEL=2
set CUDA_VISIBLE_DEVICES=-1
set TF_FORCE_GPU_ALLOW_GROWTH=true
set TF_ENABLE_EAGER_EXECUTION=1

echo Starting API with your original model...
python -m uvicorn main:app --host 0.0.0.0 --port 8000
pause
