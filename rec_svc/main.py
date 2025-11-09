# app/main.py
import os, io, time, pathlib, requests
import numpy as np
import faiss, torch
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from PIL import Image
from typing import Optional, List
from transformers import CLIPProcessor, CLIPModel

SERVICE_NAME = "rec-svc"
MODEL_NAME = os.getenv("MODEL_NAME", "openai/clip-vit-base-patch32")
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
DATA_DIR = os.getenv("DATA_DIR", "/data")
INDEX_PATH = os.path.join(DATA_DIR, "index.faiss")
IDS_PATH = os.path.join(DATA_DIR, "ids.txt")

app = FastAPI(title="rec-svc", version="1.0.0")

_model = None
_proc = None
_index = None
_ids: List[str] = []

def err(status: int, msg: str):
    # required error shape
    raise HTTPException(status_code=status, detail={"statusCode": status, "message": msg})

def load_model():
    global _model, _proc
    if _model is None:
        _model = CLIPModel.from_pretrained(MODEL_NAME).to(DEVICE)
        _model.eval()
    if _proc is None:
        _proc = CLIPProcessor.from_pretrained(MODEL_NAME)

@torch.no_grad()
def embed_image(img: Image.Image) -> np.ndarray:
    load_model()
    inputs = _proc(images=img, return_tensors="pt")
    pixel_values = inputs["pixel_values"].to(DEVICE)
    feats = _model.get_image_features(pixel_values=pixel_values)
    feats = torch.nn.functional.normalize(feats, dim=-1)
    return feats.cpu().numpy().astype("float32")  # (1, d)

def save_ids():
    os.makedirs(DATA_DIR, exist_ok=True)
    with open(IDS_PATH, "w", encoding="utf-8") as f:
        for _id in _ids:
            f.write(_id + "\n")

def load_ids():
    global _ids
    _ids = []
    p = pathlib.Path(IDS_PATH)
    if p.exists():
        _ids = p.read_text(encoding="utf-8").splitlines()

def load_index():
    global _index
    p = pathlib.Path(INDEX_PATH)
    if p.exists():
        _index = faiss.read_index(INDEX_PATH)
    else:
        _index = None

def ensure_index():
    if _index is None or _index.ntotal == 0:
        err(500, "index not built; call /admin/reindex first")

class HybridReq(BaseModel):
    imageUrl: Optional[str] = None
    topK: Optional[int] = 10  # Nest passes topK

class ReindexReq(BaseModel):
    folder: Optional[str] = None  # for MVP: build from local folder of images (ids by filename stem)

@app.get("/health")
def health():
    return {
        "ok": True,
        "service": SERVICE_NAME,
        "index_size": int(_index.ntotal) if _index else 0,
        "model": MODEL_NAME,
        "device": DEVICE,
    }

@app.post("/search/hybrid")
def search_hybrid(body: HybridReq):
    try:
        topK = int(body.topK or 10)
        if topK <= 0:
            err(400, "topK must be > 0")
        if not body.imageUrl:
            err(400, "imageUrl (string) is required")

        # fetch query image
        try:
            r = requests.get(body.imageUrl, timeout=10)
            r.raise_for_status()
            img = Image.open(io.BytesIO(r.content)).convert("RGB")
        except Exception as e:
            err(400, f"failed to fetch imageUrl: {e}")

        q = embed_image(img)  # (1, d)
        load_index(); load_ids(); ensure_index()

        scores, idxs = _index.search(q, min(topK, _index.ntotal))
        results = []
        for score, idx in zip(scores[0].tolist(), idxs[0].tolist()):
            if idx == -1:
                continue
            results.append({"id": _ids[idx], "score": float(score)})
        return {"results": results}
    except HTTPException as he:
        raise he
    except Exception as e:
        err(500, f"search hybrid failed: {e}")

@app.post("/admin/reindex")
def admin_reindex(body: ReindexReq):
    try:
        folder = body.folder or "./catalog"
        p = pathlib.Path(folder)
        if not p.exists():
            err(400, f"folder not found: {folder}")

        load_model()
        ids, vecs = [], []
        for img_path in sorted(p.glob("*")):
            if img_path.suffix.lower() not in [".jpg", ".jpeg", ".png", ".webp"]:
                continue
            try:
                img = Image.open(img_path).convert("RGB")
                v = embed_image(img)  # (1, d)
                vecs.append(v)
                ids.append(img_path.stem)
            except Exception:
                continue

        if not vecs:
            err(400, "no images found to index")

        X = np.concatenate(vecs, axis=0).astype("float32")
        dim = X.shape[1]
        index = faiss.IndexFlatIP(dim)  # cosine via normalized vectors
        index.add(X)

        os.makedirs(DATA_DIR, exist_ok=True)
        faiss.write_index(index, INDEX_PATH)

        # persist ids aligned with FAISS ids
        global _index, _ids
        _index = index
        _ids = ids
        save_ids()

        return {"ok": True, "added": len(ids), "index_size": int(_index.ntotal)}
    except HTTPException as he:
        raise he
    except Exception as e:
        err(500, f"reindex failed: {e}")
