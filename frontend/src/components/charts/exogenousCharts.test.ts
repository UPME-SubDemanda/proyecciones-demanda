import { describe, expect, it } from 'vitest';
import type { BarSeriesOption, LineSeriesOption } from 'echarts';
import { dash, roles } from '../../estandares/echarts-theme.js';
import { demoExogenousMonitor } from '../../demo/fixtures';
import { BREAK_LABEL, correlationChartOption, importanceChartOption, sparklineOption } from './exogenousCharts';

const gdp = demoExogenousMonitor('ee').variables.find((v) => v.code === 'gdp')!;
const colors = { line: 'var(--primary)', event: 'var(--surface-sunken)', eventLabel: 'var(--warning)' };

describe('gráficos del monitor de exógenas', () => {
  it('tendencia: observado sólido del color real y supuesto punteado (GRA-01)', () => {
    const series = sparklineOption(gdp.trend.observed, gdp.trend.assumption.mid).series as LineSeriesOption[];
    const observed = series.find((s) => s.name === 'Observado')!;
    const assumption = series.find((s) => s.name === 'Supuesto')!;
    expect(observed.lineStyle?.color).toBe(roles.light.real);
    expect(observed.lineStyle?.type).toBeUndefined();
    expect(assumption.lineStyle?.type).toEqual(dash.scenario);
  });

  it('correlación: banda del intervalo con el color del producto y quiebre como área (GRA-01)', () => {
    const option = correlationChartOption({ product: 'ee', rolling: gdp.rolling, breakFrom: gdp.breakFrom, colors });
    const series = option.series as LineSeriesOption[];
    const band = series.find((s) => s.name === 'Intervalo del 95 %')!;
    expect(band.areaStyle?.color).toBe(roles.light.products.ee.band);
    const line = series.find((s) => s.name === 'Correlación')!;
    expect(line.markArea?.label?.formatter).toBe(BREAK_LABEL);
    expect(line.markArea?.data?.[0]).toEqual([{ xAxis: '2025-01' }, { xAxis: '2026-09' }]);
  });

  it('correlación sin quiebre: sin área marcada', () => {
    const option = correlationChartOption({ product: 'ee', rolling: gdp.rolling, breakFrom: null, colors });
    const line = (option.series as LineSeriesOption[]).find((s) => s.name === 'Correlación')!;
    expect(line.markArea).toBeUndefined();
  });

  it('importancia: barras horizontales desde cero, la mayor arriba (GRA-03, GRA-07)', () => {
    const option = importanceChartOption(demoExogenousMonitor('ee').importance!, 'var(--primary)');
    const yAxis = option.yAxis as { data: string[] };
    expect(yAxis.data.at(-1)).toBe('Población');
    expect((option.xAxis as { min: number }).min).toBe(0);
    expect(((option.series as BarSeriesOption[])[0].data as number[]).at(-1)).toBe(31);
  });
});
