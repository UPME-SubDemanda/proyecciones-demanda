import { describe, expect, it } from 'vitest';
import { averageGrowth, deviationTitle, formatAge, parseBoards } from './kioskData';

describe('cálculos del modo pantalla', () => {
  it('tableros de la URL (TV-08)', () => {
    expect(parseBoards('gn')).toEqual(['gn']);
    expect(parseBoards('gn,ee,gn,agua')).toEqual(['gn', 'ee']);
    expect(parseBoards(null)).toEqual(['ee', 'gn']);
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
