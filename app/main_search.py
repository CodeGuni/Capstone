from fastapi import FastAPI, Form, UploadFile
from fastapi.responses import JSONResponse
import shutil, os
from app.search_service import search_by_text, search_by_image

app = FastAPI(title="AI‑Fashion Search Microservice")

@app.post("/search-text")
async def text_search(query: str = Form(...)):
    matches = search_by_text(query)
    return JSONResponse(content={"matches": matches})

@app.post("/search-image")
async def image_search(file: UploadFile):
    temp = f"temp_{file.filename}"
    with open(temp, "wb") as f:
        shutil.copyfileobj(file.file, f)
    matches = search_by_image(temp)
    os.remove(temp)
    return JSONResponse(content={"matches": matches})