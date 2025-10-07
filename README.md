# 🧠 AI Fashion Studio — Retrieval Microservice (`rec-svc`)

## 📘 Overview
The **Retrieval Service (rec-svc)** is a microservice that powers image-based and hybrid search for the AI Fashion Studio web app.  
It uses **CLIP (Contrastive Language-Image Pretraining)** to embed product images into a shared visual-text space, enabling users to search for similar styles visually.

This is part of the **AI Fashion Studio Capstone Project**, which integrates:
- Visual Search  
- Virtual Try-On (VTO)  
- Merchant Analytics  

**Team Members:**
- Mandeep Kaur (Team Lead, ML & Retrieval)
- Jimit Trivedi (Computer Vision & VTO Pipeline)
- Varinderpal Singh (Frontend, Next.js & CI/CD)
- Gunpreet Singh (Backend, Gateway & API Contracts)

## ⚙️ Features
- Image-to-Image Search using CLIP embeddings
- FAISS vector database for efficient top-K similarity queries
- REST API built with FastAPI
- Supports file uploads, returns ranked JSON results
- Rebuildable index from image dataset (`data/` folder)

## 🧩 Tech Stack
| Layer | Technology |
|-------|-------------|
| Framework | FastAPI |
| Model | OpenAI CLIP via SentenceTransformers |
| Vector DB | FAISS (Facebook AI Similarity Search) |
| Language | Python 3.13 |
| Libraries | NumPy, Pillow, python-multipart |
| Hosting | Local / Containerized / Render deployment-ready |

## 🧰 Setup Instructions

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/CodeGuni/Capstone.git
cd Capstone/rec-svc
```

### 2️⃣ Create and Activate Virtual Environment
```bash
python -m venv venv
venv\Scripts\activate       # on Windows
```

### 3️⃣ Install Dependencies
```bash
pip install -r requirements.txt
```

### 4️⃣ Build the FAISS Index
Place product images (e.g., jeans, shirts) inside the `data/` folder, then run:
```bash
python database.py
```

### 5️⃣ Start the API Server
```bash
uvicorn main:app --reload
```
Now open [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) to access the Swagger UI.

## 🧪 Example API Usage
**Endpoint:** `POST /search/image`  
**Request:** Upload an image file (e.g., `my_shirt.jpg`)  
**Response:**
```json
{
  "results": [
    {"id": 0, "score": 0.92, "path": "data/straight_jeans.jpg"},
    {"id": 1, "score": 0.87, "path": "data/flared_jeans.jpg"}
  ]
}
```

## 📊 Project Metrics (Targets)
| Metric | Goal |
|--------|------|
| hit@10 | +10% vs baseline |
| Search latency (p95) | < 800 ms |
| Accessibility (Lighthouse) | ≥ 90 |
| Ethics | Consent & auto-purge for uploads |

## 🧑‍💻 Developer Notes
- Rebuild the FAISS index whenever new images are added.  
- The service expects embeddings and `image_paths.npy` to exist before startup.  
- Future enhancements: add hybrid text-image retrieval and auto-rebuild fallback.
