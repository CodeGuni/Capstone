FROM python:3.10-slim
WORKDIR /app

# Install deps first (keeps image cache efficient)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt && \
    pip install --no-cache-dir python-multipart

# Copy app code and data
COPY . .
COPY data ./data

# ✅ Copy pre-downloaded model into the image
# (ensure models/clip-vit-base-patch32 exists in your repo)
COPY models ./models

# ✅ Force offline: no network calls at runtime
ENV TRANSFORMERS_OFFLINE=1 HF_HUB_OFFLINE=1

EXPOSE 8001
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8001"]
