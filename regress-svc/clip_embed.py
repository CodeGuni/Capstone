from typing import List, Tuple
import os, io, requests
from PIL import Image
import torch
import numpy as np
from transformers import CLIPProcessor, CLIPModel

class ClipImageEmbedder:
    def __init__(self, device: str = "cpu"):
        self.device = device
        self.model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32").to(self.device)
        self.proc = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")
        self.model.eval()

    def _load_image(self, path_or_url: str) -> Image.Image:
        if path_or_url.startswith("http://") or path_or_url.startswith("https://"):
            b = requests.get(path_or_url, timeout=15).content
            return Image.open(io.BytesIO(b)).convert("RGB")
        return Image.open(path_or_url).convert("RGB")

    def embed_paths(self, paths: List[str]) -> np.ndarray:
        imgs = [self._load_image(p) for p in paths]
        inputs = self.proc(images=imgs, return_tensors="pt").to(self.device)
        with torch.no_grad():
            feats = self.model.get_image_features(**inputs)
        feats = torch.nn.functional.normalize(feats, p=2, dim=-1)
        return feats.cpu().numpy().astype("float32")

    def embed_one(self, path_or_url: str) -> np.ndarray:
        img = self._load_image(path_or_url)
        inputs = self.proc(images=[img], return_tensors="pt").to(self.device)
        with torch.no_grad():
            feat = self.model.get_image_features(**inputs)
        feat = torch.nn.functional.normalize(feat, p=2, dim=-1)
        return feat.cpu().numpy().astype("float32")[0]
