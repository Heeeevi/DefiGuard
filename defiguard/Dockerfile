# Multi-stage Dockerfile for Nosana Deployment

# Stage 1: Build Frontend (Vite)
FROM node:23-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend .
RUN npm run build

# Stage 2: Setup Backend (ElizaOS mock / Express)
FROM node:23-alpine AS backend-builder
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install --production
COPY backend .

# Stage 3: Final Production Image
FROM node:23-alpine
WORKDIR /app

# Copy backend
COPY --from=backend-builder /app/backend /app/backend

# Copy built frontend inside the expected express static directory
COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist

# Expose backend port
EXPOSE 3001

# Start the unified backend
WORKDIR /app/backend
CMD ["node", "server.js"]
