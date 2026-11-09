/**
 * Gráficos del monitor de exógenas (T-11), con ECharts y el tema de marca (GRA-00):
 * - tendencia de cada variable en la tabla: observado sólido frente al supuesto punteado (GRA-01, GRA-03 «¿Se cumple un supuesto?»);
 * - correlación móvil con banda del intervalo y el tramo de quiebre (GRA-03 «¿Cómo cambia una relación?»);
 * - importancia de las variables en barras horizontales ordenadas (GRA-03 «¿Qué variable explica más?»).
 */
import type { BarSeriesOption, EChartsOption, LineSeriesOption } from 'echarts';
import { dash, lineWidth, roles } from '../../estandares/echarts-theme.js';
import type { Point, VariableImportance } from '../../data/types';
import { formatMonth, formatNumber, formatPercent } from '../../lib/format';
import type { ProductKey } from '../../lib/product';

/** Línea corta sin ejes para una celda de tabla: observado sólido y supuesto punteado. */
export function sparklineOption(observed: Point[], assumption: Point[]): EChartsOption {
  const theme = roles.light;
  const all = [...observed, ...assumption].map((p) => p.value);
  const pad = (Math.max(...all) - Math.min(...all)) * 0.15 || Math.abs(all[0] ?? 1) * 0.05 || 1;
  return {
    animation: false,
    grid: { left: 2, right: 2, top: 4, bottom: 4 },
    xAxis: { type: 'category', show: false, data: observed.map((p) => p.period), boundaryGap: false },
    yAxis: { type: 'value', show: false, min: Math.min(...all) - pad, max: Math.max(...all) + pad },
    tooltip: { show: false },
    series: [
      {
        name: 'Supuesto',
        type: 'line',
        data: assumption.map((p) => p.value),
        symbol: 'none',
        lineStyle: { width: 1, type: dash.scenario, color: theme.scenario },
        silent: true,
      },
      {
        name: 'Observado',
        type: 'line',
        data: observed.map((p) => p.value),
        symbol: 'none',
        lineStyle: { width: 2, color: theme.real },
        silent: true,
      },
    ],
  };
}

export type CorrelationChartInput = {
  product: ProductKey;
  rolling: { period: string; value: number; low: number; high: number }[];
  breakFrom: string | null;
  /** Color de la línea (token `primary`), del sombreado del quiebre (`surface-sunken`) y de su etiqueta (`warning`). */
  colors: { line: string; event: string; eventLabel: string };
};

export const BREAK_LABEL = 'Quiebre detectado (CUSUM)';

/** Correlación móvil de 24 meses con el intervalo del 95 % como banda (GRA-01) y el quiebre como evento (`markArea`). */
export function correlationChartOption(input: CorrelationChartInput): EChartsOption {
  const theme = roles.light;
  const periods = input.rolling.map((p) => p.period);
  const band = theme.products[input.product].band;
  const last = periods.at(-1);
  const series: LineSeriesOption[] = [
    {
      name: 'Límite inferior',
      type: 'line',
      data: input.rolling.map((p) => p.low),
      stack: 'ic',
      symbol: 'none',
      lineStyle: { opacity: 0 },
      areaStyle: { opacity: 0 },
      silent: true,
      z: 1,
    },
    {
      name: 'Intervalo del 95 %',
      type: 'line',
      data: input.rolling.map((p) => Math.round((p.high - p.low) * 100) / 100),
      stack: 'ic',
      symbol: 'none',
      lineStyle: { opacity: 0 },
      areaStyle: { color: band },
      itemStyle: { color: band },
      silent: true,
      z: 1,
    },
    {
      name: 'Correlación',
      type: 'line',
      data: input.rolling.map((p) => p.value),
      symbol: 'none',
      lineStyle: { width: lineWidth.real, color: input.colors.line },
      itemStyle: { color: input.colors.line },
      z: 3,
      markArea: input.breakFrom && last
        ? {
            silent: true,
            itemStyle: { color: input.colors.event },
            label: { show: true, position: 'insideTopRight', color: input.colors.eventLabel, fontWeight: 700, formatter: BREAK_LABEL },
            data: [[{ xAxis: input.breakFrom }, { xAxis: last }]],
          }
        : undefined,
    },
  ];
  return {
    animationDuration: 400,
    grid: { left: 56, right: 24, top: 64, bottom: 32 },
    legend: { top: 0, left: 0, data: ['Correlación', 'Intervalo del 95 %'] },
    tooltip: {
      trigger: 'axis',
      formatter: (params) => {
        const list = Array.isArray(params) ? params : [params];
        const i = list[0]?.dataIndex ?? 0;
        const p = input.rolling[i];
        if (!p) return '';
        return [
          `<strong>${formatMonth(p.period)}</strong>`,
          `Correlación ${formatNumber(p.value, { decimals: 2 })}`,
          `Intervalo del 95 %: ${formatNumber(p.low, { decimals: 2 })} a ${formatNumber(p.high, { decimals: 2 })}`,
        ].join('<br/>');
      },
    },
    xAxis: {
      type: 'category',
      data: periods,
      boundaryGap: false,
      axisLabel: { interval: (_: number, value: string) => value.endsWith('-01'), formatter: (value: string) => value.slice(0, 4) },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value',
      name: 'Correlación',
      scale: true,
      minInterval: 0.1,
      axisLabel: { formatter: (v: number) => formatNumber(v, { decimals: 1 }) },
    },
    series,
  };
}

/** Importancia relativa ordenada de mayor a menor, de arriba abajo; barras desde cero (GRA-07). */
export function importanceChartOption(items: VariableImportance[], color: string): EChartsOption {
  const sorted = [...items].sort((a, b) => a.share - b.share); // ECharts dibuja la categoría 0 abajo
  const series: BarSeriesOption = {
    name: 'Importancia',
    type: 'bar',
    data: sorted.map((i) => i.share),
    barMaxWidth: 24,
    itemStyle: { color },
    label: { show: true, position: 'right', formatter: (p) => formatPercent(Number(p.value), { decimals: 0 }) },
  };
  return {
    animationDuration: 400,
    grid: { left: 8, right: 56, top: 8, bottom: 32, containLabel: true },
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, valueFormatter: (v) => formatPercent(Number(v), { decimals: 0 }) },
    xAxis: { type: 'value', name: '%', min: 0, axisLabel: { formatter: (v: number) => formatNumber(v) } },
    yAxis: { type: 'category', data: sorted.map((i) => i.name), axisTick: { show: false } },
    series: [series],
  };
}
