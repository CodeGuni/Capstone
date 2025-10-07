# model.py
from sentence_transformers import SentenceTransformer
from PIL import Image
import torch

# Load the CLIP model (this is used for converting images into embeddings/vectors)
model = SentenceTransformer('clip-ViT-B-32')

def get_image_embedding(image_path: str):
    """
    Converts an image into a 512-dimensional vector (embedding)
    using the CLIP model.
    """
    image = Image.open(image_path)
    emb = model.encode([image], convert_to_tensor=True, normalize_embeddings=True)
    return emb.cpu().numpy()[0]
