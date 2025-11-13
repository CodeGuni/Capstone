import os

PORT = int(os.getenv("PORT", "8002"))
ADMIN_TOKEN = os.getenv("ADMIN_TOKEN", "changeme")
DEVICE = "cuda" if os.getenv("USE_CUDA", "0") == "1" else "cpu"

# Paths
ART_DIR = os.getenv("ART_DIR", "artifacts")
IMG_DIR = os.getenv("IMG_DIR", "data/images")

# Data / model knobs
MIN_DATASET = int(os.getenv("MIN_DATASET", "60"))      # minimum samples to train
TEST_SPLIT = float(os.getenv("TEST_SPLIT", "0.2"))     # 20% eval split by default
RANDOM_SEED = 1337
