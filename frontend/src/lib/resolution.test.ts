import { describe, expect, it } from 'vitest';
import {
  eeChartUnit, effectiveResolution, inYearRange, parseResolution, periodLabel, periodYear, publicationLabel, publicationPeriod, publicationWindow,
} from './resolution';

describe('resolución de las gráficas (issue #40)', () => {
  it('mensual por omisión; solo «anual» en la URL es anual', () => {
    expect(parseResolution(null)).toBe('M');
    expect(parseResolution('anual')).toBe('A');
    expect(parseResolution('otra')).toBe('M');
  });
  it('ventana de la revisión: un año antes de la publicación a un año después del último dato real', () => {
    expect(publicationWindow('2026-07-31', '2026-10')).toEqual([2025, 2027]);
    expect(publicationWindow('2023-12-31', '2026-10')).toEqual([2022, 2027]);
  });
  it('línea de publicación en la resolución de la gráfica', () => {
    expect(publicationPeriod('2026-07-31', 'M')).toBe('2026-07');
    expect(publicationPeriod('2026-07-31', 'A')).toBe('2026');
    expect(publicationLabel('2026-07-31')).toBe('Publicado');
  });
  it('gas natural siempre se ve anual', () => {
    expect(effectiveResolution('gn', 'M')).toBe('A');
    expect(effectiveResolution('ee', 'M')).toBe('M');
  });
  it('periodos anuales y mensuales', () => {
    expect(periodYear('2026-04')).toBe(2026);
    expect(periodLabel('2026-04')).toBe('abr-2026');
    expect(periodLabel('2026')).toBe('2026');
    expect(inYearRange('2026-04', [2020, 2026])).toBe(true);
    expect(inYearRange('2027-01', [2020, 2026])).toBe(false);
  });
  it('energía eléctrica: TWh por año o GWh por mes', () => {
    expect(eeChartUnit('A')).toMatchObject({ unit: 'TWh/año', divisor: 1000 });
    expect(eeChartUnit('M')).toMatchObject({ unit: 'GWh/mes', divisor: 1 });
  });
});
