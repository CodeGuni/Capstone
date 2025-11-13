import os, time, io, logging, traceback
from typing import Optional
from fastapi import FastAPI, Body, Header, UploadFile, File, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from PIL import Image
import torch

from config import (TOPK_DEFAULT, ADMIN_TOKEN)
from clip_index import (
    search_by_image,
    search_by_text,
    search_hybrid,
    build_index,
    load_index,
    _lazy_model
)

_device = "cuda" if torch.cuda.is_available() else "cpu"

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s [rec-svc] %(message)s",
)
log = logging.getLogger("rec")

app = FastAPI(title="rec-svc", version="0.1.0")


# ---------- ERROR RESPONSE (Required Format) ----------
def error_response(message: str, status_code: int = 500):
    return JSONResponse(
        status_code=status_code,
        content={
            "statusCode": status_code,
            "message": message
        }
    )


# ---------- REQUEST MODELS ----------
class SearchImageReq(BaseModel):
    imageUrl: str
    topK: Optional[int] = TOPK_DEFAULT


class SearchTextReq(BaseModel):
    text: str
    topK: Optional[int] = TOPK_DEFAULT


class HybridReq(BaseModel):
    text: Optional[str] = None
    imageUrl: Optional[str] = None
    alpha: float = Field(0.5, ge=0.0, le=1.0)
    topK: Optional[int] = TOPK_DEFAULT


# ---------- HEALTH ----------
@app.get("/health")
def health():
    return {"ok": True}


# ---------- SEARCH IMAGE ----------
@app.post("/search/image")
def search_image(req: SearchImageReq = Body(...)):
    try:
        res = search_by_image(req.imageUrl, req.topK or TOPK_DEFAULT)
        return {"results": res}
    except Exception as e:
        log.error("search_image failed: %s", e)
        return error_response(str(e), 500)


# ---------- SEARCH TEXT ----------
@app.post("/search/text")
def search_text_route(req: SearchTextReq = Body(...)):
    try:
        res = search_by_text(req.text, req.topK or TOPK_DEFAULT)
        return {"results": res}
    except Exception as e:
        return error_response(str(e), 500)


# ---------- HYBRID SEARCH ----------
@app.post("/search/hybrid")
def search_hybrid_route(req: HybridReq = Body(...)):
    try:
        if not req.text and not req.imageUrl:
            return error_response("Provide imageUrl or text", 400)

        res = search_hybrid(req.text, req.imageUrl, req.alpha, req.topK or TOPK_DEFAULT)
        return {"results": res}
    except Exception as e:
        return error_response(str(e), 500)


# ---------- REINDEX (ADMIN) ----------
@app.post("/admin/reindex")
def admin_reindex(authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        return error_response("Missing Bearer token", 401)
    if authorization.split(" ", 1)[1] != ADMIN_TOKEN:
        return error_response("Invalid token", 403)

    return {"ok": True, "index": build_index()}


# ---------- UPLOAD SEARCH ----------
@app.post("/search/upload")
async def search_upload(file: UploadFile = File(...), topK: int = 5):
    try:
        contents = await file.read()
        img = Image.open(io.BytesIO(contents)).convert("RGB")

        model, proc = _lazy_model()
        inputs = proc(images=[img], return_tensors="pt").to(_device)
        with torch.no_grad():
            q = model.get_image_features(**inputs)

        q = torch.nn.functional.normalize(q, p=2, dim=-1).cpu().numpy().astype("float32")

        index, meta, _ = load_index()
        D, I = index.search(q, topK)

        results = [
            {
                "id": meta[i]["id"],
                "title": meta[i].get("title", ""),
                "path": meta[i]["path"],
                "score": float(D[0][j])
            }
            for j, i in enumerate(I[0])
        ]

        return {"results": results}

    except Exception as e:
        return error_response(str(e), 500)


# ---------- GLOBAL UNCAUGHT ERROR HANDLER ----------
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    log.error("UNHANDLED ERROR:\n%s", traceback.format_exc())
    return error_response(str(exc), 500)
