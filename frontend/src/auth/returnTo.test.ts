import { describe, expect, it } from 'vitest';
import { loginUrl, safeReturnTo } from './returnTo';

describe('volver después de ingresar', () => {
  it('acepta rutas de la app', () => expect(safeReturnTo('/app/exogenas?producto=gn')).toBe('/app/exogenas?producto=gn'));
  it('rechaza otros sitios y rutas fuera de la app', () => {
    expect(safeReturnTo('https://otro.sitio')).toBe('/app');
    expect(safeReturnTo('//otro.sitio/app')).toBe('/app');
    expect(safeReturnTo('/pantalla')).toBe('/app');
    expect(safeReturnTo(null)).toBe('/app');
  });
  it('enlace de ingreso con destino', () => {
    expect(loginUrl('/app/exogenas')).toBe('/ingresar?siguiente=%2Fapp%2Fexogenas');
    expect(loginUrl('/app')).toBe('/ingresar');
  });
});
