import { defineConfig } from '@playwright/test';

export default defineConfig({
  use: { baseURL: 'http://localhost:5173', viewport: { width: 1440, height: 900 }, locale: 'es-CO' },
  webServer: { command: 'pnpm dev', port: 5173, reuseExistingServer: true },
});
