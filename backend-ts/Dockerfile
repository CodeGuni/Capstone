FROM node:18-bullseye

WORKDIR /app

# Copy package files first
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# ✅ Copy .env into container
COPY .env .env

# Generate Prisma client
RUN npx prisma generate --schema src/prisma/schema.prisma

EXPOSE 3000

# Start the app
CMD ["npm", "start"]
