# Capability: Docker Setup & Deployment

Single-command startup: `docker compose up` brings the entire platform online with no manual steps.

---

## Requirement

After `git clone` + (optionally) `cp .env.example .env`, a single `docker compose up` must:

1. Start a MySQL container with the schema and seed data automatically applied
2. Build and start the backend Node.js API
3. Build and start the frontend (Nginx serving the Vite production build)
4. Make the app accessible at `http://localhost:5173` (or `http://localhost:3000`)

No manual `npm install`, no manual migrations, no manual environment configuration beyond copying `.env.example`.

---

## File Structure

```
ecommerce-platform/
├── docker-compose.yml
├── .env.example
├── backend/
│   └── Dockerfile
└── frontend/
    └── Dockerfile
```

---

## docker-compose.yml

```yaml
version: '3.9'

services:
  db:
    image: mysql:8.0
    restart: unless-stopped
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_ROOT_PASSWORD}
      MYSQL_DATABASE: ${DB_NAME}
      MYSQL_USER: ${DB_USER}
      MYSQL_PASSWORD: ${DB_PASSWORD}
    volumes:
      - db_data:/var/lib/mysql
    ports:
      - "3306:3306"
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost", "-u", "root", "-p${DB_ROOT_PASSWORD}"]
      interval: 10s
      timeout: 5s
      retries: 10
      start_period: 30s
    networks:
      - app-network

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    restart: unless-stopped
    depends_on:
      db:
        condition: service_healthy
    environment:
      NODE_ENV: production
      PORT: 3001
      DB_HOST: db
      DB_PORT: 3306
      DB_NAME: ${DB_NAME}
      DB_USER: ${DB_USER}
      DB_PASSWORD: ${DB_PASSWORD}
      JWT_SECRET: ${JWT_SECRET}
      JWT_EXPIRES_IN: ${JWT_EXPIRES_IN}
      CORS_ORIGIN: ${CORS_ORIGIN}
    ports:
      - "3001:3001"
    networks:
      - app-network

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      args:
        VITE_API_URL: ${VITE_API_URL}
    restart: unless-stopped
    depends_on:
      - backend
    ports:
      - "5173:80"
    networks:
      - app-network

volumes:
  db_data:

networks:
  app-network:
    driver: bridge
```

---

## .env.example

```dotenv
# Database
DB_ROOT_PASSWORD=rootsecret
DB_NAME=ecommerce_db
DB_USER=app_user
DB_PASSWORD=appsecret

# Backend
JWT_SECRET=change-this-to-a-random-256-bit-secret
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173

# Frontend (used at build time by Vite)
VITE_API_URL=http://localhost:3001/api
```

---

## Backend Dockerfile

Multi-stage build: compile TypeScript → run compiled JS.

```dockerfile
# backend/Dockerfile

# ─── Stage 1: Build ────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src

RUN npm run build

# ─── Stage 2: Production ───────────────────────────────────
FROM node:20-alpine AS production

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist

# Copy migration SQL files (needed at runtime)
COPY src/db/migrations ./dist/db/migrations

EXPOSE 3001

# Run migrations then start the server
CMD ["sh", "-c", "node dist/db/migrate.js && node dist/index.js"]
```

**Important:** The `CMD` runs the migration script before starting the server. Since the backend `depends_on: db: condition: service_healthy`, MySQL is guaranteed to be ready before this runs.

---

## Frontend Dockerfile

Multi-stage: Vite build → Nginx static serve.

```dockerfile
# frontend/Dockerfile

# ─── Stage 1: Build ────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# VITE_API_URL must be passed as a build arg
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# ─── Stage 2: Serve ────────────────────────────────────────
FROM nginx:alpine AS production

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Custom nginx config for SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

## Nginx Configuration (SPA Routing)

Place this file at `frontend/nginx.conf`:

```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml image/svg+xml;
    gzip_min_length 1000;

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff2?)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }

    # SPA fallback — all routes serve index.html
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

**Critical:** Without `try_files $uri $uri/ /index.html`, navigating directly to `/products/aether-hoodie` or refreshing on `/account` returns 404.

---

## Backend package.json Scripts

```json
{
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "dev": "ts-node-dev --respawn --transpile-only src/index.ts",
    "migrate": "ts-node src/db/migrate.ts",
    "lint": "eslint src --ext .ts"
  }
}
```

---

## Frontend package.json Scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint src --ext .ts,.tsx"
  }
}
```

---

## Vite Configuration

```typescript
// frontend/vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      // In development: proxy /api to backend to avoid CORS
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
});
```

---

## Startup Health Check

The migration script (`migrate.js`) should include a retry loop to handle any edge case where the DB healthcheck passes but MySQL isn't quite ready to accept connections:

```typescript
// At the top of migrate.ts, before running queries:
async function waitForDb(retries = 10, delay = 2000) {
  for (let i = 0; i < retries; i++) {
    try {
      await pool.execute('SELECT 1');
      return; // DB is ready
    } catch {
      console.log(`[migrate] Waiting for DB... attempt ${i + 1}/${retries}`);
      await new Promise(r => setTimeout(r, delay));
    }
  }
  throw new Error('Database not available after max retries');
}

// Call before running migrations:
await waitForDb();
```

---

## Idempotent Migrations

All `CREATE TABLE` statements use `IF NOT EXISTS` so the migration script can be re-run safely on container restart without error. Similarly, `INSERT` seed data should use `INSERT IGNORE` or `INSERT ... ON DUPLICATE KEY UPDATE` to avoid duplicate key errors:

```sql
INSERT IGNORE INTO categories (name, slug) VALUES ('Clothing', 'clothing');
```
