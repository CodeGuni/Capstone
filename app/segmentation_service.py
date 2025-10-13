from rembg import remove
from PIL import Image
import io

def segment_garment(image_bytes: bytes) -> Image.Image:
    """Remove background from an uploaded garment image (U²Net)."""
    out_bytes = remove(image_bytes)
    return Image.open(io.BytesIO(out_bytes))