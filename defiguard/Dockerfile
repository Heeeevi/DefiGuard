# syntax=docker/dockerfile:1
# ============================================================
# DeFi Guard — Full Stack Dockerfile for Nosana Deployment
# Runs ElizaOS Agent (Port 3000) + DeFi Guard Bridge UI (Port 3001)
# ============================================================

FROM node:23-slim AS base

# Install system dependencies
RUN apt-get update && apt-get install -y \
  python3 \
  make \
  g++ \
  git \
  curl \
  unzip \
  && rm -rf /var/lib/apt/lists/*

# Install Bun (required by ElizaOS)
RUN curl -fsSL https://bun.sh/install | bash
ENV PATH="/root/.bun/bin:${PATH}"

# Disable telemetry
ENV ELIZAOS_TELEMETRY_DISABLED=true
ENV DO_NOT_TRACK=1

# ============================================================
# Stage 1: Setup ElizaOS Agent
# ============================================================
WORKDIR /app/eliza

# Clone the official challenge starter and install
RUN git clone https://github.com/nosana-ci/agent-challenge.git .
RUN bun install
RUN bun i -g @elizaos/cli

# Copy our DeFiGuard character
COPY backend/defiguard.character.json ./characters/defiguard.character.json

# ============================================================
# Stage 2: Build DeFi Guard Frontend
# ============================================================
WORKDIR /app/defiguard/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend ./
RUN npm run build

# ============================================================
# Stage 3: Setup DeFi Guard Bridge
# ============================================================
WORKDIR /app/defiguard/backend
COPY backend/package*.json ./
RUN npm install --production
COPY backend ./

# ============================================================
# Stage 4: Create startup script
# ============================================================
WORKDIR /app

RUN cat > /app/start.sh << 'STARTSCRIPT'
#!/bin/bash
set -e

# Start ElizaOS Agent in background (Port 3000)
cd /app/eliza
elizaos start --character ./characters/defiguard.character.json &
ELIZA_PID=$!

# Wait for ElizaOS to be ready
echo "⏳ Waiting for ElizaOS to start on port 3000..."
for i in $(seq 1 30); do
  if curl -s http://localhost:3000/api/agents > /dev/null 2>&1; then
    echo "✅ ElizaOS is ready!"
    break
  fi
  sleep 2
done

# Start DeFi Guard Bridge (Port 3001)
cd /app/defiguard/backend
node server.js &
BRIDGE_PID=$!

echo "🛡️  DeFi Guard is LIVE!"
echo "   ElizaOS Agent: http://localhost:3000"
echo "   DeFi Guard UI: http://localhost:3001"

# Keep container alive
wait $ELIZA_PID $BRIDGE_PID
STARTSCRIPT

RUN chmod +x /app/start.sh

# Create data directory for SQLite
RUN mkdir -p /app/eliza/data

# Expose both ports
EXPOSE 3000 3001

ENV NODE_ENV=production

CMD ["/bin/bash", "/app/start.sh"]
