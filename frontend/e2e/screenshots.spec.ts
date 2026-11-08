// Capturas para la guía de usuario (DOC-03). Una por página del inventario; guardar en docs/usuario/capturas/<id>.png
import { test } from '@playwright/test';

const views = [
  { id: 'portal-inicio', path: '/' },
];

for (const v of views) {
  test(`captura ${v.id}`, async ({ page }) => {
    await page.goto(v.path);
    await page.screenshot({ path: `../docs/usuario/capturas/${v.id}.png`, fullPage: true });
  });
}
