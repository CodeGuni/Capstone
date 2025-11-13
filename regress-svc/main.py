import os, io, json, traceback
from typing import Optional
from fastapi import FastAPI, Body, HTTPException, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
import joblib
import numpy as np
from PIL import Image

from config import PORT, ART_DIR, IMG_DIR, DEVICE, MIN_DATASET
from clip_embed import ClipImageEmbedder
from dataset_prep import build_embeddings
from train import train as train_model

app = FastAPI(title="regress-svc", version="0.1.0")

_model = None
_embedder = None

def _error(message: str, status: int = 500):
    return JSONResponse(status_code=status, content={"statusCode": status, "message": message})

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return _error(str(exc), 500)

class PredictReq(BaseModel):
    imageUrl: str = Field(..., description="Local filename in data/images OR full URL")

class EvalReq(BaseModel):
    take: Optional[int] = Field(None, description="Evaluate on first N samples (debug only)")

@app.on_event("startup")
def _startup():
    global _model, _embedder
    _embedder = ClipImageEmbedder(device=DEVICE)
    try:
        _model = joblib.load(os.path.join(ART_DIR, "regressor.pkl"))
    except Exception:
        _model = None

@app.get("/health")
def health():
    return {"ok": True}

@app.post("/predict")
def predict(req: PredictReq = Body(...)):
    global _model, _embedder
    if _model is None:
        raise HTTPException(status_code=400, detail="Model not trained yet")
    try:
        img_path = req.imageUrl
        if not (img_path.startswith("http://") or img_path.startswith("https://") or os.path.isabs(img_path)):
            img_path = os.path.join(IMG_DIR, img_path)

        feat = _embedder.embed_one(img_path)
        score = float(_model.predict(feat.reshape(1, -1))[0])
        return {"score": score}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/eval")
def eval_route(req: EvalReq = Body(None)):
    try:
        npz = np.load(os.path.join(ART_DIR, "embeddings.npz"))
        X = npz["X"]
        y = np.load(os.path.join(ART_DIR, "labels.npy"))

        if req and req.take:
            X = X[: req.take]
            y = y[: req.take]

        if _model is None:
            raise HTTPException(status_code=400, detail="Model not trained yet")

        pred = _model.predict(X)
        rmse = float(np.sqrt(np.mean((pred - y) ** 2)))

        ybar = float(np.mean(y)) if len(y) else 0.0
        ss_tot = float(np.sum((y - ybar) ** 2)) + 1e-9
        ss_res = float(np.sum((y - pred) ** 2))
        r2 = 1.0 - ss_res / ss_tot

        return {"rmse": rmse, "r2": float(r2), "n": int(len(y))}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/admin/retrain")
def retrain():
    try:
        print("[admin] retrain triggered (NO TOKEN)")

        # (1) Build embeddings if missing or incomplete
        need_build = not os.path.exists(os.path.join(ART_DIR, "embeddings.npz"))
        if need_build:
            build_embeddings()
        else:
            npz = np.load(os.path.join(ART_DIR, "embeddings.npz"))
            if npz["X"].shape[0] < MIN_DATASET:
                build_embeddings()

        # (2) Train model
        train_model()

        # (3) Reload for immediate use
        global _model
        _model = joblib.load(os.path.join(ART_DIR, "regressor.pkl"))

        return {"ok": True}
    except Exception as e:
        return _error(str(e), 500)
