import os, time, io, logging
from typing import Optional
from fastapi import FastAPI, Body, HTTPException, Header, UploadFile, File
from pydantic import BaseModel, Field
from PIL import Image
import torch
import numpy as np

from config import (TOPK_DEFAULT, ADMIN_TOKEN)
from clip_index import (
    search_by_image,
    search_by_text,
    search_hybrid,
    build_index,
    load_index,
    _lazy_model
)

# Device selection
_device = "cuda" if torch.cuda.is_available() else "cpu"

# Logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s [rec-svc] %(message)s",
)
log = logging.getLogger("rec")

# FastAPI app
app = FastAPI(title="rec-svc", version="0.1.0")


# ================== REQUEST MODELS ==================

class SearchImageReq(BaseModel):
    imageUrl: str = Field(..., description="Local filename in data/images OR full URL")
    topK: Optional[int] = TOPK_DEFAULT


class SearchTextReq(BaseModel):
    text: str
    topK: Optional[int] = TOPK_DEFAULT


class HybridReq(BaseModel):
    text: Optional[str] = None
    imageUrl: Optional[str] = None
    alpha: float = Field(0.5, ge=0.0, le=1.0, description="0=text only, 1=image only")
    topK: Optional[int] = TOPK_DEFAULT


# ================== HEALTH ==================

@app.get("/health")
def health():
    return {"ok": True}


# ================== IMAGE SEARCH ==================

@app.post("/search/image")
def search_image(req: SearchImageReq = Body(...)):
    try:
        results = search_by_image(req.imageUrl, req.topK or TOPK_DEFAULT)
        log.info("/search/image OK (%s -> %s results)", req.imageUrl, len(results))
        return {"results": results}
    except Exception as e:
        log.exception("search_image failed")
        raise HTTPException(status_code=400, detail=str(e))


# ================== TEXT SEARCH ==================

@app.post("/search/text")
def search_text_route(req: SearchTextReq = Body(...)):
    try:
        return {"results": search_by_text(req.text, req.topK or TOPK_DEFAULT)}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# ================== ✅ HYBRID SEARCH (Final + Correct) ==================

@app.post("/search/hybrid")
def search_hybrid_route(req: HybridReq = Body(...)):
    try:
        if not req.text and not req.imageUrl:
            raise HTTPException(status_code=400, detail="Provide imageUrl or text")

        results = search_hybrid(req.text, req.imageUrl, req.alpha, req.topK or TOPK_DEFAULT)
        log.info("/search/hybrid OK (text=%s, image=%s, alpha=%.2f -> %d results)",
                 req.text, req.imageUrl, req.alpha, len(results))
        return {"results": results}

    except Exception as e:
        log.exception("search_hybrid_route failed")
        raise HTTPException(status_code=400, detail=str(e))


# ================== REINDEX (ADMIN ONLY) ==================

@app.post("/admin/reindex")
def admin_reindex(authorization: Optional[str] = Header(None)):
    # Bearer token check
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(401, "Missing Bearer token")
    if authorization.split(" ", 1)[1] != ADMIN_TOKEN:
        raise HTTPException(403, "Invalid token")

    return {"ok": True, "index": build_index()}


# ================== FILE UPLOAD SEARCH ==================

@app.post("/search/upload")
async def search_upload(file: UploadFile = File(...), topK: int = 5):
    try:
        contents = await file.read()
        img = Image.open(io.BytesIO(contents)).convert("RGB")

        # Embed uploaded image
        model, proc = _lazy_model()
        inputs = proc(images=[img], return_tensors="pt").to(_device)
        with torch.no_grad():
            q = model.get_image_features(**inputs)
        q = torch.nn.functional.normalize(q, p=2, dim=-1).cpu().numpy().astype("float32")

        # KNN search
        index, meta, _ = load_index()
        D, I = index.search(q, topK)

        results = []
        for i, score in zip(I[0], D[0]):
            m = meta[i]
            results.append({
                "id": m["id"],
                "title": m.get("title", ""),
                "path": m["path"],
                "score": float(score)
            })

        return {"results": results}

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
