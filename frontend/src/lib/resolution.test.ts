import { describe, expect, it } from 'vitest';
import { eeChartUnit, effectiveResolution, inYearRange, parseResolution, periodLabel, periodYear } from './resolution';

describe('resolución de las gráficas (issue #40)', () => {
  it('lee la URL: solo «mensual» es mensual', () => {
    expect(parseResolution('mensual')).toBe('M');
    expect(parseResolution(null)).toBe('A');
    expect(parseResolution('otra')).toBe('A');
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
