import os

# Where your small catalog lives
DATA_DIR = os.getenv("REC_DATA_DIR", os.path.join(os.path.dirname(__file__), "data"))
IMAGES_DIR = os.path.join(DATA_DIR, "images")
INDEX_JSON = os.path.join(DATA_DIR, "index.json")

# Model choice (ViT-B/32 = fast + ok quality). Change to "openai/clip-vit-large-patch14" later.
CLIP_MODEL = os.getenv("REC_CLIP_MODEL", "openai/clip-vit-base-patch32")

# Admin token for /admin/reindex
ADMIN_TOKEN = os.getenv("REC_ADMIN_TOKEN", "dev-admin-token")

# Index path on disk (FAISS + npy sidecars)
INDEX_DIR = os.getenv("REC_INDEX_DIR", os.path.join(os.path.dirname(__file__), ".index"))
FAISS_FILE = os.path.join(INDEX_DIR, "index.faiss")
EMB_NPY = os.path.join(INDEX_DIR, "embeddings.npy")
META_JSON = os.path.join(INDEX_DIR, "meta.json")

TOPK_DEFAULT = int(os.getenv("REC_TOPK_DEFAULT", "12"))
TIMEOUT_FETCH_SEC = float(os.getenv("REC_IMG_FETCH_TIMEOUT", "5.0"))
