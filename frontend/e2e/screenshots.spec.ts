// Capturas para la guía de usuario (DOC-03). Una por página del inventario; guardar en docs/usuario/capturas/<id>.png
// Las vistas del portal también se capturan en móvil (<id>-movil.png, 390 px, LAY-08).
// El modo pantalla se captura a 1920 × 1080, su tamaño de diseño (TV-01).
import { expect, test } from '@playwright/test';

type View = { id: string; path: string; mobile?: boolean; viewport?: { width: number; height: number } };

const views: View[] = [
  { id: 'portal-inicio', path: '/', mobile: true },
  { id: 'modo-pantalla', path: '/pantalla?intervalo=60', viewport: { width: 1920, height: 1080 } },
];

for (const v of views) {
  test(`captura ${v.id}`, async ({ page }) => {
    if (v.viewport) await page.setViewportSize(v.viewport);
    await page.goto(v.path);
    // Espera a que el gráfico tenga su lienzo, para no capturar los esqueletos de carga.
    await expect(page.locator('canvas').first()).toBeVisible();
    await page.waitForTimeout(600); // fin de la animación de entrada (≤ 500 ms, GRA-11)
    await page.screenshot({ path: `../docs/usuario/capturas/${v.id}.png`, fullPage: !v.viewport });
  });

  if (v.mobile) {
    test(`captura ${v.id} en móvil`, async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(v.path);
      await expect(page.locator('canvas').first()).toBeVisible();
      await page.waitForTimeout(600);
      await page.screenshot({ path: `../docs/usuario/capturas/${v.id}-movil.png`, fullPage: true });
    });
  }
}
