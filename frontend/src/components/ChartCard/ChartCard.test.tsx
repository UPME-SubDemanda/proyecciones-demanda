import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { ChartCard } from './ChartCard';

const html = renderToStaticMarkup(
  <ChartCard
    title="La demanda real va 1,8 % por debajo de la proyección vigente"
    subtitle="Energía eléctrica, SIN · TWh por año · Revisión jul-2026"
    option={{}}
    table={{ headers: ['Año', 'Real (TWh/año)'], rows: [['2025', 83.1], ['2026', null]] }}
    download={{ context: 'ee', version: 'rev-2026-07', content: 'real-vs-proyeccion', source: 'XM, UPME' }}
    illustrative
  />,
);

describe('ChartCard (GRA-02, GRA-08)', () => {
  it('título con el hallazgo como h2 y subtítulo', () => {
    expect(html).toMatch(/<h2[^>]*>La demanda real va 1,8 % por debajo/);
    expect(html).toContain('Revisión jul-2026');
  });
  it('acciones: datos, imagen, tabla y pantalla completa', () => {
    for (const action of ['Descargar datos', 'Descargar imagen', 'Ver como tabla', 'Pantalla completa']) {
      expect(html).toContain(action);
    }
  });
  it('tabla accesible equivalente con cifras es-CO', () => {
    expect(html).toContain('<table');
    expect(html).toContain('83,1');
    expect(html).toContain('—');
  });
  it('fuente y marca de cifras ilustrativas (CON-07)', () => {
    expect(html).toContain('Fuente: XM, UPME.');
    expect(html).toContain('Cifras ilustrativas');
  });
});
