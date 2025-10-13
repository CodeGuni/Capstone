# Capstone Project – AI Fashion Computer Vision

Welcome to the **Computer Vision backend** of our **AI Fashion Capstone Project**.  
This service gives the application its “visual intelligence”: it recognises clothing items, finds similar styles, removes backgrounds from photos, and powers our prototype virtual try‑on feature.  
The backend is built with **Python 3 and FastAPI**, giving us a clean, modular, and high‑performance architecture that connects easily with the rest of the system.

---

##  Key Features

- **Smart Image Search** – Find similar garments from text or image queries using the CLIP model.  
- **Background Removal (Segmentation)** – Remove backgrounds automatically using the U²Net model (`rembg`).  
- **Virtual Try‑On Prototype** – Overlay clothing images onto a person for a simple preview.  
- **RESTful APIs** – Well‑structured endpoints ready for integration with the main backend or frontend.  
- **FAISS Vector Database** – Supports fast Top‑K similarity search and recommendations.  
- **Modular Design** – Independent microservices for Search, Segmentation, and Try‑On.  
- **Rebuildable Index** – Embeddings can be regenerated anytime with a single command.  

---

##  Requirements

Before you start, make sure the following are installed:

- **Python** 3.10 or higher (3.13 recommended)  
- **pip** (latest version)  
- **Git** (for cloning and version control)  
 
---

##  Setup Instructions

1. Clone the Repository

git clone (https://github.com/codeguni/Capstone.git )
cd ai-fashion-capstone

2. Install Dependencies
py -m pip install -r requirements.txt
