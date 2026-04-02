const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Mock ElizaOS chat endpoint
app.post('/api/chat', (req, res) => {
  const { text } = req.body;
  
  // Simulate processing delay for the terminal animation
  setTimeout(() => {
    let reply = {};
    const lowercaseText = text.toLowerCase();
    
    if (lowercaseText.includes("0x") || lowercaseText.includes("contract") || lowercaseText.includes("token")) {
      reply = {
        verdict: "DANGER",
        score: 92,
        auditStatus: "Unverified / Cloned Code",
        metrics: [
           { kpi: "Honeypot Risk", status: "FAIL", desc: "Detected strict restrictions on sell functions (users cannot sell)." },
           { kpi: "Centralization", status: "FAIL", desc: "Owner commands a hidden `blacklist` array allowing arbitrary wallet freezing." },
           { kpi: "Liquidity Lock", status: "WARN", desc: "98% of liquidity volume is unvested and held in a single EOA wallet." },
           { kpi: "Code Verifiability", status: "WARN", desc: "Source code resembles popular router templates but lacks official deployment verification." }
        ],
        explanation: "Imagine putting your money in a bank that promises you free money, but the bank manager has a secret button to lock the doors and walk away with everything. The high APY is just bait. Do not interact with this contract."
      };
    } else if (lowercaseText.includes("swap") || lowercaseText.length > 30) {
      reply = {
        verdict: "SAFE",
        score: 12,
        auditStatus: "Verified Open-Source",
        metrics: [
           { kpi: "Honeypot Risk", status: "PASS", desc: "Sell paths are completely unimpeded. Native routing verified." },
           { kpi: "Centralization", status: "PASS", desc: "Ownership renounced. No administrative backdoors or freezing parameters exist." },
           { kpi: "Liquidity Lock", status: "PASS", desc: "Majority of liquidity pool tokens are permanently burned or timelocked." },
           { kpi: "Code Verifiability", status: "PASS", desc: "Source code matches known standard libraries (e.g., Uniswap/Raydium)." }
        ],
        explanation: "You are giving up exactly 1 Token, and in return, you are receiving the current market rate for the requested asset. There are no hidden fees or weird permissions being granted to unknown parties. You're good to go!"
      };
    } else {
      reply = {
        verdict: "UNKNOWN",
        score: 0,
        auditStatus: "N/A",
        metrics: [
           { kpi: "Analysis Status", status: "WARN", desc: "Input signature not recognized as parsable bytecode or tx hash." }
        ],
        explanation: "Hey! I'm DeFiGuard. Drop a Smart Contract address (e.g. 0x...), a transaction signature, or any confusing Web3 code here, and I'll translate it into plain English for you."
      };
    }

    res.json(reply);
  }, 4000); // 4 seconds delay to allow terminal animations to play out
});

// Catch-all route to serve the React app
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

app.listen(port, () => {
  console.log(`DeFiGuard Mock Backend running cleanly on port ${port}`);
  console.log(`Mocking ElizaOS /api/chat endpoint ready for frontend testing.`);
});
