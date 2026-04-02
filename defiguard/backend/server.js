const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
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
  
  // Simulate processing delay (Qwen inference on Nosana GPU)
  setTimeout(() => {
    let reply = "";
    const lowercaseText = text.toLowerCase();
    
    // Simulate smart contract parsing logic or tx logic
    if (lowercaseText.includes("0x") || lowercaseText.includes("contract")) {
      reply = "🛑 **DANGER ALERT!** 🛑\n\nI just scanned that contract. It has a hidden `blacklist` function that allows the owner to freeze your money forever. The high APY is just bait.\n\n**ELI5 Translation:** Imagine putting your money in a bank that promises you free money, but the bank manager has a secret button to lock the doors and walk away with everything.\n\nMy recommendation: **Do not interact with this contract.**";
    } else if (lowercaseText.includes("swap") || lowercaseText.length > 30) {
      reply = "✅ **SAFE TRANSACTION** ✅\n\nI checked that signature. It is a standard swap transaction on a decentralized exchange.\n\n**What's actually happening:**\nYou are giving up exactly 1 Token, and in return, you are receiving the current market rate for the requested asset. There are no hidden fees or weird permissions being granted to unknown parties. You're good to go!";
    } else {
      reply = "Hey! I'm DeFiGuard. Drop a Smart Contract address, a transaction signature, or any confusing Web3 code here, and I'll translate it into plain English for you.";
    }

    res.json({
      user: "DeFiGuard",
      content: { text: reply }
    });
  }, 1500); // 1.5s delay to mimic LLM typing
});

// Catch-all route to serve the React app
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

app.listen(port, () => {
  console.log(`DeFiGuard Mock Backend running cleanly on port ${port}`);
  console.log(`Mocking ElizaOS /api/chat endpoint ready for frontend testing.`);
});
