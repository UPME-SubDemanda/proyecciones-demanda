/**
 * Gráficos secundarios del modo pantalla (TV-05).
 * Desviación mensual: «Desviación por periodo → barras con signo alrededor de cero» (GRA-03).
 */
import type { BarSeriesOption, EChartsOption } from 'echarts';
import { dash, roles } from '../../estandares/echarts-theme.js';
import type { Point } from '../../data/types';
import { formatMonth, formatPercent } from '../../lib/format';
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
