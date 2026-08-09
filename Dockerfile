# ── Build stage ──
FROM node:18-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --production=false 2>/dev/null || npm install
COPY . .
# Create windy-keys.ts from example if missing
RUN test -f src/api/windy-keys.ts || cp src/api/windy-keys.example.ts src/api/windy-keys.ts
RUN npm run build

# ── Production stage ──
FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.cjs ./
EXPOSE 5199
HEALTHCHECK --interval=30s CMD node -e "require('http').get('http://localhost:5199/health',r=>{process.exit(r.statusCode===200?0:1)})"
USER node
CMD ["node", "server.cjs"]
