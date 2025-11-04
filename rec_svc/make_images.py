from PIL import Image, ImageDraw, ImageFont
import os

os.makedirs("catalog", exist_ok=True)

def make_img(path, color, text):
    img = Image.new("RGB", (512, 640), color)
    d = ImageDraw.Draw(img)
    # draw a simple "garment" rectangle shape
    d.rectangle([156, 100, 356, 540], outline=(255, 255, 255), width=8)
    d.text((20, 20), text, fill=(255, 255, 255))
    img.save(path, "JPEG", quality=90)

make_img("catalog/red_dress.jpg", (180, 30, 30), "red dress")
make_img("catalog/blue_tshirt.jpg", (30, 60, 180), "blue tshirt")
make_img("catalog/black_jacket.jpg", (20, 20, 20), "black jacket")

print("Wrote:", os.listdir("catalog"))
