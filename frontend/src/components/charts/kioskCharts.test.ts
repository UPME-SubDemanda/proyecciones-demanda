import { describe, expect, it } from 'vitest';
import type { BarSeriesOption } from 'echarts';
import { roles } from '../../estandares/echarts-theme.js';
import { deviationChartOption } from './kioskCharts';

const option = deviationChartOption({
  product: 'ee',
  threshold: 1.5,
  points: [{ period: '2026-08', value: 0.4 }, { period: '2026-09', value: -2.6 }],
});
const bar = (option.series as BarSeriesOption[])[0];

describe('desviación mensual (GRA-03)', () => {
  it('barras con signo; fuera de umbral en el color negativo', () => {
    const data = bar.data as { value: number; itemStyle: { color: string } }[];
    expect(data[0].itemStyle.color).toBe(roles.dark.products.ee.fill);
    expect(data[1].itemStyle.color).toBe(roles.dark.negative);
  });
  it('líneas de umbral ±', () => expect(bar.markLine?.data).toEqual([{ yAxis: 1.5 }, { yAxis: -1.5 }]));
  it('el eje incluye el umbral aunque las barras queden dentro', () => {
    const y = option.yAxis as { min: (v: { min: number }) => number; max: (v: { max: number }) => number };
    expect(y.min({ min: -0.5 })).toBeLessThanOrEqual(-1.5);
    expect(y.max({ max: 0.4 })).toBeGreaterThanOrEqual(1.5);
  });
  it('meses en formato corto', () => expect((option.xAxis as { data: string[] }).data).toEqual(['ago', 'sep']));
});
