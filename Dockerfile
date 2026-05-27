# syntax=docker/dockerfile:1
# Imagen de producción: compila React y sirve SPA + API desde un único servicio Node.
FROM node:20-bookworm-slim AS frontend-build
WORKDIR /build/frontend
COPY frontend/package*.json frontend/.npmrc ./
RUN npm ci --no-audit --no-fund
COPY frontend/ ./
ARG VITE_API_URL=/api
ENV VITE_API_URL=${VITE_API_URL}
RUN npm run build

FROM node:20-bookworm-slim AS backend-dependencies
WORKDIR /app
COPY backend/package*.json backend/.npmrc ./
RUN npm ci --omit=dev --no-audit --no-fund

FROM node:20-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
COPY --from=backend-dependencies /app/node_modules ./node_modules
COPY backend/package.json ./package.json
COPY backend/src ./src
COPY database ./database
COPY --from=frontend-build /build/frontend/dist ./public
EXPOSE 3000
CMD ["node", "src/server.js"]
