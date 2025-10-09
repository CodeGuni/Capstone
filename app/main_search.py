# app/main_search.py
from fastapi import FastAPI, Form, UploadFile
from fastapi.responses import JSONResponse
import os, shutil
from app.search_service import search_by_text, search_by_image

app = FastAPI(title="AI‑Fashion Search API")

@app.post("/search-text")
async def text_search(query: str = Form(...)):
    matches = search_by_text(query)
    return JSONResponse({"matches": matches})

@app.post("/search-image")
async def image_search(file: UploadFile):
    temp = f"temp_{file.filename}"
    with open(temp, "wb") as f:
        shutil.copyfileobj(file.file, f)
    matches = search_by_image(temp)
    os.remove(temp)
    return JSONResponse({"matches": matches})