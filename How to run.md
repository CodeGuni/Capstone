# AI Fashion Studio — Backend Sprint 1 (Run & Demo)

**What's included:** JWT login + admin RBAC, BullMQ job, Azure presigned upload, `/search/image` (mock top-K).

## Steps (do these in order)

1. **Install & prepare**
   - Require: Node 22, Docker Desktop
   - Create `.env` in repo root with:
     ```ini
     PORT=3000
     JWT_SECRET=dev-super-secret-please-change
     DATABASE_URL=postgresql://postgres:2519@localhost:5432/aifs?schema=public
     REDIS_URL=redis://localhost:6379
     AZURE_STORAGE_ACCOUNT=guniaifsstorage
     AZURE_STORAGE_KEY=PASTE_REAL_KEY_WITHOUT_ANGLE_BRACKETS
     AZURE_CONTAINER=guni
     REC_SVC_URL=http://localhost:8001
     REC_SVC_TIMEOUT_MS=8000
     SEARCH_ALLOW_MOCK=1
     ```
   - Put a test image at `backend-ts\images\testing.png`.

2. **Start databases/queues (Docker)**
   ```powershell
   docker compose up -d postgres redis
   ```

3. **Init database**
   ```powershell
   npm run prisma:gen
   npm run prisma:push
   npm run seed
   ```
   (If needed later: `npx tsx scripts/set-password.ts info@guni.ca Admin@123`)

4. **Run API (keep this terminal open)**
   ```powershell
   npm run start:dev   # http://localhost:3000
   ```

5. **Open a second terminal for the demo commands**

6. **Health**
   ```powershell
   Invoke-RestMethod http://localhost:3000/api/health
   ```

7. **Login → JWT**
   ```powershell
   $token = (Invoke-RestMethod -Method Post -Uri "http://localhost:3000/api/auth/login" -ContentType "application/json" -Body '{"email":"info@guni.ca","password":"Admin@123"}').accessToken
   $token.Substring(0,25)
   ```

8. **RBAC (admin)**
   ```powershell
   Invoke-RestMethod -Uri "http://localhost:3000/api/admin/ping" -Headers @{ Authorization = "Bearer $token" }
   ```

9. **Queue job**
   ```powershell
   Invoke-RestMethod -Method Post -Uri "http://localhost:3000/api/jobs/hello" -ContentType "application/json" -Body '{"name":"AIFS"}'
   ```

10. **Azure presign + upload**
    ```powershell
    $pre = Invoke-RestMethod -Method Post -Uri "http://localhost:3000/api/files/presign" -ContentType "application/json" -Body '{"filename":"images/testing.png","contentType":"image/png"}'
    Invoke-WebRequest -Method Put -Uri $pre.url -InFile .\images\testing.png -Headers @{ 'x-ms-blob-type'='BlockBlob'; 'Content-Type'='image/png' }
    ```

11. **Search (mock top-K)**
    ```powershell
    $resp = Invoke-RestMethod -Method Post -Uri "http://localhost:3000/api/search/image" -ContentType "application/json" -Body '{"imageUrl":"https://example.com/any.jpg","topK":10}'
    $resp | ConvertTo-Json -Depth 10
    ```

12. **Stop services (after demo)**
    ```powershell
    docker compose down
    ```