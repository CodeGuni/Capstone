import os, io, json, hashlib, requests, numpy as np
from PIL import Image
from typing import List, Dict, Tuple, Optional
from tqdm import tqdm

import faiss
import torch
from transformers import CLIPProcessor, CLIPModel

from config import (IMAGES_DIR, INDEX_JSON, CLIP_MODEL, INDEX_DIR, FAISS_FILE,
                    EMB_NPY, META_JSON, TIMEOUT_FETCH_SEC)

os.makedirs(INDEX_DIR, exist_ok=True)

_device = "cuda" if torch.cuda.is_available() else "cpu"
_model: Optional[CLIPModel] = None
_proc: Optional[CLIPProcessor] = None

def _lazy_model():
    global _model, _proc
    if _model is None:
        _model = CLIPModel.from_pretrained(CLIP_MODEL).to(_device).eval()
        _proc = CLIPProcessor.from_pretrained(CLIP_MODEL)
    return _model, _proc

def _image_from_url_or_path(path_or_url: str) -> Image.Image:
    if path_or_url.startswith("http://") or path_or_url.startswith("https://"):
        r = requests.get(path_or_url, timeout=TIMEOUT_FETCH_SEC)
        r.raise_for_status()
        return Image.open(io.BytesIO(r.content)).convert("RGB")
    # local relative path
    p = path_or_url if os.path.isabs(path_or_url) else os.path.join(IMAGES_DIR, path_or_url)
    return Image.open(p).convert("RGB")

def embed_images(paths: List[str]) -> np.ndarray:
    model, proc = _lazy_model()
    batch = []
    embs = []
    bs = 16
    for p in tqdm(paths, desc="Embedding images"):
        batch.append(_image_from_url_or_path(p))
        if len(batch) == bs:
            inputs = proc(images=batch, return_tensors="pt").to(_device)
            with torch.no_grad():
                feats = model.get_image_features(**inputs)
            feats = torch.nn.functional.normalize(feats, p=2, dim=-1).cpu().numpy()
            embs.append(feats)
            batch = []
    if batch:
        inputs = proc(images=batch, return_tensors="pt").to(_device)
        with torch.no_grad():
            feats = model.get_image_features(**inputs)
        feats = torch.nn.functional.normalize(feats, p=2, dim=-1).cpu().numpy()
        embs.append(feats)
    return np.vstack(embs)

def embed_texts(texts: List[str]) -> np.ndarray:
    model, proc = _lazy_model()
    inputs = proc(text=texts, return_tensors="pt", padding=True, truncation=True).to(_device)
    with torch.no_grad():
        feats = model.get_text_features(**inputs)
    feats = torch.nn.functional.normalize(feats, p=2, dim=-1).cpu().numpy()
    return feats

def build_index() -> Dict:
    with open(INDEX_JSON, "r", encoding="utf-8") as f:
        items = json.load(f)  # [{ "id": "sku123", "path": "dress1.jpg", "title": "yellow sundress", ...}]
    paths = [it["path"] for it in items]
    embs = embed_images(paths).astype("float32")

    d = embs.shape[1]
    index = faiss.IndexFlatIP(d)  # cosine on normalized vectors
    index.add(embs)

    faiss.write_index(index, FAISS_FILE)
    np.save(EMB_NPY, embs)
    with open(META_JSON, "w", encoding="utf-8") as f:
        json.dump(items, f, ensure_ascii=False, indent=2)
    return {"count": len(items), "dim": d}

def load_index() -> Tuple[faiss.Index, List[Dict], np.ndarray]:
    # If not built, build it
    if not (os.path.exists(FAISS_FILE) and os.path.exists(META_JSON) and os.path.exists(EMB_NPY)):
        build_index()
    index = faiss.read_index(FAISS_FILE)
    with open(META_JSON, "r", encoding="utf-8") as f:
        meta = json.load(f)
    embs = np.load(EMB_NPY)
    return index, meta, embs

def knn_from_emb(emb: np.ndarray, topk: int) -> List[Tuple[int, float]]:
    index, _, _ = load_index()
    D, I = index.search(emb, topk)
    # return [(idx, score), ...] for single query
    return list(zip(I[0].tolist(), D[0].tolist()))

def search_by_image(query_image_url_or_path: str, topk: int) -> List[Dict]:
    model, proc = _lazy_model()
    img = _image_from_url_or_path(query_image_url_or_path)
    inputs = proc(images=[img], return_tensors="pt").to(_device)
    with torch.no_grad():
        q = model.get_image_features(**inputs)
    q = torch.nn.functional.normalize(q, p=2, dim=-1).cpu().numpy().astype("float32")

    index, meta, _ = load_index()
    D, I = index.search(q, topk)
    out = []
    for i, score in zip(I[0], D[0]):
        m = meta[i]
        out.append({"id": m["id"], "score": float(score), "path": m["path"], **{k:v for k,v in m.items() if k not in {"id","path"}}})
    return out

def search_by_text(query_text: str, topk: int) -> List[Dict]:
    q = embed_texts([query_text]).astype("float32")
    index, meta, _ = load_index()
    D, I = index.search(q, topk)
    out = []
    for i, score in zip(I[0], D[0]):
        m = meta[i]
        out.append({"id": m["id"], "score": float(score), "path": m["path"], **{k:v for k,v in m.items() if k not in {"id","path"}}})
    return out
def search_hybrid(query_text: Optional[str], query_image_url_or_path: Optional[str], alpha: float, topk: int) -> List[Dict]:
    vecs = []
    weights = []

    # Text feature
    if query_text:
        tex = embed_texts([query_text]).astype("float32")
        vecs.append(tex)
        weights.append(1.0 - alpha)

    # Image feature
    if query_image_url_or_path:
        model, proc = _lazy_model()
        img = _image_from_url_or_path(query_image_url_or_path)
        inputs = proc(images=[img], return_tensors="pt").to(_device)
        with torch.no_grad():
            qimg = model.get_image_features(**inputs)
        qimg = torch.nn.functional.normalize(qimg, p=2, dim=-1).cpu().numpy().astype("float32")
        vecs.append(qimg)
        weights.append(alpha if query_text else 1.0)

    if not vecs:
        return []

    # ✅ Average & Shape-Safe
    q = np.average(np.vstack(vecs), axis=0, weights=weights)

    # ✅ If q is 1D -> reshape to 2D
    if q.ndim == 1:
        q = q.reshape(1, -1)

    # Normalize
    q = q / (np.linalg.norm(q, axis=1, keepdims=True) + 1e-9)

    index, meta, _ = load_index()
    D, I = index.search(q.astype("float32"), topk)

    results = []
    for i, score in zip(I[0], D[0]):
        m = meta[i]
        results.append({
            "id": m["id"],
            "score": float(score),
            "path": m["path"],
            **{k: v for k, v in m.items() if k not in {"id", "path"}}
        })
    return results

