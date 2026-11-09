// Capturas para la guía de usuario (DOC-03). Una por página del inventario; guardar en docs/usuario/capturas/<id>.png
// Las vistas del portal también se capturan en móvil (<id>-movil.png, 390 px, LAY-08).
import { expect, test } from '@playwright/test';

const views = [
  { id: 'portal-inicio', path: '/', mobile: true },
];

for (const v of views) {
  test(`captura ${v.id}`, async ({ page }) => {
    await page.goto(v.path);
    // Espera a que el gráfico tenga su lienzo, para no capturar los esqueletos de carga.
    await expect(page.locator('[data-chart-card] canvas').first()).toBeVisible();
    await page.screenshot({ path: `../docs/usuario/capturas/${v.id}.png`, fullPage: true });
  });

  if (v.mobile) {
    test(`captura ${v.id} en móvil`, async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(v.path);
      await expect(page.locator('[data-chart-card] canvas').first()).toBeVisible();
      await page.screenshot({ path: `../docs/usuario/capturas/${v.id}-movil.png`, fullPage: true });
    });
  }
}
