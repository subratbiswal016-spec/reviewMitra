import { useState, useEffect } from 'react'

function App() {
  const [businessId, setBusinessId] = useState('');
  const [status, setStatus] = useState('Checking...');

  useEffect(() => {
    // Load saved settings
    chrome.storage?.local.get(['businessId'], (result: any) => {
      if (result.businessId) {
        setBusinessId(result.businessId);
      }
      setStatus('Ready to generate replies!');
    });
  }, []);

  const handleSave = async () => {
    if (!businessId.trim()) {
      setStatus('Please enter a Business ID');
      return;
    }

    setStatus('Verifying ID...');

    try {
      const response = await fetch('https://reviewmitra-backend.onrender.com/api/business/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId: businessId.trim() })
      });

      const data = await response.json();

      if (data.valid) {
        chrome.storage?.local.set({ businessId: businessId.trim() }, () => {
          setStatus('Ready to generate replies!');
        });
      } else {
        setStatus('Business ID is incorrect!');
      }
    } catch (error) {
      setStatus('Failed to connect to server');
    }
  };

  return (
    <div className="p-4 bg-slate-50 min-h-screen text-slate-800 flex flex-col items-center">
      <div className="w-full flex items-center justify-center gap-2 mb-6 border-b pb-4">
        <span className="text-2xl">✨</span>
        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">ReviewMitra AI</h1>
      </div>
      
      <div className="w-full bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-4">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Settings</h2>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 mb-1">Business ID</label>
          <input 
            type="text" 
            value={businessId}
            onChange={(e) => setBusinessId(e.target.value)}
            placeholder="e.g. clabc123..."
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
          />
          <p className="text-xs text-slate-400 mt-1">Get this from your dashboard</p>
        </div>

        <button 
          onClick={handleSave}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition-colors"
        >
          Save Settings
        </button>
      </div>

      <div className="mt-auto w-full text-center">
        <p className={`text-xs flex items-center justify-center gap-1 font-medium ${
          status.includes('incorrect') || status.includes('Failed') ? 'text-red-500' : 
          status.includes('Ready') ? 'text-green-600' : 'text-slate-500'
        }`}>
          {status.includes('Ready') && <span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span>}
          {status.includes('incorrect') && <span className="w-2 h-2 rounded-full bg-red-500 inline-block"></span>}
          {status}
        </p>
      </div>
    </div>
  )
}

export default App
