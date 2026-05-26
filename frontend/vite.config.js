import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
  // Map REACT_APP_ env vars so existing service files work without edits
  define: {
    'process.env.REACT_APP_API_BASE_URL': JSON.stringify(''),
  },
});
