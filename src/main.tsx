import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Anciennes adresses du type /#/donations -> /donations (le site utilisait un HashRouter)
if (!import.meta.env.VITE_PREVIEW && window.location.hash.startsWith('#/')) {
  window.history.replaceState(null, '', window.location.hash.slice(1));
}

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Élément #root introuvable');

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
