import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import path from 'node:path';

export default defineConfig({
  plugins: [react(), svgr()],
  resolve: { alias: { '@': path.resolve(__dirname, 'src') } },
  server: {
    // Fuera de Docker la API está en localhost:8000; dentro, en el servicio `api` (API_PROXY_TARGET).
    proxy: { '/api': process.env.API_PROXY_TARGET ?? 'http://localhost:8000' },
    // En Docker con la carpeta montada, los cambios del equipo no siempre llegan como eventos: se revisa periódicamente.
    watch: process.env.VITE_USE_POLLING === 'true' ? { usePolling: true, interval: 300 } : undefined,
  },
  test: { environment: 'node', include: ['src/**/*.test.ts', 'src/**/*.test.tsx'] },
});
