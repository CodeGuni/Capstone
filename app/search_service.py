# app/search_service.py

import os
import clip
import torch
import faiss
import numpy as np
from PIL import Image

# Load CLIP model
device = "cuda" if torch.cuda.is_available() else "cpu"
model, preprocess = clip.load("ViT-B/32", device=device)

# Load saved FAISS index + image list
index = faiss.read_index("embeddings/faiss_index.bin")
image_dir = "data/images"
image_list = [f for f in os.listdir(image_dir)
              if f.lower().endswith(('.jpg', '.jpeg', '.png'))]

def search_by_text(query: str, k: int = 3):
    """Find top‑k images that match a text query."""
    tokens = clip.tokenize([query]).to(device)
    with torch.no_grad():
        text_feat = model.encode_text(tokens)
        text_feat /= text_feat.norm(dim=-1, keepdim=True)
    query_np = text_feat.cpu().numpy().astype('float32')
    D, I = index.search(query_np, k)
    return [image_list[i] for i in I[0]]

def search_by_image(img_path: str, k: int = 3):
    """Find top‑k similar images to another image."""
    image = preprocess(Image.open(img_path)).unsqueeze(0).to(device)
    with torch.no_grad():
        img_feat = model.encode_image(image)
        img_feat /= img_feat.norm(dim=-1, keepdim=True)
    query_np = img_feat.cpu().numpy().astype('float32')
    D, I = index.search(query_np, k)
    return [image_list[i] for i in I[0]]