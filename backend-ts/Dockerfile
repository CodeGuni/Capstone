# ========================
# 1️⃣ Build Stage
# ========================
FROM node:18-alpine AS builder

WORKDIR /app

# Install OpenSSL and other required build deps
RUN apk add --no-cache openssl

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# ========================
# 2️⃣ Production Stage
# ========================
FROM node:18-alpine
WORKDIR /app

# Install OpenSSL in runtime image for Prisma
RUN apk add --no-cache openssl

COPY --from=builder /app/dist ./dist
COPY package*.json ./
COPY src/prisma ./src/prisma

RUN npm install --production

CMD ["npm", "run", "start:prod"]
