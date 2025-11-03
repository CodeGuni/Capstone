FROM python:3.11-slim

# System dependencies for Torch + FAISS
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libgl1 \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python dependencies first (takes time, so cache-layers)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy app code
COPY . .

# Optional: attempt to build index at build time
RUN python - <<'PY' || true
from clip_index import build_index
try:
    build_index()
    print("✅ FAISS index built successfully inside container")
except Exception as e:
    print("⚠️  Skipping index build:", e)
PY

EXPOSE 8001

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8001"]
