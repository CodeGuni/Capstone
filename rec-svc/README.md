# rec-svc (CLIP + FAISS)

## Endpoints
- `POST /search/image` → `{ imageUrl, topK? }`
- `POST /search/text`  → `{ text, topK? }`
- `POST /search/hybrid` → `{ text?, imageUrl?, alpha(0..1), topK? }`
- `POST /admin/reindex` (Bearer token) → rebuilds index

## Env
- `REC_DATA_DIR` (default: ./data)
- `REC_CLIP_MODEL` (default: openai/clip-vit-base-patch32)
- `REC_ADMIN_TOKEN` (default: dev-admin-token)
- `REC_INDEX_DIR` (default: ./.index)

## Local Dev
See steps in this document or run via Docker.
