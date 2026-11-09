// Capturas para la guía de usuario (DOC-03). Una por página del inventario; guardar en docs/usuario/capturas/<id>.png
// Las vistas del portal también se capturan en móvil (<id>-movil.png, 390 px, LAY-08).
// El modo pantalla se captura a 1920 × 1080, su tamaño de diseño (TV-01).
// Las vistas de la app interna se capturan con una sesión simulada: se responde /api/v1/auth/me con un
// usuario de ejemplo, sin credenciales reales.
import { expect, test, type Page } from '@playwright/test';

type View = {
  id: string;
  path: string;
  mobile?: boolean;
  tablet?: boolean;
  viewport?: { width: number; height: number };
  /** Necesita sesión (app interna). */
  session?: boolean;
  /** Qué esperar antes de capturar; por defecto, el lienzo de un gráfico. */
  ready?: string;
};

const EXAMPLE_USER = { id: 1, email: 'equipo.demanda@upme.gov.co', name: 'Equipo de Demanda (ejemplo)', roles: ['viewer'] };

const views: View[] = [
  { id: 'portal-inicio', path: '/', mobile: true },
  { id: 'modo-pantalla', path: '/pantalla?intervalo=60', viewport: { width: 1920, height: 1080 } },
  { id: 'modo-pantalla-comparar-proyecciones', path: '/pantalla?tableros=comparar&intervalo=60', viewport: { width: 1920, height: 1080 } },
  { id: 'modo-pantalla-el-sistema-hoy', path: '/pantalla?tableros=sistema&intervalo=60', viewport: { width: 1920, height: 1080 } },
  { id: 'app-inicio', path: '/app', session: true, tablet: true, viewport: { width: 1280, height: 800 }, ready: 'h1' },
];

async function open(page: Page, v: View) {
  if (v.session) {
    await page.route('**/api/v1/auth/me', (route) => route.fulfill({ json: EXAMPLE_USER }));
  }
  await page.goto(v.path);
  await expect(page.locator(v.ready ?? 'canvas').first()).toBeVisible();
  await page.waitForTimeout(600); // fin de la animación de entrada (≤ 500 ms, GRA-11)
}

for (const v of views) {
  test(`captura ${v.id}`, async ({ page }) => {
    if (v.viewport) await page.setViewportSize(v.viewport);
    await open(page, v);
    await page.screenshot({ path: `../docs/usuario/capturas/${v.id}.png`, fullPage: !v.viewport || !!v.session });
  });

  if (v.mobile) {
    test(`captura ${v.id} en móvil`, async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await open(page, v);
      await page.screenshot({ path: `../docs/usuario/capturas/${v.id}-movil.png`, fullPage: true });
    });
  }

  if (v.tablet) {
    test(`captura ${v.id} en tablet`, async ({ page }) => {
      await page.setViewportSize({ width: 820, height: 1000 });
      await open(page, v);
      await page.screenshot({ path: `../docs/usuario/capturas/${v.id}-tablet.png` });
    });
  }
}
