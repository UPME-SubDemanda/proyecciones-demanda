import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { Banner } from './Banner';

describe('Banner (UX-05)', () => {
  const html = renderToStaticMarkup(
    <Banner title="La proyección vigente de energía eléctrica está fuera de umbral desde julio" action={<button type="button">Ver alertas</button>}>
      La demanda real va 1,8 % por debajo de lo proyectado en 2026.
    </Banner>,
  );
  it('se anuncia como alerta, con ícono y texto (A11-05)', () => {
    expect(html).toContain('role="alert"');
    expect(html).toContain('<svg');
    expect(html).toContain('fuera de umbral desde julio');
  });
  it('fondo y borde de estado crítico', () => expect(html).toContain('bg-critical-soft border border-critical'));
  it('acción hacia la causa', () => expect(html).toContain('Ver alertas'));
});
