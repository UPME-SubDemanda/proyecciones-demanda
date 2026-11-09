import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { PublicFooter } from './PublicFooter';

const html = renderToStaticMarkup(<PublicFooter />);

describe('PublicFooter (UPME-LEG-02)', () => {
  it('nombre oficial de la entidad (UPME-VOC-01)', () => expect(html).toContain('Unidad de Planeación Minero Energética'));
  it('enlaces legales obligatorios', () => {
    for (const text of ['Política de tratamiento de datos', 'Términos de uso y licencia de datos', 'Accesibilidad']) {
      expect(html).toContain(text);
    }
  });
  it('datos por completar visibles como marcadores (X-11)', () => expect(html).toContain('[Correo de notificaciones judiciales]'));
  it('barra inferior GOV.CO', () => {
    expect(html).toContain('bg-govco');
    expect(html).toContain('Conoce a GOV.CO');
  });
});
