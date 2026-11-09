import { defineConfig } from '@playwright/test';

// BASE_URL permite capturar contra otro servidor, p. ej. `pnpm dev --port 5174` mientras el contenedor
// `web` de Docker (5173) corre una imagen anterior: BASE_URL=http://localhost:5174 pnpm screenshots
const baseURL = process.env.BASE_URL ?? 'http://localhost:5173';

export default defineConfig({
  use: { baseURL, viewport: { width: 1440, height: 900 }, locale: 'es-CO' },
  webServer: { command: 'pnpm dev', url: baseURL, reuseExistingServer: true },
});
