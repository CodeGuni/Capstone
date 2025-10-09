import os
import clip
import torch
import numpy as np
from PIL import Image
import pandas as pd
import faiss

# ---------------------------
# 1. Load CLIP model
# ---------------------------
device = "cuda" if torch.cuda.is_available() else "cpu"
model, preprocess = clip.load("ViT-B/32", device=device)
print("✅ CLIP model loaded on", device)

# ---------------------------
# 2. Load dataset info
# ---------------------------
image_dir = "data/images"
metadata_path = "data/metadata.csv"

if not os.path.exists(metadata_path):
    raise FileNotFoundError("metadata.csv not found in data/ folder")

metadata = pd.read_csv(metadata_path)
image_files = metadata["filename"].tolist()

image_embeds = []
text_embeds = []

# ---------------------------
# 3. Encode images and text
# ---------------------------
for img_file in image_files:
    img_path = os.path.join(image_dir, img_file)
    if not os.path.exists(img_path):
        print(f"⚠️  Image not found: {img_path}, skipping.")
        continue

    # --- Image embedding
    image = preprocess(Image.open(img_path)).unsqueeze(0).to(device)
    with torch.no_grad():
        img_features = model.encode_image(image)
        img_features /= img_features.norm(dim=-1, keepdim=True)
    image_embeds.append(img_features.cpu().numpy())

    # --- Text embedding
    desc = metadata.loc[metadata.filename == img_file, "description"].item()
    text_tokens = clip.tokenize([desc]).to(device)
    with torch.no_grad():
        txt_features = model.encode_text(text_tokens)
        txt_features /= txt_features.norm(dim=-1, keepdim=True)
    text_embeds.append(txt_features.cpu().numpy())

print(f"✅ Encoded {len(image_embeds)} images and texts.")

# ---------------------------
# 4. Create numpy matrices
# ---------------------------
os.makedirs("embeddings", exist_ok=True)
image_matrix = np.concatenate(image_embeds, axis=0).astype("float32")
text_matrix = np.concatenate(text_embeds, axis=0).astype("float32")

np.save("embeddings/clip_image_embeds.npy", image_matrix)
np.save("embeddings/clip_text_embeds.npy", text_matrix)
print("✅ Saved embeddings to /embeddings folder")

# ---------------------------
# 5. Build FAISS index
# ---------------------------
dimension = image_matrix.shape[1]
index = faiss.IndexFlatL2(dimension)
index.add(image_matrix)
faiss.write_index(index, "embeddings/faiss_index.bin")

print(f"✅ FAISS index built and saved ({len(image_matrix)} images).")
print("🎉  All done! You can now run search_service.py next.")