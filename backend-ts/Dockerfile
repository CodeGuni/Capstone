FROM node:20-bookworm-slim
WORKDIR /app

# (optional) openssl for Prisma native binaries
RUN apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build && npx prisma generate

CMD ["node","dist/main.js"]
