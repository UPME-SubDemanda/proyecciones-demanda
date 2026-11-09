/**
 * Gráfico «¿Cómo va lo real frente a lo estimado?» (GRA-03): línea real + proyección vigente + banda
 * de escenarios bajo–alto, con la codificación fija de GRA-01. Lo usan el portal, el tablero
 * ejecutivo y el modo pantalla.
 */
import type { EChartsOption, LineSeriesOption } from 'echarts';
import { dash, lineWidth, roles } from '../../estandares/echarts-theme.js';
import type { Point, RevisionValues } from '../../data/types';
import { formatNumber, formatPercent } from '../../lib/format';
import { PRODUCTS, type ProductKey } from '../../lib/product';

export type ProjectionChartInput = {
  product: ProductKey;
  observed: Point[];
  projection: RevisionValues;
  /** Nombre de la proyección: «Vigente jul-2026» o «Medio». */
  projectionLabel: string;
  /** Revisiones anteriores para comparar (línea fina, GRA-01). */
  past?: { label: string; points: Point[] }[];
  /** Periodo y texto de la línea de corte de datos: «2025», «Corte sep-2026». */
  cutoff?: { period: string; label: string };
  /** Unidad del eje y divisor: GWh → TWh/año con 1000. */
  unit: string;
  divisor?: number;
  dark?: boolean;
  kiosk?: boolean; // líneas más gruesas en modo pantalla (GRA-01)
  /** Rótulos «Bajo»/«Alto» al final de la banda, como en el portal. */
  scenarioLabels?: boolean;
  /** Pantallas angostas: márgenes y etiquetas más pequeños para dar espacio a la gráfica. */
  compact?: boolean;
};

const DATA_DECIMALS = 1;

function scale(points: Point[], divisor: number): Map<string, number> {
  return new Map(points.map((p) => [p.period, Math.round((p.value / divisor) * 10) / 10]));
}

/** Tabla equivalente al gráfico (GRA-08, A11-04) y base del CSV. */
export function projectionTable(input: ProjectionChartInput) {
  const divisor = input.divisor ?? 1;
  const real = scale(input.observed, divisor);
  const { low, mid, high } = input.projection.scenarios;
  const [l, m, h] = [scale(low, divisor), scale(mid, divisor), scale(high, divisor)];
  const periods = [...new Set([...real.keys(), ...m.keys()])].sort();
  return {
    headers: ['Año', `Real (${input.unit})`, `Bajo (${input.unit})`, `Medio (${input.unit})`, `Alto (${input.unit})`],
    rows: periods.map((p) => [p, real.get(p) ?? null, l.get(p) ?? null, m.get(p) ?? null, h.get(p) ?? null]),
  };
}

export function projectionChartOption(input: ProjectionChartInput): EChartsOption {
  const theme = input.dark ? roles.dark : roles.light;
  const productColors = theme.products[input.product];
  const divisor = input.divisor ?? 1;
  const width = input.kiosk ? lineWidth.kiosk : lineWidth.real;

  const real = scale(input.observed, divisor);
  const { low, mid, high } = input.projection.scenarios;
  const [l, m, h] = [scale(low, divisor), scale(mid, divisor), scale(high, divisor)];
  const pastScaled = (input.past ?? []).map((r) => ({ label: r.label, values: scale(r.points, divisor) }));
  const periods = [...new Set([...real.keys(), ...m.keys(), ...pastScaled.flatMap((r) => [...r.values.keys()])])].sort();
  const at = (map: Map<string, number>) => periods.map((p) => map.get(p) ?? null);

  const endLabel = (text: string, color: string): LineSeriesOption['endLabel'] => ({
    show: true, formatter: text, color, fontWeight: 700, fontSize: input.compact ? 11 : 12,
  });

  const series: LineSeriesOption[] = [
    ...pastScaled.map<LineSeriesOption>((r) => ({
      name: r.label,
      type: 'line',
      data: at(r.values),
      lineStyle: { width: lineWidth.revisionPast, color: theme.revisionPast },
      itemStyle: { color: theme.revisionPast },
      emphasis: { disabled: true },
      z: 1,
    })),
    {
      // Base transparente de la banda: el área visible va de «bajo» a «alto» (GRA-01).
      name: '_bandBase',
      type: 'line',
      data: at(l),
      stack: 'band',
      lineStyle: { opacity: 0 },
      areaStyle: { opacity: 0 },
      tooltip: { show: false },
      endLabel: input.scenarioLabels ? endLabel('Bajo', theme.scenario) : undefined,
      silent: true,
      z: 2,
    },
    {
      name: 'Escenarios bajo–alto',
      type: 'line',
      data: periods.map((p) => (h.has(p) && l.has(p) ? Math.round((h.get(p)! - l.get(p)!) * 10) / 10 : null)),
      stack: 'band',
      lineStyle: { opacity: 0 },
      areaStyle: { color: productColors.band, opacity: 1 },
      itemStyle: { color: productColors.band },
      endLabel: input.scenarioLabels ? endLabel('Alto', theme.scenario) : undefined,
      silent: true,
      z: 2,
    },
    {
      name: input.projectionLabel,
      type: 'line',
      data: at(m),
      lineStyle: { width, type: dash.projection, color: productColors.line },
      itemStyle: { color: productColors.line },
      endLabel: endLabel(input.projectionLabel, productColors.line),
      z: 3,
    },
    {
      name: 'Real',
      type: 'line',
      data: at(real),
      lineStyle: { width, color: theme.real },
      itemStyle: { color: theme.real },
      markLine: input.cutoff
        ? {
            symbol: 'none',
            silent: true,
            lineStyle: { type: dash.reference, color: theme.reference, width: 1 },
            label: { formatter: input.cutoff.label, color: theme.reference, position: 'end' },
            data: [{ xAxis: input.cutoff.period }],
          }
        : undefined,
      z: 4,
    },
  ];

  return {
    animationDuration: 400, // ≤ 500 ms (GRA-11)
    grid: input.compact ? { left: 40, right: 56, top: 72, bottom: 32 } : { left: 56, right: 120, top: 72, bottom: 32 },
    legend: {
      top: 0,
      left: 0,
      data: ['Real', input.projectionLabel, 'Escenarios bajo–alto', ...pastScaled.map((r) => r.label)],
    },
    tooltip: {
      trigger: 'axis',
      formatter: (params) => {
        const list = Array.isArray(params) ? params : [params];
        const period = String(list[0]?.name ?? '');
        const r = real.get(period);
        const e = m.get(period);
        const lines = [`<strong>${period}</strong>`];
        if (r !== undefined) lines.push(`Real: ${formatNumber(r, { decimals: DATA_DECIMALS })} ${input.unit}`);
        if (e !== undefined) lines.push(`${input.projectionLabel}: ${formatNumber(e, { decimals: DATA_DECIMALS })} ${input.unit}`);
        if (r !== undefined && e !== undefined && e !== 0)
          lines.push(`Diferencia: ${formatPercent(((r - e) / e) * 100, { signed: true })}`);
        if (l.has(period) && h.has(period))
          lines.push(`Bajo–alto: ${formatNumber(l.get(period)!, { decimals: DATA_DECIMALS })}–${formatNumber(h.get(period)!, { decimals: DATA_DECIMALS })} ${input.unit}`);
        return lines.join('<br/>');
      },
    },
    xAxis: { type: 'category', data: periods, boundaryGap: false },
    yAxis: {
      type: 'value',
      name: input.unit,
      scale: true, // líneas ajustadas al rango visible (GRA-07)
      axisLabel: { formatter: (v: number) => formatNumber(v) },
    },
    aria: { enabled: true, label: { description: `${PRODUCTS[input.product].name}: real frente a ${input.projectionLabel}` } },
    series,
  };
}
