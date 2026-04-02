import { useState, useEffect } from 'react';
import './index.css';

interface AIResult {
  verdict: 'DANGER' | 'SAFE' | 'UNKNOWN';
  score: number;
  auditStatus: string;
  findings: string[];
  explanation: string;
}

const SCAN_STEPS = [
  "Initialize neural endpoint connection...",
  "Fetching contract bytecode & memory state...",
  "Decompiling EVM/SVM OpCodes for static analysis...",
  "Cross-referencing global scam signatures database...",
  "Running heuristics on liquidity & mint patterns...",
  "Qwen3.5 LLM synthesizing human-readable report..."
];

function App() {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState<AIResult | null>(null);
  const [status, setStatus] = useState<'idle' | 'scanning' | 'success' | 'error'>('idle');
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    let interval: any;
    if (status === 'scanning') {
      interval = setInterval(() => {
        setCurrentStepIndex((prev) => {
          if (prev < SCAN_STEPS.length - 1) return prev + 1;
          return prev;
        });
      }, 600); // Progress to next step every 600ms
    } else {
      setCurrentStepIndex(0);
    }
    return () => clearInterval(interval);
  }, [status]);

  const analyzeTx = async () => {
    if (!input.trim()) return;
    
    setStatus('scanning');
    setResponse(null);
    setCurrentStepIndex(0);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: input })
      });

      if (!res.ok) throw new Error('API Error');

      const data = await res.json();
      setResponse(data);
      setStatus('success');
    } catch (err) {
      setStatus('error');
    }
  };

  return (
    <div className="glass-container">
      <header>
        <h1>DeFi Guard</h1>
        <p className="subtitle">
          Advanced Web3 Threat Detection & Validator.<br />
          Powered by ElizaOS & Qwen3.5.
        </p>
      </header>

      <main>
        <textarea 
          placeholder="Paste a Smart Contract address (0x...) or transaction signature here..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={status === 'scanning'}
        />

        <button 
          onClick={analyzeTx} 
          disabled={status === 'scanning' || input.length < 5}
        >
          {status === 'scanning' ? 'Running Deep Scan...' : 'Analyze Code & Evaluate Risk'}
        </button>

        {status === 'scanning' && (
          <div className="terminal-window">
             {SCAN_STEPS.slice(0, currentStepIndex + 1).map((step, idx) => (
                <div key={idx} className="terminal-line">
                   <span style={{ color: '#8a8a9a' }}>[{new Date().toISOString().split('T')[1].substr(0, 8)}]</span> {step}
                </div>
             ))}
             <div className="terminal-cursor"></div>
          </div>
        )}

        {status === 'error' && (
           <div className="response-area verdict-danger">
              ❌ Connection Error. Make sure the local ElizaOS (or mock backend) is running.
           </div>
        )}

        {status === 'success' && response && (
          <div className="result-card">
             <div className="risk-header">
                <div>
                   <div style={{ fontSize: '0.9rem', color: '#8a8a9a', textTransform: 'uppercase' }}>Risk Score</div>
                   <div className={`score-badge ${response.verdict === 'DANGER' ? 'score-danger' : response.verdict === 'SAFE' ? 'score-safe' : 'score-unknown'}`}>
                      {response.score}/100
                   </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                   <div style={{ fontSize: '0.9rem', color: '#8a8a9a', textTransform: 'uppercase' }}>AI Verdict</div>
                   <div className={`verdict-tag ${response.verdict === 'DANGER' ? 'score-danger' : 'score-safe'}`}>
                      {response.verdict}
                   </div>
                   <div style={{ fontSize: '0.85rem', marginTop: '4px' }}>Status: {response.auditStatus}</div>
                </div>
             </div>

             <div>
                <div style={{ fontSize: '1rem', fontWeight: 600, color: '#f0f0f5', marginBottom: '8px' }}>Objective Findings</div>
                <div className="findings-list">
                   {response.findings.map((f, i) => (
                      <div key={i}>{f}</div>
                   ))}
                </div>
             </div>

             <div className="eli5-section">
                <h3>🧠 ELI5 Translation (Human Readable)</h3>
                <div className="eli5-text">{response.explanation}</div>
             </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
