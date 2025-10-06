# Backend (Sprint 1)

## Prereqs
- Node 22, Docker Desktop
- .env filled (JWT_SECRET, DATABASE_URL, REDIS_URL, Azure keys)

## Start deps
docker compose up -d postgres redis

## DB
npm run prisma:gen
npm run prisma:push
npm run seed   # seeds admin or run set-password script

## Run API
npm run start:dev  # http://localhost:3000

## Smoke tests
Invoke-RestMethod http://localhost:3000/api/health
# login -> token
$token = (Invoke-RestMethod -Method Post -Uri "http://localhost:3000/api/auth/login" -ContentType "application/json" -Body '{"email":"info@guni.ca","password":"Admin@123"}').accessToken
# admin ping
Invoke-RestMethod -Uri "http://localhost:3000/api/admin/ping" -Headers @{ Authorization = "Bearer $token" }
# jobs
Invoke-RestMethod -Method Post -Uri "http://localhost:3000/api/jobs/hello" -ContentType "application/json" -Body '{"name":"AIFS"}'
# files (Azure)
$pre = Invoke-RestMethod -Method Post -Uri "http://localhost:3000/api/files/presign" -ContentType "application/json" -Body '{"filename":"images/testing.png","contentType":"image/png"}'
Invoke-WebRequest -Method Put -Uri $pre.url -InFile .\images\testing.png -Headers @{ 'x-ms-blob-type'='BlockBlob'; 'Content-Type'='image/png' }
