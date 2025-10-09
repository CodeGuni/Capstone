# app/main_segmentation.py
from fastapi import FastAPI, UploadFile
from fastapi.responses import FileResponse
from app.segmentation_service import segment_garment

app = FastAPI(title="AI‑Fashion Segmentation API")

@app.post("/segmentation")
async def segmentation(file: UploadFile):
    img_bytes = await file.read()
    result = segment_garment(img_bytes)
    output = f"segmented_{file.filename}"
    result.save(output)
    return FileResponse(output, media_type="image/png")