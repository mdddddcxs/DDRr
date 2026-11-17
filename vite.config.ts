import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Aucune clé secrète n'est injectée dans le code du navigateur.
// Seules les variables préfixées VITE_ (publiques par nature) sont exposées.
export default defineConfig({
  server: { port: 3000, host: '0.0.0.0' },
  plugins: [react(), tailwindcss()],
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
  build: { sourcemap: false, chunkSizeWarningLimit: 900 },
});
