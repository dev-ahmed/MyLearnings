import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/books/',
  server: {
    port: 8650,
    host: true,
  },
  build: {
    outDir: 'dist',
  },
});
