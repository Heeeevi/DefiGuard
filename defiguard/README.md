# DeFi Guard (TxTranslator) 🛡️

**DeFi Guard** is a highly capable Web3 security agent built with the **ElizaOS v2 framework** and powered by **Qwen3.5-27B-AWQ-4bit** via the Nosana GPU Network. 

Built specifically for the **Nosana x ElizaOS Agent Challenge**, DeFi Guard acts as a translator between complex smart contracts/blockchain transactions and regular humans. It protects crypto novices from rug pulls, drainers, and malicious functions by translating deep technical jargon into "Explain Like I'm 5" (ELI5) metaphors.

### Example Usage:
- **Input:** `0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B` (A malicious token contract).
- **DeFi Guard:** *"🛑 DANGER: This contract has a hidden `blacklist` function. The owner can freeze your funds forever. Do not interact."*

## 🛠️ Tech Stack
- **Framework:** ElizaOS v2 (Direct Client / REST).
- **LLM Engine:** Qwen3.5-27B (Nosana hosted endpoint).
- **Frontend UI:** Vite + React (TypeScript) matching premium Web3 Glassmorphism UI.
- **Infrastructure:** Node.js 23+, Multi-stage Docker, Deployed on Nosana GPU Network.

## 🚀 How to Run Locally

1. **Clone the Repo:**
   ```bash
   git clone <YOUR-FORK-URL>
   cd agent-challenge/defiguard
   ```

2. **Run Backend (Proxy/Eliza Mock):**
   ```bash
   cd backend
   npm install
   node server.js
   ```

3. **Run Frontend (Premium UI):**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   Open `http://localhost:5173`.

## 🐳 Docker Deployment (Nosana GPU Network)

Nosana deployments work purely via verified Docker containers. This project comes with a pre-configured multi-stage `Dockerfile`.

1. **Build the container:**
   ```bash
   docker build -t defiguard:latest .
   ```
2. **Push to Docker Hub or GHCR**, then deploy via the [Nosana Dashboard](https://deploy.nosana.com) by specifying your image tag and injecting your API variables.

## 🏆 Challenge Compliance Checklist
- [x] **ElizaOS Agent** - Custom character via `backend/defiguard.character.json`.
- [x] **Custom Frontend/UI** - Responsive, glassmorphism React UI.
- [x] **Docker Container** - `Dockerfile` included for unified frontend/backend distribution.
- [ ] **Deployed on Nosana** - (To be done by end-user via deploy.nosana.com).
- [ ] **Public GitHub Fork** - (To be pushed by end user).
- [ ] **Video Demo & Social Media** - Record UI flow and tweet under `#NosanaAgentChallenge`.
