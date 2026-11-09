import { describe, expect, it } from 'vitest';
import { averageGrowth, dailyTitle, defaultCompared, deviationTitle, fanTitle, formatAge, parseBoards } from './kioskData';

describe('cálculos del modo pantalla', () => {
  it('tableros de la URL (TV-08)', () => {
    expect(parseBoards('gn')).toEqual(['gn']);
    expect(parseBoards('sistema,ee,sistema,agua')).toEqual(['sistema', 'ee']);
    expect(parseBoards(null)).toEqual(['ee', 'gn', 'comparar', 'sistema']);
  });
  it('revisiones comparadas al empezar: tres recientes y la más antigua', () =>
    expect(defaultCompared(['2026-07', '2026-01', '2025-07', '2025-01', '2024-07', '2023-07'])).toEqual(['2026-07', '2026-01', '2025-07', '2023-07']));
  it('títulos con hallazgo (GRA-02)', () => {
    expect(fanTitle(-5.4, '2023')).toBe('Las revisiones recientes proyectan una demanda más baja que las de 2023');
    expect(dailyTitle([{ period: '2026-09-01', value: 240 }], [{ period: '2026-09-01', value: 234 }], '2026-09-30'))
      .toBe('La demanda de energía de septiembre supera la de 2025');
  });
  it('crecimiento promedio anual', () => expect(averageGrowth(100, 121, 2)).toBeCloseTo(10));
  it('título con hallazgo (GRA-02)', () => {
    expect(deviationTitle(-1.8, 'Revisión jul-2026', true)).toBe('La demanda real va 1,8 % por debajo de la proyección vigente');
    expect(deviationTitle(0.6, 'Revisión ene-2026', false)).toBe('La demanda real va 0,6 % por encima de la Revisión ene-2026');
  });
  it('antigüedad de los datos (TV-07)', () => {
    expect(formatAge(30_000)).toBe('hace menos de 1 min');
    expect(formatAge(5 * 60_000)).toBe('hace 5 min');
    expect(formatAge(3 * 3_600_000)).toBe('hace 3 h');
    expect(formatAge(72 * 3_600_000)).toBe('hace 3 días');
  });
});
