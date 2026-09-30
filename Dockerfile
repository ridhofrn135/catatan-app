# --- Stage 1: build dependencies ---
FROM node:20-alpine AS deps
WORKDIR /app

# better-sqlite3 perlu build tools karena native module
RUN apk add --no-cache python3 make g++

COPY package.json package-lock.json* ./
RUN npm install --omit=dev --no-audit --no-fund

# --- Stage 2: runtime image ---
FROM node:20-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production

# Jalankan sebagai user non-root (best practice keamanan)
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./
COPY src ./src
COPY views ./views
COPY public ./public

RUN mkdir -p /app/data && chown -R appuser:appgroup /app

USER appuser

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', r => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

CMD ["node", "src/server.js"]
