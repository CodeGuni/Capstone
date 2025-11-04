
# rec-svc (Retrieval Service)

Implements `/search/image` used by your NestJS gateway (`REC_SVC_URL`).

## Endpoints
- `POST /search/image` — body: `{ "imageUrl": "https://...", "topK": 10 }`
- `POST /admin/reindex` — body: `{ "folder": "./catalog" }` to build FAISS from local images

## Quickstart
```bash
python -m venv .venv && . .venv/bin/activate
pip install -r requirements.txt

mkdir -p catalog
# Put a few images into ./catalog first

# Build index:
curl -X POST http://localhost:8001/admin/reindex   -H "content-type: application/json"   -d '{"folder":"./catalog"}'

# Run:
python main.py
```
