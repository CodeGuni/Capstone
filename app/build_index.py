import os
import clip
import torch
import numpy as np
import pandas as pd
import faiss
from PIL import Image

device = "cuda" if torch.cuda.is_available() else "cpu"
model, preprocess = clip.load("ViT-B/32", device=device)
print("✅ CLIP model loaded on", device)

image_dir = "data/images"
metadata_path = "data/metadata.csv"

if not os.path.exists(metadata_path):
    raise FileNotFoundError("metadata.csv not found in data/ folder")

metadata = pd.read_csv(metadata_path)
image_files = metadata["filename"].tolist()

image_embeds, text_embeds = [], []
for img_file in image_files:
    img_path = os.path.join(image_dir, img_file)
    if not os.path.exists(img_path):
        print(f"⚠️ Missing: {img_path}")
        continue

    image = preprocess(Image.open(img_path)).unsqueeze(0).to(device)
    with torch.no_grad():
        img_vec = model.encode_image(image)
        img_vec /= img_vec.norm(dim=-1, keepdim=True)
    image_embeds.append(img_vec.cpu().numpy())

    desc = metadata.loc[metadata.filename == img_file, "description"].item()
    tokens = clip.tokenize([desc]).to(device)
    with torch.no_grad():
        txt_vec = model.encode_text(tokens)
        txt_vec /= txt_vec.norm(dim=-1, keepdim=True)
    text_embeds.append(txt_vec.cpu().numpy())

print(f"✅ Encoded {len(image_embeds)} images and texts")

os.makedirs("embeddings", exist_ok=True)
image_matrix = np.concatenate(image_embeds).astype("float32")
text_matrix = np.concatenate(text_embeds).astype("float32")
np.save("embeddings/clip_image_embeds.npy", image_matrix)
np.save("embeddings/clip_text_embeds.npy", text_matrix)

dim = image_matrix.shape[1]
index = faiss.IndexFlatL2(dim)
index.add(image_matrix)
faiss.write_index(index, "embeddings/faiss_index.bin")

print(f"✅ FAISS index built and saved ({len(image_matrix)} images)")
print("🎉  All done! You can now run search_service.py next.")