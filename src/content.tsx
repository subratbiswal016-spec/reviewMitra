import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
// Inject a global tailwind output if needed, or inline styles
import './index.css';

const CUSTOM_CSS = `
.rm-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
  border: none;
  border-radius: 100px;
  padding: 5px 12px;
  color: white;
  font-size: 12px;
  font-weight: 600;
  font-family: "Google Sans", Roboto, Arial, sans-serif;
  cursor: pointer;
  box-shadow: 0 2px 5px rgba(99, 102, 241, 0.4);
  transition: all 0.2s ease;
  margin-top: 4px;
}
.rm-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(99, 102, 241, 0.5);
}
.rm-btn:active {
  transform: translateY(1px);
  box-shadow: 0 1px 2px rgba(99, 102, 241, 0.3);
}
.rm-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}
.rm-box {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 16px;
  margin-top: 12px;
  box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05);
  width: 100%;
  max-width: 450px;
  font-family: "Google Sans", Roboto, Arial, sans-serif;
}
.rm-textarea {
  width: 100%;
  min-height: 70px;
  padding: 10px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 13px;
  color: #334155;
  background: #f8fafc;
  resize: vertical;
  outline: none;
  font-family: inherit;
  line-height: 1.5;
  transition: all 0.2s;
}
.rm-textarea:focus {
  border-color: #6366f1;
  background: white;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}
.rm-copy-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 4px 8px;
  font-size: 12px;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}
.rm-copy-btn:hover {
  color: #6366f1;
  border-color: #6366f1;
  background: #eff6ff;
}
`;

if (typeof document !== 'undefined' && !document.getElementById('rm-custom-styles')) {
  const style = document.createElement('style');
  style.id = 'rm-custom-styles';
  style.textContent = CUSTOM_CSS;
  document.head.appendChild(style);
}

const GenerateReplyUI = ({ reviewText, reviewerName, rating }: { reviewText: string, reviewerName: string, rating: number }) => {
  const [drafts, setDrafts] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [customInstruction, setCustomInstruction] = useState('');
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    setDrafts([]); // Instantly clear old drafts to show the loading state
    
    try {
      const storage = await chrome.storage.local.get(['businessId']);
      const businessId = storage.businessId || '';

      const response = await fetch('https://reviewmitra-backend.onrender.com/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessId,
          reviewerName,
          rating,
          reviewText,
          customInstruction
        }),
      });

      if (!response.ok) {
        if (response.status === 402) {
          throw new Error('LIMIT_REACHED');
        }
        throw new Error('Failed to generate replies');
      }

      const data = await response.json();
      setDrafts(data.drafts || []);
    } catch (err: any) {
      if (err.message === 'LIMIT_REACHED') {
        setError('LIMIT_REACHED');
      } else {
        setError(err.message || 'An error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => {
      setCopiedIdx(null);
    }, 2000);
  };

  return (
    <div className="review-mitra-injector" style={{fontFamily: 'Inter, sans-serif'}}>
      {drafts.length === 0 && !loading && !error && (
        <button onClick={handleGenerate} className="rm-btn">
          <span>✨</span> ReviewMitra AI
        </button>
      )}

      {loading && (
        <button disabled className="rm-btn" style={{ background: '#94a3b8', boxShadow: 'none' }}>
          <span>✨</span> Generating...
        </button>
      )}

      {error && error === 'LIMIT_REACHED' ? (
        <div style={{ padding: '12px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', marginTop: '8px' }}>
          <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#991b1b', fontWeight: '500', fontFamily: 'Inter' }}>Trial Limit Reached! 🚀</p>
          <p style={{ margin: '0 0 12px 0', fontSize: '12px', color: '#b91c1c', fontFamily: 'Inter' }}>You've used all your credits. Open your dashboard to scan the QR code and renew!</p>
          <a href="https://reviewmitra-backend.onrender.com/dashboard" target="_blank" rel="noreferrer" style={{ display: 'inline-block', background: '#ef4444', color: 'white', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', textDecoration: 'none', fontFamily: 'Inter' }}>Open Dashboard to Upgrade</a>
        </div>
      ) : error && (
        <div style={{ color: '#ef4444', fontSize: '12px', padding: '8px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', marginTop: '8px' }}>{error}</div>
      )}

      {(drafts.length > 0) && (
        <div className="rm-box">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', letterSpacing: '0.5px' }}>AI DRAFTS</span>
            <span onClick={handleGenerate} style={{ fontSize: '12px', color: '#6366f1', cursor: 'pointer', fontWeight: '500' }}>Regenerate</span>
          </div>
          
          <input
            type="text"
            placeholder="Add specific instructions (e.g. 'mention we fixed the AC')"
            value={customInstruction}
            onChange={(e) => setCustomInstruction(e.target.value)}
            style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12px', marginBottom: '12px', outline: 'none' }}
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {drafts.map((draft, idx) => (
              <div key={idx} style={{ position: 'relative' }}>
                <textarea 
                  className="rm-textarea"
                  value={draft}
                  onChange={(e) => {
                    const newDrafts = [...drafts];
                    newDrafts[idx] = e.target.value;
                    setDrafts(newDrafts);
                  }}
                />
                <button 
                  onClick={() => handleCopy(draft, idx)}
                  className="rm-copy-btn"
                  title="Copy to clipboard"
                >
                  {copiedIdx === idx ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Injection logic
console.error("🚀 ReviewMitra AI Extension is RUNNING on this page!");

const injectButtons = () => {
  // We will find the review text or stars, and inject immediately AFTER them
  const anchorElements = new Set<Element>();
  
  // Find review text containers
  document.querySelectorAll('.wiI7pd, .MyEned').forEach(el => anchorElements.add(el));

  // Find stars (fallback if text is missing)
  document.querySelectorAll('[aria-label*=" stars"], [aria-label*=" star"]').forEach(el => anchorElements.add(el));

  // SUPER FALLBACK: Find the "Like" or "Share" button and inject above its container
  document.querySelectorAll('button, div[role="button"], span, a').forEach(el => {
    const text = (el.textContent || '').trim();
    if (text === 'Share' || text === 'Like' || el.getAttribute('aria-label') === 'Share') {
      const wrapper = el.closest('.d6AWV') || el.parentElement?.parentElement;
      if (wrapper && wrapper.textContent && wrapper.textContent.length > 30) {
        anchorElements.add(wrapper);
      }
    }
  });

  console.error(`[ReviewMitra] Found ${anchorElements.size} potential anchor points for injection`);

  // Group anchors by their parent review container so we only inject exactly ONCE per review!
  const reviewContainers = new Map<Element, Element>();

  anchorElements.forEach(anchor => {
    // ONLY target actual review containers, preventing injection into search results
    const container = anchor.closest('.jftiEf') || anchor.closest('[data-review-id]');
    if (container && !reviewContainers.has(container)) {
      reviewContainers.set(container, anchor);
    }
  });

  reviewContainers.forEach((anchor, container) => {
    // Check if our button ACTUALLY still exists in this review container
    // Google Maps destroys our button when the user clicks 'More', so we must check for existence
    const existingMount = container.querySelector('.review-mitra-mount');
    if (existingMount) return; // Button is still there, skip
    
    console.error('[ReviewMitra] Injecting compact button...');

    // Create mount point
    const mountPoint = document.createElement('div');
    mountPoint.className = 'review-mitra-mount';
    
    // Insert immediately AFTER the anchor (review text or stars or share button wrapper)
    anchor.after(mountPoint);

    const reviewerName = container?.querySelector('.d4r55')?.textContent || container?.querySelector('button[class*="name"]')?.textContent || 'Customer';
    const reviewText = anchor.textContent || '';
    
    // Attempt to parse rating
    const ratingEl = container?.querySelector('.kvMYJc') || container?.querySelector('[aria-label*=" stars"]') || anchor;
    const ariaLabel = ratingEl?.getAttribute('aria-label') || '';
    const ratingMatch = ariaLabel.match(/\d/);
    const rating = ratingMatch ? parseInt(ratingMatch[0]) : 5; // Default to 5

    const root = createRoot(mountPoint);
    root.render(
      <React.StrictMode>
        <GenerateReplyUI 
          reviewerName={reviewerName}
          reviewText={reviewText}
          rating={rating}
        />
      </React.StrictMode>
    );
  });
};

// Run the injector when the DOM is ready and observe for new reviews loading in
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', injectButtons);
} else {
  injectButtons();
}

// Observe mutations for dynamically loaded reviews
const observer = new MutationObserver(() => {
  // Disconnect briefly to avoid reacting to our own DOM changes if needed, 
  // though the data-rm-injected attribute handles most of it.
  injectButtons();
});

observer.observe(document.body, { childList: true, subtree: true });
