import { describe, expect, it } from 'vitest';
import {
  formatDate, formatMonth, formatNumber, formatPercent, formatProvenance, formatValue, revisionLabel,
} from './format';

describe('formatos es-CO (CON-04, CON-05, CON-06)', () => {
  it('miles con punto, también con cuatro cifras', () => {
    expect(formatNumber(85600)).toBe('85.600');
    expect(formatNumber(1042)).toBe('1.042');
  });
  it('coma decimal y signo menos tipográfico', () => expect(formatNumber(-1.8, { decimals: 1 })).toBe('−1,8'));
  it('signo explícito cuando se pide', () => expect(formatNumber(2.9, { decimals: 1, signed: true })).toBe('+2,9'));
  it('unidad con espacio que no se parte', () => expect(formatValue(85600, 'GWh')).toBe('85.600\u00A0GWh'));
  it('porcentaje con espacio antes del signo', () => expect(formatPercent(-1.8)).toBe('−1,8\u00A0%'));
  it('fecha en texto', () => expect(formatDate('2026-10-15')).toBe('15 oct 2026'));
  it('mes y revisión', () => {
    expect(formatMonth('2026-09')).toBe('sep-2026');
    expect(revisionLabel('2026-07')).toBe('Revisión jul-2026');
  });
  it('procedencia en orden y sin partes vacías', () => {
    expect(formatProvenance({ version: 'Revisión jul-2026', method: 'EE-LP v3.2.0', cutoff: '2026-09', source: 'XM' }))
      .toBe('Revisión jul-2026 · EE-LP v3.2.0 · datos a sep-2026 · Fuente: XM');
    expect(formatProvenance({ cutoff: '2026-09', source: 'XM' })).toBe('Datos a sep-2026 · Fuente: XM');
  });
});
