import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { Button } from './Button';

describe('Button', () => {
  it('es un <button type="button"> nativo (CMP-03)', () => {
    const html = renderToStaticMarkup(<Button>Descargar datos</Button>);
    expect(html).toMatch(/^<button type="button"/);
    expect(html).toContain('Descargar datos');
  });
  it('primario con tokens de acción', () =>
    expect(renderToStaticMarkup(<Button variant="primary">Abrir</Button>)).toContain('bg-primary text-on-primary'));
  it('con href es un enlace', () =>
    expect(renderToStaticMarkup(<Button href="/datos">Ir a datos</Button>)).toMatch(/^<a href="\/datos"/));
  it('deshabilitado explica por qué', () => {
    const html = renderToStaticMarkup(<Button disabledReason="Necesita el rol modeler">Ejecutar</Button>);
    expect(html).toContain('disabled=""');
    expect(html).toContain('title="Necesita el rol modeler"');
  });
  it('tamaño pequeño de 32 px', () => expect(renderToStaticMarkup(<Button size="sm">Datos</Button>)).toContain('h-8'));
});
