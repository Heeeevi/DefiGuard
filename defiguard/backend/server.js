const express = require('express');
const cors = require('cors');
const path = require('path');
const axios = require('axios');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

// The port where ElizaOS local agent framework is running
const ELIZA_PORT = 3000; 

app.use(cors());
app.use(express.json());

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Helper to clean markdown json blocks if the LLM hallucinated them
function cleanJsonResponse(rawText) {
  let cleaned = rawText.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '');
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.replace(/\s*```$/, '');
  }
  return cleaned;
}

// REST Client Bridge pointing to Real ElizaOS
app.post('/api/chat', async (req, res) => {
  const { text } = req.body;
  
  if (!text || text.length < 5) {
     return res.status(400).json({ error: "Invalid text input." });
  }

  try {
    // 1. Fetch available agents from ElizaOS framework
    const agentsRes = await axios.get(`http://localhost:${ELIZA_PORT}/agents`);
    const agents = agentsRes.data?.agents;
    
    if (!agents || agents.length === 0) {
      throw new Error("No ElizaOS agents are currently running.");
    }

    // Usually grab the first available agent (DeFiGuard)
    const agentId = agents[0].id;

    // 2. Forward the user request to the ElizaOS agent
    const messagePayload = {
      text: text,
      roomId: "default-room",
      userId: "user",
      userName: "user"
    };

    const elizaRes = await axios.post(`http://localhost:${ELIZA_PORT}/${agentId}/message`, messagePayload);
    
    // Eliza's response is typically an array of generated text messages
    // e.g. [ { user: 'DeFiGuard', text: '{ "verdict": "SAFE", ... }' } ]
    if (!elizaRes.data || elizaRes.data.length === 0) {
      throw new Error("ElizaOS model returned an empty response.");
    }

    const rawResponseText = elizaRes.data[0].text;
    
    // 3. Parse JSON Strict Output
    const cleanedString = cleanJsonResponse(rawResponseText);
    const parsedJsonData = JSON.parse(cleanedString);

    // Provide a standardized response to the React Frontend
    return res.json(parsedJsonData);

  } catch (error) {
    console.error("ElizaOS Bridge Error:", error.message);
    
    // Fallback Mock Response just in case ElizaOS crashes or timeout during Live Demo
    console.log("Serving Fallback Deterministic Response from server.js...");
    const dynamicScore = Math.abs(text.split('').reduce((a,b)=>{a=((a<<5)-a)+b.charCodeAt(0);return a&a},0)) % 101;
    const isDanger = dynamicScore > 70;
    
    setTimeout(() => {
      res.json({
        verdict: isDanger ? "DANGER" : "SAFE",
        score: dynamicScore,
        auditStatus: isDanger ? "Unverified / Malicious" : "Verified Open-Source",
        network: text.toLowerCase().startsWith("0x") ? "Ethereum / EVM" : "Solana Network",
        trace: `Deployed: ${dynamicScore % 12 + 1} months ago | Fallback Logic Activated`,
        metrics: [
           { kpi: "Honeypot Risk", status: isDanger ? "FAIL" : "PASS", desc: "Fallback mock data analysis" },
           { kpi: "Centralization", status: isDanger ? "FAIL" : "PASS", desc: "Fallback mock data analysis" },
           { kpi: "Liquidity Lock", status: "WARN", desc: "Fallback mock data analysis" },
           { kpi: "Code Verifiability", status: isDanger ? "FAIL" : "PASS", desc: "Fallback mock data analysis" }
        ],
        explanation: `(PROXY ERROR: Could not connect to Eliza on Port ${ELIZA_PORT}. Check terminal logs. You are seeing a fallback mock). The contract scored a ${dynamicScore} out of 100.`
      });
    }, 2500);
  }
});

// Catch-all route to serve the React app
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

app.listen(port, () => {
  console.log(`DeFiGuard ElizaOS BRIDGE running on port ${port}`);
  console.log(`Waiting to route queries to real ElizaOS worker on port ${ELIZA_PORT}...`);
});
