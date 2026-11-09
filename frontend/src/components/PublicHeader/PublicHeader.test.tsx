import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { PublicHeader } from './PublicHeader';

const html = renderToStaticMarkup(
  <PublicHeader siteName="Proyecciones de demanda de energía" items={[{ label: 'Inicio', href: '/', active: true }]} />,
);

describe('PublicHeader (UPME-LEG-01, LAY-04)', () => {
  it('barra GOV.CO de 48 px enlazada a gov.co', () => {
    expect(html).toContain('bg-govco');
    expect(html).toContain('h-12');
    expect(html).toContain('href="https://www.gov.co"');
  });
  it('franja brand de 4 px bajo el encabezado', () => expect(html).toContain('border-b-4 border-brand'));
  it('ítem activo marcado con aria-current y subrayado brand', () => {
    expect(html).toContain('aria-current="page"');
    expect(html).toContain('border-brand font-bold');
  });
  it('botón de menú móvil accesible, de 44 px', () => {
    expect(html).toContain('aria-expanded="false"');
    expect(html).toMatch(/<button[^>]*h-11/);
  });
  it('enlace discreto de ingreso a la app', () => {
    const withAction = renderToStaticMarkup(
      <PublicHeader siteName="x" items={[]} action={{ label: 'Ingresar', href: '/app', icon: 'user' }} />,
    );
    expect(withAction).toContain('href="/app"');
    expect(withAction).toContain('Ingresar');
  });
  it('logo de la UPME con texto alternativo', () => expect(html).toContain('alt="UPME"'));
});
