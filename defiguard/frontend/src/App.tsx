import { useState } from 'react';
import './index.css';

function App() {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const analyzeTx = async () => {
    if (!input.trim()) return;
    
    setStatus('loading');
    setResponse(null);

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
      setResponse(data.content.text);
      setStatus('success');
    } catch (err) {
      setResponse("❌ Connection Error.\nMake sure the local ElizaOS (or mock backend) is running on port 3001.");
      setStatus('error');
    }
  };

  const isDanger = response?.includes('DANGER');
  const isSafe = response?.includes('SAFE');

  return (
    <div className="glass-container">
      <header>
        <h1>DeFi Guard</h1>
        <p className="subtitle">
          Your Personal Web3 Security Translator.<br />
          Powered by ElizaOS & Qwen3.5.
        </p>
      </header>

      <main>
        <textarea 
          placeholder="Paste a Smart Contract address, transaction signature, or raw code here..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={status === 'loading'}
        />

        <button 
          onClick={analyzeTx} 
          disabled={status === 'loading' || input.length < 5}
        >
          {status === 'loading' ? (
            <div className="loader">
              <div className="dot"></div><div className="dot"></div><div className="dot"></div>
            </div>
          ) : 'Analyze Code & Translate'}
        </button>

        {response && (
          <div className={`response-area ${isDanger ? 'verdict-danger' : isSafe ? 'verdict-safe' : ''}`}>
            {response}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
