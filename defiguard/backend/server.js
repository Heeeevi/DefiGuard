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

// Simple deterministic hash function to generate a strict 0-100 score based on input string
function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const charCode = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + charCode;
    hash |= 0;
  }
  return Math.abs(hash) % 101; // Returns 0-100
}

// Generate fake trace info deterministically
function getTraceInfo(hashValue) {
  const isOld = hashValue % 2 === 0;
  const txCount = (hashValue * 142) % 30000;
  if (isOld) return `Deployed: ${hashValue % 12 || 1} months ago | Total Tx: ${txCount.toLocaleString()}`;
  return `Deployed: ${hashValue % 24 || 1} hours ago | Total Tx: ${txCount.toLocaleString()}`;
}

// Generate explanation deterministically
function getExplanation(verdict, score) {
  if (verdict === 'DANGER') {
    return "This contract holds critical centralization flaws. Imagine putting your money in a bank that promises you high APY, but the manager has a secret backdoor to freeze your wallet. The code pattern matches multiple known rugpulls. Do not interact!";
  } else if (verdict === 'WARN') {
    return "This contract is generally functional but exhibits unusual permission structures. A large portion of the liquidity is not permanently locked, meaning the developer theoretically could pull funds in the future. Proceed with strict caution.";
  } else {
    return "The code is clean. You are interacting with a standard, unimpeded contract. There are no hidden fees, no freezing backdoors, and the liquidity is appropriately managed. You are good to go!";
  }
}

function getMetrics(verdict) {
  if (verdict === 'DANGER') {
    return [
       { kpi: "Honeypot Risk", status: "FAIL", desc: "Detected strict restrictions on sell functions (users cannot sell)." },
       { kpi: "Centralization", status: "FAIL", desc: "Owner commands a hidden `blacklist` array allowing arbitrary wallet freezing." },
       { kpi: "Liquidity Lock", status: "WARN", desc: "98% of liquidity volume is unvested and held in a single EOA wallet." },
       { kpi: "Code Verifiability", status: "FAIL", desc: "Source code resembles popular router templates but lacks official deployment verification." }
    ];
  } else if (verdict === 'WARN') {
    return [
       { kpi: "Honeypot Risk", status: "PASS", desc: "Sell paths appear unimpeded through standard test swaps." },
       { kpi: "Centralization", status: "WARN", desc: "Ownership is NOT renounced. Developer can alter tax fees." },
       { kpi: "Liquidity Lock", status: "WARN", desc: "Liquidity is locked, but the lock duration expires in less than 30 days." },
       { kpi: "Code Verifiability", status: "PASS", desc: "Source code is published, but contains untested custom logic." }
    ];
  } else {
    return [
       { kpi: "Honeypot Risk", status: "PASS", desc: "Sell paths are completely unimpeded. Native routing verified." },
       { kpi: "Centralization", status: "PASS", desc: "Ownership renounced. No administrative backdoors or freezing parameters exist." },
       { kpi: "Liquidity Lock", status: "PASS", desc: "Majority of liquidity pool tokens are permanently burned or timelocked." },
       { kpi: "Code Verifiability", status: "PASS", desc: "Source code matches known standard libraries (e.g., Uniswap/Raydium)." }
    ];
  }
}

// Mock ElizaOS chat endpoint
app.post('/api/chat', (req, res) => {
  const { text } = req.body;
  if (!text || text.length < 5) return res.status(400).json({ error: "Invalid text" });
  
  // Detect Network
  let network = "Unknown";
  if (text.toLowerCase().startsWith("0x")) {
    network = "Ethereum / EVM";
  } else if (/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(text) || text.length > 44) {
    network = "Solana Network";
  } else {
    network = "Multichain / Unknown";
  }

  // Generate dynamic deterministic score
  const dynamicScore = hashString(text);
  
  // Threshold logic
  let dynamicVerdict = 'SAFE';
  let auditStatus = 'Verified Open-Source';
  
  if (dynamicScore > 70) {
    dynamicVerdict = 'DANGER';
    auditStatus = 'Unverified / Malicious Code';
  } else if (dynamicScore > 30) {
    dynamicVerdict = 'WARN';
    auditStatus = 'Verified with Warnings';
  }

  const traceInfo = getTraceInfo(dynamicScore);

  setTimeout(() => {
    res.json({
      verdict: dynamicVerdict,
      score: dynamicScore,
      auditStatus: auditStatus,
      network: network,
      trace: traceInfo,
      metrics: getMetrics(dynamicVerdict),
      explanation: getExplanation(dynamicVerdict, dynamicScore)
    });
  }, 2500); // 2.5 seconds delay
});

// Catch-all route to serve the React app
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

app.listen(port, () => {
  console.log(`DeFiGuard Mock Backend running cleanly on port ${port}`);
  console.log(`Mocking ElizaOS /api/chat endpoint ready for frontend testing.`);
});
