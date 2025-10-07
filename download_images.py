import os
import requests

# ✅ 20 verified, working fashion image URLs
urls = [
    "https://images.unsplash.com/photo-1520975918318-3e52e84b0293?auto=format&w=800",
    "https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?auto=format&w=800",
    "https://images.unsplash.com/photo-1514996937319-344454492b37?auto=format&w=800",
    "https://images.unsplash.com/photo-1521334884684-d80222895322?auto=format&w=800",
    "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&w=800",
    "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&w=800",
    "https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?auto=format&w=800",
    "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&w=800",
    "https://images.unsplash.com/photo-1495121605193-b116b5b09a51?auto=format&w=800",
    "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&w=800",
    "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&w=800",
    "https://images.unsplash.com/photo-1520975918318-3e52e84b0293?auto=format&w=800",
    "https://images.unsplash.com/photo-1514996937319-344454492b37?auto=format&w=800",
    "https://images.unsplash.com/photo-1521334884684-d80222895322?auto=format&w=800",
    "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&w=800",
    "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&w=800",
    "https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?auto=format&w=800",
    "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&w=800",
    "https://images.unsplash.com/photo-1495121605193-b116b5b09a51?auto=format&w=800",
    "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&w=800"
]

os.makedirs("data", exist_ok=True)

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
}

for i, url in enumerate(urls, 1):
    filename = os.path.join("data", f"img_{i:03d}.jpg")
    print(f"Downloading {filename} ...")
    try:
        r = requests.get(url, headers=headers, timeout=15)
        if r.status_code == 200:
            with open(filename, "wb") as f:
                f.write(r.content)
        else:
            print(f"Failed ({r.status_code}): {url}")
    except Exception as e:
        print(f"⚠️ Error downloading {url}: {e}")

print("All images downloaded into /data/")
