# app/segmentation_service.py
from rembg import remove
from PIL import Image
import io

def segment_garment(image_bytes: bytes) -> Image.Image:
    """
    Remove background from a clothing/product photo.
    """
    out_bytes = remove(image_bytes)
    return Image.open(io.BytesIO(out_bytes))