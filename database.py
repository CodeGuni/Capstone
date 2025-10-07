# database.py
import os
import numpy as np
import faiss
from model import get_image_embedding

def build_faiss_index(image_dir='data', index_file='embeddings.index'):
    """
    Reads all images from the folder, converts them to embeddings,
    and builds a FAISS index for fast similarity search.
    """
    image_paths = []
    embeddings = []

    # Loop through all images in the folder
    for fname in os.listdir(image_dir):
        if fname.lower().endswith(('.jpg', '.jpeg', '.png')):
            path = os.path.join(image_dir, fname)
            print(f"Processing: {path}")
            emb = get_image_embedding(path)
            embeddings.append(emb)
            image_paths.append(path)

    # Convert embeddings to numpy float32
    embeddings = np.array(embeddings).astype('float32')

    # Build FAISS index (cosine similarity)
    index = faiss.IndexFlatIP(embeddings.shape[1])
    index.add(embeddings)

    # Save the index and paths
    faiss.write_index(index, index_file)
    np.save('image_paths.npy', np.array(image_paths))

    print(f"✅ Indexed {len(image_paths)} images successfully!")
    print(f"📁 Saved index as: {index_file}")
    print(f"📁 Saved image paths as: image_paths.npy")

if __name__ == "__main__":
    build_faiss_index()
