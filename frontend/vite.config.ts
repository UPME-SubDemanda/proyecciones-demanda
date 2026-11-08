import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import path from 'node:path';

export default defineConfig({
  plugins: [react(), svgr()],
  resolve: { alias: { '@': path.resolve(__dirname, 'src') } },
  server: { proxy: { '/api': 'http://localhost:8000' } },
  test: { environment: 'node', include: ['src/**/*.test.ts', 'src/**/*.test.tsx'] },
});
