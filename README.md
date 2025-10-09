AI Fashion Capstone – Computer Vision Backend

Welcome to the **Computer Vision backend** of the AI Fashion Capstone Project.  
This module is built with **Python 3.13** and **FastAPI**, providing the visual‑intelligence microservices that power image retrieval, background removal, and the upcoming virtual try‑on prototype.

---

Key Features
- **RESTful APIs:** Clean and well‑structured endpoints (`/search-text`, `/search-image`, `/segmentation`).
- **CLIP Model Integration:** Embed fashion images and text for visual + semantic search.
- **FAISS Indexing:** Efficient Top‑K similarity search over vector embeddings.
- **Segmentation (U²Net):** Automatic background removal for clothing photos.
- **Modular Design:** Separate microservices for search and segmentation.

---

 Requirements
Before you begin, ensure you have the following installed:

- **Python:** Version 3.10 or higher (recommended 3.13)  
- **Pip:** latest version  
- **GPU (CUDA)** optional but supported  
- **Git**

---

 Setup Instructions

**Clone the Repository**
```bash
git clone https://github.com/<YourUserName>/ai-fashion-capstone.git
cd ai-fashion-capstone
