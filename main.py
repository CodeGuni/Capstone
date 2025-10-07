# main.py
from fastapi import FastAPI, UploadFile, File
from model import model
import numpy as np
import faiss
from PIL import Image
import io

app = FastAPI()

# Load FAISS index and image paths
index = faiss.read_index("embeddings.index")
image_paths = np.load("image_paths.npy", allow_pickle=True)

@app.post("/search/image")
async def search_image(file: UploadFile = File(...)):
    # Read uploaded image
    contents = await file.read()
    image = Image.open(io.BytesIO(contents))

    # Generate embedding
    emb = model.encode([image], convert_to_tensor=True, normalize_embeddings=True)
    emb = emb.cpu().numpy().astype('float32')

    # Search top 5 similar images
    top_k = 5
    scores, ids = index.search(emb, top_k)
    results = [
        {"id": int(i), "score": float(s), "path": str(image_paths[i])}
        for s, i in zip(scores[0], ids[0])
    ]

    return {"results": results}
