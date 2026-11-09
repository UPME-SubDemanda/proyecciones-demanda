import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { SideNav } from './SideNav';

const html = renderToStaticMarkup(
  <MemoryRouter>
    <SideNav
      appName="Proyecciones de demanda"
      activePath="/app"
      search="?producto=gn"
      groups={[
        { items: [{ label: 'Inicio', path: '/app', icon: 'home' }] },
        { label: 'Operación', items: [{ label: 'Alertas', path: '/app/alertas', icon: 'alerts', count: 3 }] },
      ]}
    />
  </MemoryRouter>,
);

describe('SideNav (LAY-04, A11-03)', () => {
  it('menú con nombre accesible', () => expect(html).toContain('aria-label="Menú de la aplicación"'));
  it('ítem activo con aria-current y barra brand', () => {
    expect(html).toContain('aria-current="page"');
    expect(html).toContain('w-[3px] rounded-pill bg-brand');
  });
  it('conserva el producto al navegar (LAY-07)', () => expect(html).toContain('href="/app/alertas?producto=gn"'));
  it('contador en critical (UX-05)', () => expect(html).toMatch(/bg-critical[^>]*>3</));
  it('título del grupo', () => expect(html).toContain('Operación'));
});
