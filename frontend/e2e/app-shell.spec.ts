// Recorrido de la estructura de la app interna (T-08) con una sesión simulada.
// Se ejecuta con: pnpm exec playwright test e2e/app-shell.spec.ts
import { expect, test } from '@playwright/test';

const USER = { id: 1, email: 'equipo.demanda@upme.gov.co', name: 'Equipo de Demanda (ejemplo)', roles: ['viewer'] };

test('el portal lleva a la app; sin sesión pasa por ingresar', async ({ page }) => {
  await page.route('**/api/v1/auth/me', (route) => route.fulfill({ status: 401, json: { detail: 'Sin sesión' } }));
  await page.goto('/');
  await page.getByRole('link', { name: 'Ingresar' }).click();
  await expect(page).toHaveURL(/\/ingresar$/);
  await expect(page.getByRole('link', { name: 'Volver al portal público' })).toBeVisible();
});

test('una página interna sin sesión vuelve a ella después de ingresar', async ({ page }) => {
  await page.route('**/api/v1/auth/me', (route) => route.fulfill({ status: 401, json: { detail: 'Sin sesión' } }));
  await page.goto('/app?producto=gn');
  await expect(page).toHaveURL(/\/ingresar\?siguiente=%2Fapp%3Fproducto%3Dgn$/);
});

test('con sesión: menú, producto en la URL y menú del usuario', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.route('**/api/v1/auth/me', (route) => route.fulfill({ json: USER }));
  await page.goto('/app');
  const nav = page.getByRole('navigation', { name: 'Menú de la aplicación' });
  await expect(nav.getByRole('link', { name: 'Inicio', exact: true })).toHaveAttribute('aria-current', 'page');
  await page.getByRole('button', { name: 'Gas natural' }).click();
  await expect(page).toHaveURL(/producto=gn/);
  await expect(nav.getByRole('link', { name: 'Inicio', exact: true })).toHaveAttribute('href', '/app?producto=gn');
  await page.getByRole('button', { name: /Equipo de Demanda/ }).click();
  await expect(page.getByRole('link', { name: 'Ir al portal público' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Cerrar sesión' })).toBeVisible();
});

test('en tablet el menú se pliega y se abre con «Menú»', async ({ page }) => {
  await page.setViewportSize({ width: 820, height: 1000 });
  await page.route('**/api/v1/auth/me', (route) => route.fulfill({ json: USER }));
  await page.goto('/app');
  await expect(page.getByRole('navigation', { name: 'Menú de la aplicación' })).toBeHidden();
  await page.getByRole('button', { name: 'Menú' }).click();
  await expect(page.getByRole('dialog', { name: 'Menú de la aplicación' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toBeHidden();
});

test('histórico de revisiones: menú, selección, escenario y búsqueda', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.route('**/api/v1/auth/me', (route) => route.fulfill({ json: USER }));
  await page.goto('/app');
  await page.getByRole('link', { name: 'Histórico de revisiones' }).click();
  await expect(page).toHaveURL(/\/app\/proyecciones\/historico/);
  await expect(page.getByText('Proyecciones / Histórico de revisiones')).toBeVisible();
  const table = page.getByRole('table', { name: /Revisiones publicadas/ });
  await table.getByRole('row', { name: /Jul-2023/ }).click();
  await expect(page).toHaveURL(/revision=2023-07/);
  await page.getByRole('button', { name: 'Alto', exact: true }).click();
  await expect(page).toHaveURL(/escenario=high/);
  await page.getByRole('searchbox').fill('v3.2');
  await expect(table.getByRole('row')).toHaveCount(2); // encabezado + vigente
  await expect(page.getByRole('button', { name: /Comparar/ })).toBeDisabled();
});
