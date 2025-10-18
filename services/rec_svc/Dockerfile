# ---- Base Image ----
FROM python:3.10-slim

# ---- Working Directory ----
WORKDIR /app

# ---- Copy All Files ----
COPY . .

# ✅ Explicitly copy data folder into Docker
COPY data ./data

# ---- Install Dependencies ----
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install python-multipart

# ---- Expose Port ----
EXPOSE 8001

# ---- Run FastAPI App ----
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8001"]
