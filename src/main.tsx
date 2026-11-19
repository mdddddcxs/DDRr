import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Anciennes adresses du type /#/donations -> /donations (le site utilisait un HashRouter)
if (!import.meta.env.VITE_PREVIEW && window.location.hash.startsWith('#/')) {
  window.history.replaceState(null, '', window.location.hash.slice(1));
}

// Liens reçus par email (invitation admin, mot de passe oublié) -> page de connexion admin
if (/[#&]type=(invite|recovery)\b/.test(window.location.hash) && window.location.pathname !== '/admin/login') {
  window.history.replaceState(null, '', '/admin/login' + window.location.hash);
}

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Élément #root introuvable');

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
