import { describe, expect, it } from 'vitest';
import { parseRange, rangeYears, yearToDateEstimate } from './dashboardData';

describe('tablero ejecutivo', () => {
  it('rango de la URL con valor por defecto (UX-01)', () => {
    expect(parseRange('5')).toBe('5');
    expect(parseRange('todo')).toBe('todo');
    expect(parseRange('20')).toBe('10');
    expect(parseRange(null)).toBe('10');
  });
  it('años visibles: historia y 5 de proyección', () => {
    expect(rangeYears('10', 2025)).toEqual([2015, 2030]);
    expect(rangeYears('5', 2025)).toEqual([2020, 2030]);
    expect(rangeYears('todo', 2025)).toBeUndefined();
  });
  it('estimado del año corrido', () => expect(yearToDateEstimate(85000, -1.8)).toBeCloseTo(83470));
});
