import os, json, random
import numpy as np
from glob import glob
from typing import Dict, List
from config import IMG_DIR, ART_DIR, RANDOM_SEED
from clip_embed import ClipImageEmbedder

random.seed(RANDOM_SEED)

def list_images(root: str) -> List[str]:
    exts = (".jpg",".jpeg",".png",".webp")
    out = []
    for base, _, files in os.walk(root):
        for f in files:
            if f.lower().endswith(exts):
                out.append(os.path.join(base, f))
    return sorted(out)

def simulate_sales_score(path: str) -> float:
    # simple deterministic pseudo-label from filename + randomness for reproducibility
    base = os.path.basename(path).lower()
    seed = sum(ord(c) for c in base) % 1000
    random.seed(seed)
    score = 0.3 + 0.7 * random.random()   # [0.3,1.0]
    return float(round(score, 3))

def build_embeddings():
    os.makedirs(ART_DIR, exist_ok=True)
    paths = list_images(IMG_DIR)
    if len(paths) < 20:
        raise RuntimeError(f"Need >=20 images in {IMG_DIR}. Found {len(paths)}")

    # labels
    y = np.array([simulate_sales_score(p) for p in paths], dtype="float32")

    # embeddings
    emb = ClipImageEmbedder()
    X = emb.embed_paths(paths)

    meta = [{"id": f"item-{i:04d}", "path": paths[i]} for i in range(len(paths))]
    np.savez(os.path.join(ART_DIR, "embeddings.npz"), X=X)
    np.save(os.path.join(ART_DIR, "labels.npy"), y)
    with open(os.path.join(ART_DIR, "meta.json"), "w", encoding="utf-8") as f:
        json.dump(meta, f, indent=2)

    print(f"[prep] Saved X={X.shape}, y={y.shape}, meta={len(meta)}")

if __name__ == "__main__":
    build_embeddings()
