import { describe, expect, it } from 'vitest';
import { outOfThresholdSince, sinceText } from './insights';

const months = (values: number[]) => values.map((value, i) => ({ period: `2026-${String(i + 1).padStart(2, '0')}`, value }));

describe('fuera de umbral desde…', () => {
  it('primer mes en que el acumulado del año sale del umbral y no vuelve', () =>
    expect(outOfThresholdSince(months([0.5, -0.5, -1, -2, -2.5, -3, -3, -3]), 1.5)).toBe('2026-07'));
  it('si volvió a entrar, cuenta desde la última salida', () =>
    expect(outOfThresholdSince(months([-3, 2, 2, -6, -6]), 1.5)).toBe('2026-05'));
  it('dentro del umbral: null', () => expect(outOfThresholdSince(months([0.2, -0.3, 0.1]), 1.5)).toBeNull());
  it('texto', () => expect(sinceText('2026-07')).toBe('desde julio'));
});
