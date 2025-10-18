# model_utils.py
import torch
from PIL import Image
from transformers import CLIPProcessor, CLIPModel

device = "cuda" if torch.cuda.is_available() else "cpu"

# Load CLIP model and processor
model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32").to(device)
processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")

def get_image_embedding(image_input):
    """
    Accepts image path or PIL.Image object.
    Returns a 1×512 normalized embedding vector for similarity search.
    """
    if isinstance(image_input, str):
        image = Image.open(image_input).convert("RGB")
    else:
        image = image_input.convert("RGB")

    inputs = processor(images=image, return_tensors="pt").to(device)
    with torch.no_grad():
        emb = model.get_image_features(**inputs)
        emb /= emb.norm(dim=-1, keepdim=True)
    return emb.cpu().numpy().astype("float32")

def get_text_embedding(text_input):
    """
    Accepts a text string and returns a 1×512 normalized embedding vector.
    Useful for text-to-image retrieval.
    """
    inputs = processor(text=[text_input], return_tensors="pt", padding=True).to(device)
    with torch.no_grad():
        emb = model.get_text_features(**inputs)
        emb /= emb.norm(dim=-1, keepdim=True)
    return emb.cpu().numpy().astype("float32")

