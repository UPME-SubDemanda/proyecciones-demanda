import { describe, expect, it } from 'vitest';
import type { BarSeriesOption, LineSeriesOption } from 'echarts';
import { dash, roles } from '../../estandares/echarts-theme.js';
import { dailyBarsOption, dailyComparisonOption, deviationChartOption, revisionsFanOption } from './kioskCharts';

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

describe('abanico de revisiones (GRA-06)', () => {
  const fan = revisionsFanOption({
    observed: [{ period: '2024', value: 80000 }, { period: '2025', value: 82000 }],
    revisions: [
      { label: 'Revisión jul-2026', points: [{ period: '2025', value: 82000 }, { period: '2026', value: 84000 }], color: 'c1', current: true },
      { label: 'Revisión jul-2023', points: [{ period: '2025', value: 83000 }, { period: '2026', value: 86000 }], color: 'c2', current: false },
    ],
    range: [2024, 2026], divisor: 1000, unit: 'TWh/año',
  });
  const s = fan.series as LineSeriesOption[];
  it('la vigente discontinua y más gruesa', () => {
    const cur = s.find((x) => x.name === 'Revisión jul-2026')!;
    const old = s.find((x) => x.name === 'Revisión jul-2023')!;
    expect(cur.lineStyle?.type).toEqual(dash.projection);
    expect(Number(cur.lineStyle?.width)).toBeGreaterThan(Number(old.lineStyle?.width));
  });
  it('cada revisión con su color de la paleta', () => expect(s.find((x) => x.name === 'Revisión jul-2023')!.lineStyle?.color).toBe('c2'));
  it('el real va encima y sólido', () => expect(s.at(-1)?.name).toBe('Real'));
});

describe('demanda diaria', () => {
  const opt = dailyComparisonOption({
    current: [{ period: '2026-09-01', value: 240 }], previous: [{ period: '2026-09-01', value: 234 }],
    currentLabel: '2026', previousLabel: 'Mismo día 2025', product: 'ee',
  });
  const s = opt.series as LineSeriesOption[];
  it('año anterior punteado', () => expect(s[1].lineStyle?.type).toEqual(dash.scenario));
  it('fechas cortas en el eje', () => expect((opt.xAxis as { data: string[] }).data).toEqual(['1 sep']));
  it('barras diarias desde cero (GRA-07)', () =>
    expect((dailyBarsOption({ points: [{ period: '2026-09-01', value: 1050 }], unit: 'GBTUD', product: 'gn' }).yAxis as { min: number }).min).toBe(0));
});
