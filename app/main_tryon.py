from fastapi import FastAPI, UploadFile
from fastapi.responses import FileResponse
from PIL import Image

app = FastAPI(title="AI‑Fashion Virtual Try‑On Prototype")

@app.post("/try-on")
async def try_on(person: UploadFile, cloth: UploadFile):
    """
    Simple prototype: overlay the segmented cloth image onto a person image.
    This is not a research‑grade VTON, only a visual demo.
    """
    person_img = Image.open(person.file).convert("RGBA")
    cloth_img = Image.open(cloth.file).convert("RGBA")

    # Resize cloth proportionally to fit torso area
    width = int(person_img.width * 0.6)
    cloth_img = cloth_img.resize((width, int(cloth_img.height * (width / cloth_img.width))))

    # Place roughly on chest area
    position = (person_img.width // 2 - cloth_img.width // 2, int(person_img.height * 0.25))
    person_img.paste(cloth_img, position, mask=cloth_img)

    output_path = f"tryon_{person.filename}_{cloth.filename}.png"
    person_img.save(output_path)
    return FileResponse(output_path, media_type="image/png")

@app.get("/jobs/{job_id}")
def get_job(job_id: int):
    """Stub endpoint representing job‑status queries."""
    return {"job_id": job_id, "status": "completed"}