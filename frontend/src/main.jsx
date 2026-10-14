// Guard against iframe/preview readonly fetch setter errors
try {
  const origFetch = window.fetch || globalThis.fetch;
  let currentFetch = origFetch;
  const guard = (target) => {
    if (!target) return;
    try {
      Object.defineProperty(target, 'fetch', {
        get: () => currentFetch,
        set: (val) => { if (typeof val === 'function') currentFetch = val; },
        configurable: true,
        enumerable: true
      });
    } catch {
      // Ignored
    }
  };
  guard(window);
  if (typeof globalThis !== 'undefined') guard(globalThis);
} catch {
  // Ignored
}

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
