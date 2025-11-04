
import os
import io
import time
import uvicorn
import faiss
import torch
import numpy as np
from fastapi import FastAPI, Body, HTTPException
from pydantic import BaseModel
from PIL import Image
from typing import List, Optional
import requests
import pathlib
from transformers import CLIPProcessor, CLIPModel

DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
MODEL_NAME = os.getenv("CLIP_MODEL", "openai/clip-vit-base-patch32")
CATALOG_DIR = os.getenv("CATALOG_DIR", "./catalog")
TOPK_DEFAULT = int(os.getenv("TOPK_DEFAULT", "10"))
TIMEOUT = int(os.getenv("FETCH_TIMEOUT_MS", "6000")) / 1000.0

_model = None
_processor = None
_index = None
_ids: List[str] = []

def load_model():
    global _model, _processor
    if _model is None:
        _model = CLIPModel.from_pretrained(MODEL_NAME).to(DEVICE)
        _model.eval()
    if _processor is None:
        _processor = CLIPProcessor.from_pretrained(MODEL_NAME)

@torch.no_grad()
def embed_image_pil(img: Image.Image) -> np.ndarray:
    load_model()
    inputs = _processor(images=img, return_tensors="pt")
    pixel_values = inputs["pixel_values"].to(DEVICE)
    feats = _model.get_image_features(pixel_values=pixel_values)
    feats = torch.nn.functional.normalize(feats, dim=-1)
    return feats.cpu().numpy().astype("float32")

def ensure_index():
    if _index is None:
        raise RuntimeError("Index not built. Call /admin/reindex first.")

def build_index_from_folder(folder: str):
    global _index, _ids
    load_model()
    ids = []
    vecs = []
    p = pathlib.Path(folder)
    if not p.exists():
        raise FileNotFoundError(f"Folder not found: {folder}")
    for f in p.rglob("*"):
        if f.suffix.lower() in [".jpg", ".jpeg", ".png", ".webp"]:
            try:
                img = Image.open(f).convert("RGB")
                vec = embed_image_pil(img)
                vecs.append(vec[0])
                ids.append(str(f.relative_to(p)))
            except Exception as e:
                print(f"[WARN] failed to embed {f}: {e}")
    if not vecs:
        raise RuntimeError("No images found to index.")
    mat = np.vstack(vecs).astype("float32")
    dim = mat.shape[1]
    index = faiss.IndexFlatIP(dim)
    index.add(mat)
    _ids = ids
    _index = index
    return {"ok": True, "count": len(_ids), "dim": dim}

app = FastAPI(title="rec-svc", version="0.1.0")

class ImageSearchRequest(BaseModel):
    imageUrl: str
    topK: Optional[int] = None

class SearchResult(BaseModel):
    id: str
    score: float

class SearchResponse(BaseModel):
    results: list[SearchResult]

@app.post("/search/image", response_model=SearchResponse)
def search_image(body: ImageSearchRequest):
    topK = body.topK or TOPK_DEFAULT
    try:
        resp = requests.get(body.imageUrl, timeout=TIMEOUT)
        resp.raise_for_status()
        img = Image.open(io.BytesIO(resp.content)).convert("RGB")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Cannot fetch imageUrl: {e}")
    q = embed_image_pil(img)
    ensure_index()
    scores, idxs = _index.search(q, topK)
    results = []
    for score, idx in zip(scores[0].tolist(), idxs[0].tolist()):
        if idx == -1:
            continue
        results.append({"id": _ids[idx], "score": float(score)})
    return {"results": results}

class ReindexRequest(BaseModel):
    folder: Optional[str] = None

@app.post("/admin/reindex")
def admin_reindex(body: ReindexRequest):
    folder = body.folder or CATALOG_DIR
    return build_index_from_folder(folder)

if __name__ == "__main__":
    port = int(os.getenv("PORT", "8001"))
    uvicorn.run(app, host="0.0.0.0", port=port)
