import { useState, useEffect } from 'react';
import './index.css';

interface AIResult {
  verdict: 'DANGER' | 'SAFE' | 'UNKNOWN';
  score: number;
  auditStatus: string;
  findings: string[];
  explanation: string;
}

interface ScanHistory {
  date: string;
  address: string;
  verdict: 'DANGER' | 'SAFE' | 'UNKNOWN';
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
  const [scanHistory, setScanHistory] = useState<ScanHistory[]>([]);
  const [showHowTo, setShowHowTo] = useState(false);

  useEffect(() => {
    let interval: any;
    if (status === 'scanning') {
      interval = setInterval(() => {
        setCurrentStepIndex((prev) => {
          if (prev < SCAN_STEPS.length - 1) return prev + 1;
          return prev;
        });
      }, 600);
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
    setShowHowTo(false); // Sembunyikan tutorial saat mulai

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
      
      // Menambah ke tabel riwayat (Format alamat dipotong agar muat)
      if (data.verdict) {
         setScanHistory(prev => [{
            date: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
            address: input.length > 15 ? input.slice(0, 6) + "..." + input.slice(-4) : input,
            verdict: data.verdict
         }, ...prev].slice(0, 5)); // Simpan maksimum 5 recent history
      }

    } catch (err) {
      setStatus('error');
    }
  };

  return (
    <div className="glass-container">
      <header style={{ position: 'relative' }}>
        <button className="how-to-btn" onClick={() => setShowHowTo(!showHowTo)}>
           ℹ️ How It Works
        </button>

        <h1>DeFi Guard</h1>
        <p className="subtitle">
          Advanced Web3 Threat Detection & Validator.<br />
          Powered by ElizaOS & Qwen3.5.
        </p>
      </header>

      {showHowTo && (
         <div className="how-to-panel">
            <h3>🛡️ How DeFi Guard Works</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginTop: '1rem'}}>
               <p><strong>1. Input:</strong> Paste any suspicious Ethereum/Solana contract address or strange Web3 transaction signature into the box.</p>
               <p><strong>2. Static Analysis:</strong> We fetch the raw blockchain opcode and decompile it to search for hidden mints, blacklists, and hardcoded scam patterns.</p>
               <p><strong>3. Neural Validator:</strong> We feed the structured technical data into our ElizaOS (Qwen) Agent to translate the complex heuristics into an easy-to-read "ELI5" explanation.</p>
            </div>
         </div>
      )}

      <main>
        {scanHistory.length > 0 && (
           <div className="history-bar">
              <span className="history-label">Recent Scans:</span>
              <div className="history-tags">
                 {scanHistory.map((hist, idx) => (
                    <div key={idx} className={`history-tag ${hist.verdict === 'DANGER' ? 'bg-danger' : hist.verdict === 'SAFE' ? 'bg-safe' : ''}`}
                         onClick={() => setInput(hist.address)} title="Click to repaste">
                       <span>{hist.address}</span>
                       <span style={{opacity: 0.7, fontSize: '0.75rem'}}>{hist.verdict}</span>
                    </div>
                 ))}
              </div>
           </div>
        )}

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
           <div className="response-area verdict-danger" style={{ padding: '1rem', background: 'rgba(255,51,102,0.1)', border: '1px solid #ff3366', borderRadius: '12px', color: '#ff3366'}}>
              ❌ Connection Error. Backend API is unavailable or crashed.
           </div>
        )}

        {/* Bugfix Optional Chaining (?.) preventing map() crashes if findings is missing from old API */}
        {status === 'success' && response && (
          <div className="result-card">
             <div className="risk-header">
                <div>
                   <div style={{ fontSize: '0.9rem', color: '#8a8a9a', textTransform: 'uppercase' }}>Risk Score</div>
                   <div className={`score-badge ${response.verdict === 'DANGER' ? 'score-danger' : response.verdict === 'SAFE' ? 'score-safe' : 'score-unknown'}`}>
                      {response.score || 0}/100
                   </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                   <div style={{ fontSize: '0.9rem', color: '#8a8a9a', textTransform: 'uppercase' }}>AI Verdict</div>
                   <div className={`verdict-tag ${response.verdict === 'DANGER' ? 'score-danger' : 'score-safe'}`}>
                      {response.verdict || 'UNKNOWN'}
                   </div>
                   <div style={{ fontSize: '0.85rem', marginTop: '4px' }}>Status: {response.auditStatus || 'N/A'}</div>
                </div>
             </div>

             {response.findings && response.findings.length > 0 && (
                <div>
                   <div style={{ fontSize: '1rem', fontWeight: 600, color: '#f0f0f5', marginBottom: '8px' }}>Objective Findings</div>
                   <div className="findings-list">
                      {response.findings.map((f, i) => (
                         <div key={i}>{f}</div>
                      ))}
                   </div>
                </div>
             )}

             <div className="eli5-section">
                <h3>🧠 ELI5 Translation (Human Readable)</h3>
                <div className="eli5-text">
                   {response.explanation || (response as any).text || "No explanation provided."}
                </div>
             </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
