# backend/Dockerfile

# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src

RUN npm run build

# Stage 2: Production
FROM node:20-alpine AS production

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/dist ./dist

# Copy migration SQL files (needed at runtime)
COPY src/db/migrations ./dist/db/migrations

EXPOSE 3001

# Run migrations then start the server
CMD ["sh", "-c", "node dist/db/migrate.js && node dist/index.js"]
