/**
 * Gráficos secundarios del modo pantalla (TV-05).
 * Desviación mensual: «Desviación por periodo → barras con signo alrededor de cero» (GRA-03).
 */
import type { BarSeriesOption, EChartsOption, LineSeriesOption } from 'echarts';
import { dash, lineWidth, roles } from '../../estandares/echarts-theme.js';
import type { Point } from '../../data/types';
import { formatMonth, formatNumber, formatPercent } from '../../lib/format';
import { inYearRange, periodLabel } from '../../lib/resolution';
import type { ProductKey } from '../../lib/product';

export type DeviationInput = {
  product: ProductKey;
  points: Point[]; // % por mes, `period` = `2026-09`
  threshold: number; // ± % (X-03)
  dark?: boolean;
  kiosk?: boolean;
};

/** Barras con signo; fuera de umbral en `negative` (= critical), dentro en el relleno del producto (GRA-01). */
export function deviationChartOption({ product, points, threshold, dark = true, kiosk = true }: DeviationInput): EChartsOption {
  const theme = dark ? roles.dark : roles.light;
  const fontSize = kiosk ? 16 : 12;
  const data: BarSeriesOption['data'] = points.map((p) => ({
    value: p.value,
    itemStyle: { color: Math.abs(p.value) > threshold ? theme.negative : theme.products[product].fill },
  }));
  return {
    animationDuration: 400,
    grid: { left: 64, right: 56, top: 24, bottom: 32 },
    tooltip: {
      trigger: 'axis',
      formatter: (params) => {
        const p = (Array.isArray(params) ? params : [params])[0];
        const point = points[p?.dataIndex ?? 0];
        return `${formatMonth(point.period)}: ${formatPercent(point.value, { signed: true })}`;
      },
    },
    xAxis: {
      type: 'category',
      data: points.map((p) => formatMonth(p.period).split('-')[0]),
      axisLabel: { fontSize },
    },
    yAxis: {
      type: 'value', // las etiquetas ya llevan «%» (GRA-07)
      splitNumber: 3,
      // El eje siempre incluye las líneas de umbral, aunque las barras queden dentro.
      min: (v: { min: number }) => Math.floor(Math.min(v.min, -threshold * 1.3)),
      max: (v: { max: number }) => Math.ceil(Math.max(v.max, threshold * 1.3)),
      axisLabel: { fontSize, formatter: (v: number) => formatPercent(v, { decimals: 0 }) },
    },
    series: [
      {
        type: 'bar',
        name: 'Desviación',
        data,
        markLine: {
          symbol: 'none',
          silent: true,
          lineStyle: { type: dash.reference, color: theme.reference },
          label: { formatter: (p) => formatPercent(Number(p.value), { signed: true }), color: theme.reference, fontSize },
          data: [{ yAxis: threshold }, { yAxis: -threshold }],
        },
      },
    ],
  };
}

/** Revisión para el abanico de revisiones (GRA-03 «¿Cómo han cambiado las versiones publicadas?»). */
export type FanRevision = { label: string; points: Point[]; color: string; current: boolean };

/**
 * Abanico de revisiones: escenario medio de cada revisión sobre el dato real. Paleta `chart.series`
 * en orden; la vigente siempre discontinua y más gruesa (GRA-06).
 */
export function revisionsFanOption({
  observed, revisions, range, divisor, unit, dark = true, kiosk = true,
}: { observed: Point[]; revisions: FanRevision[]; range: [number, number]; divisor: number; unit: string; dark?: boolean; kiosk?: boolean }): EChartsOption {
  const theme = dark ? roles.dark : roles.light;
  const fontSize = kiosk ? 16 : 12;
  const scaleMap = (points: Point[]) => new Map(points.map((p) => [p.period, Math.round((p.value / divisor) * 10) / 10]));
  const real = scaleMap(observed);
  const scaled = revisions.map((r) => ({ ...r, values: scaleMap(r.points) }));
  const periods = [...new Set([...real.keys(), ...scaled.flatMap((r) => [...r.values.keys()])])]
    .sort()
    .filter((p) => inYearRange(p, range));
  const at = (m: Map<string, number>) => periods.map((p) => m.get(p) ?? null);
  return {
    animationDuration: 400,
    textStyle: { fontSize },
    grid: { left: 64, right: 40, top: 40, bottom: 40 },
    tooltip: {
      trigger: 'axis',
      formatter: (params) => {
        const list = Array.isArray(params) ? params : [params];
        return [`<strong>${periodLabel(String(list[0]?.name ?? ''))}</strong>`, ...list
          .filter((p) => p.value !== null && p.value !== undefined)
          .map((p) => `${p.seriesName}: ${formatNumber(Number(p.value), { decimals: 1 })} ${unit}`)].join('<br/>');
      },
    },
    xAxis: { type: 'category', data: periods, boundaryGap: false, axisLabel: { fontSize, formatter: periodLabel } },
    yAxis: { type: 'value', name: unit, scale: true, nameTextStyle: { fontSize }, axisLabel: { fontSize, formatter: (v: number) => formatNumber(v) } },
    series: [
      ...scaled.map<LineSeriesOption>((r) => ({
        name: r.label,
        type: 'line',
        data: at(r.values),
        lineStyle: { width: r.current ? lineWidth.kiosk : 2, type: r.current ? dash.projection : 'solid', color: r.color },
        itemStyle: { color: r.color },
        z: r.current ? 3 : 2,
      })),
      {
        name: 'Real',
        type: 'line',
        data: at(real),
        lineStyle: { width: kiosk ? lineWidth.kiosk : lineWidth.real, color: theme.real },
        itemStyle: { color: theme.real },
        z: 4,
      },
    ],
  };
}

/** Demanda diaria: año actual (línea sólida del producto) frente al mismo día del año anterior (punteada). */
export function dailyComparisonOption({
  current, previous, currentLabel, previousLabel, product, dark = true,
}: { current: Point[]; previous: Point[]; currentLabel: string; previousLabel: string; product: ProductKey; dark?: boolean }): EChartsOption {
  const theme = dark ? roles.dark : roles.light;
  const fontSize = 16;
  return {
    animationDuration: 400,
    textStyle: { fontSize },
    grid: { left: 64, right: 24, top: 48, bottom: 40 },
    legend: { top: 0, right: 0, textStyle: { fontSize }, data: [currentLabel, previousLabel] },
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: current.map((p) => `${Number(p.period.slice(8))} ${formatMonth(p.period).split('-')[0]}`),
      axisLabel: { fontSize, interval: 6 },
      boundaryGap: false,
    },
    yAxis: { type: 'value', name: 'GWh', scale: true, nameTextStyle: { fontSize }, axisLabel: { fontSize, formatter: (v: number) => formatNumber(v) } },
    series: [
      {
        name: currentLabel,
        type: 'line',
        data: current.map((p) => p.value),
        lineStyle: { width: lineWidth.kiosk, color: theme.products[product].line },
        itemStyle: { color: theme.products[product].line },
        z: 3,
      },
      {
        name: previousLabel,
        type: 'line',
        data: previous.map((p) => p.value),
        lineStyle: { width: 2, type: dash.scenario, color: theme.scenario },
        itemStyle: { color: theme.scenario },
        z: 2,
      },
    ],
  };
}

/** Barras diarias de un producto (relleno del producto, GRA-01), desde cero (GRA-07). */
export function dailyBarsOption({ points, unit, product, dark = true }: { points: Point[]; unit: string; product: ProductKey; dark?: boolean }): EChartsOption {
  const theme = dark ? roles.dark : roles.light;
  const fontSize = 16;
  return {
    animationDuration: 400,
    grid: { left: 64, right: 16, top: 24, bottom: 24 },
    tooltip: {
      trigger: 'axis',
      formatter: (params) => {
        const p = (Array.isArray(params) ? params : [params])[0];
        const point = points[p?.dataIndex ?? 0];
        return `${point.period}: ${formatNumber(point.value)} ${unit}`;
      },
    },
    xAxis: { type: 'category', data: points.map((p) => p.period), axisLabel: { show: false }, axisTick: { show: false } },
    yAxis: { type: 'value', min: 0, axisLabel: { fontSize, formatter: (v: number) => formatNumber(v) } },
    series: [{ type: 'bar', name: unit, data: points.map((p) => p.value), itemStyle: { color: theme.products[product].fill }, barWidth: '60%' }],
  };
}
