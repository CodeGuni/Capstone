# app.py
from fastapi import FastAPI, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import faiss, os, pickle, glob, numpy as np
from PIL import Image
from model_utils import get_image_embedding, get_text_embedding

from fastapi.openapi.docs import get_swagger_ui_html

app = FastAPI(
    title="AI Fashion Retrieval Service",
    docs_url=None,            # disable default /docs
    redoc_url="/redoc",       # keep ReDoc as fallback
    openapi_url="/openapi.json",
)

@app.get("/docs", include_in_schema=False)
def custom_swagger_ui():
    return get_swagger_ui_html(
        openapi_url="/openapi.json",
        title="AI Fashion Docs",
        swagger_js_url="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js",
        swagger_css_url="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui.css",
    )


# Allow requests from frontend / other ports
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten for prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_DIR = "data"
INDEX_PATH = "embeddings/index.faiss"
IDS_PATH = "embeddings/ids.pkl"

# Build FAISS index if it doesn't exist
if not os.path.exists(INDEX_PATH):
    print("🧠 Building FAISS index...")
    os.makedirs("embeddings", exist_ok=True)
    imgs = glob.glob(f"{DATA_DIR}/*.jpg") + glob.glob(f"{DATA_DIR}/*.png")
    all_embs, ids = [], []
    for path in imgs:
        emb = get_image_embedding(path)   # make sure this function accepts file path
        all_embs.append(emb)
        ids.append(os.path.basename(path))
        print(f"Encoded: {os.path.basename(path)}")

    matrix = np.vstack(all_embs)
    index = faiss.IndexFlatL2(matrix.shape[1])
    index.add(matrix)
    faiss.write_index(index, INDEX_PATH)
    pickle.dump(ids, open(IDS_PATH, "wb"))
    print("✅ Index built successfully!")

# Load FAISS index + image IDs
index = faiss.read_index(INDEX_PATH)
ids = pickle.load(open(IDS_PATH, "rb"))
print(f"📁 Loaded {len(ids)} embeddings from index.")

@app.get("/")
def root():
    return {"message": "AI Fashion Retrieval Service running 🚀"}

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/search/image")
async def search_image(file: UploadFile, k: int = 5):
    """
    Upload an image and get top-K similar items.
    """
    image = Image.open(file.file).convert("RGB")
    # ⚠️ If your get_image_embedding() expects a path, change to save temp file or adjust function.
    query_emb = get_image_embedding(image)
    D, I = index.search(query_emb, k)
    results = [
        {"id": ids[i], "score": float(1 / (1 + D[0][j]))}
        for j, i in enumerate(I[0])
    ]
    return {"results": results}

@app.get("/search/text")
async def search_text(q: str, k: int = 5):
    """
    Search similar fashion images using a text query.
    Example:  /search/text?q=red+floral+dress
    """
    query_emb = get_text_embedding(q)
    D, I = index.search(query_emb, k)
    results = [
        {"id": ids[i], "score": float(1 / (1 + D[0][j]))}
        for j, i in enumerate(I[0])
    ]
    return {"query": q, "results": results}
