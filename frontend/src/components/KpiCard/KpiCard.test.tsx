import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { KpiCard } from './KpiCard';

describe('KpiCard', () => {
  it('cifra en formato es-CO con su unidad (CON-04)', () => {
    const html = renderToStaticMarkup(<KpiCard label="Demanda EE 2026" value={85600} unit="GWh" />);
    expect(html).toContain('85.600');
    expect(html).toContain('GWh');
  });
  it('error con signo y tono malo', () => {
    const html = renderToStaticMarkup(
      <KpiCard label="Error año corrido" value={-1.8} decimals={1} signed unit="%" change="Fuera de umbral ±1,5 %" changeTone="bad" />,
    );
    expect(html).toContain('−1,8');
    expect(html).toContain('text-critical');
  });
  it('cifra como texto con tono', () => {
    const html = renderToStaticMarkup(<KpiCard label="Revisión más acertada" value={0} valueText="ene-2026" valueTone="good" unit="" />);
    expect(html).toContain('ene-2026');
    expect(html).toMatch(/text-kpi tabular text-success/);
  });
  it('procedencia y marca de cifras ilustrativas (PRI-02, CON-07)', () => {
    const html = renderToStaticMarkup(
      <KpiCard label="x" value={1} unit="GWh" provenance="Revisión jul-2026 · EE-LP v3.2.0" illustrative />,
    );
    expect(html).toContain('Revisión jul-2026 · EE-LP v3.2.0');
    expect(html).toContain('Cifras ilustrativas');
  });
});
