/**
 * Gráfico del histórico de revisiones (GRA-03 «¿Cómo han cambiado las versiones publicadas?»): dato real,
 * cada revisión en línea fina, la vigente discontinua (GRA-01, GRA-06) y la seleccionada resaltada.
 */
import type { EChartsOption, LineSeriesOption } from 'echarts';
import { dash, lineWidth, roles } from '../../estandares/echarts-theme.js';
import type { Point } from '../../data/types';
import { formatNumber, formatPercent } from '../../lib/format';
import type { ProductKey } from '../../lib/product';
import { inYearRange, periodLabel } from '../../lib/resolution';
import { referenceLines } from './projectionChart';

export type HistoryRevision = { code: string; label: string; points: Point[]; current: boolean };

export type HistoryChartInput = {
  product: ProductKey;
  observed: Point[];
  revisions: HistoryRevision[];
  /** Código de la revisión resaltada, o ninguno. */
  selected?: string;
  /** Color de la seleccionada (token `primary`, leído con `cssVar`). */
  selectedColor: string;
  unit: string;
  divisor?: number;
  range?: [number, number];
  dark?: boolean;
  /** Línea de publicación de la revisión resaltada (la vigente o la seleccionada), issue #40. */
  publication?: { period: string; label: string };
};

export const OTHERS = 'Otras revisiones';
export const SELECTED = 'Seleccionada';

/** Error con signo del proyectado frente al real, en %, y si sobreestimó o subestimó. */
export function errorText(projected: number, real: number): string {
  const err = ((projected - real) / real) * 100;
  const word = Math.abs(err) < 0.05 ? 'acertó' : err > 0 ? 'sobreestimó' : 'subestimó';
  return `Error ${formatPercent(err, { signed: true })} (${word})`;
}

export function historyChartOption(input: HistoryChartInput): EChartsOption {
  const theme = input.dark ? roles.dark : roles.light;
  const divisor = input.divisor ?? 1;
  const scale = (ps: Point[]) => new Map(ps.map((p) => [p.period, Math.round((p.value / divisor) * 10) / 10]));
  const real = scale(input.observed);
  const revs = input.revisions.map((r) => ({ ...r, values: scale(r.points) }));
  const periods = [...new Set([...real.keys(), ...revs.flatMap((r) => [...r.values.keys()])])]
    .sort()
    .filter((p) => inYearRange(p, input.range));
  const at = (m: Map<string, number>) => periods.map((p) => m.get(p) ?? null);
  const current = revs.find((r) => r.current);
  const selected = revs.find((r) => r.code === input.selected && !r.current);
  const focus = selected ?? current;
  const label = (text: string, color: string): LineSeriesOption['endLabel'] => ({ show: true, formatter: text, color, fontWeight: 700 });

  const series: LineSeriesOption[] = [
    ...revs
      .filter((r) => r !== current && r !== selected)
      .map<LineSeriesOption>((r) => ({
        name: OTHERS,
        type: 'line',
        data: at(r.values),
        lineStyle: { width: lineWidth.revisionPast, color: theme.revisionPast },
        itemStyle: { color: theme.revisionPast },
        emphasis: { disabled: true },
        z: 1,
      })),
    ...(selected
      ? [{
          name: SELECTED,
          type: 'line' as const,
          data: at(selected.values),
          lineStyle: { width: lineWidth.real, color: input.selectedColor },
          itemStyle: { color: input.selectedColor },
          endLabel: label(`${selected.label} (seleccionada)`, input.selectedColor),
          z: 3,
        }]
      : []),
    ...(current
      ? [{
          name: `Vigente (${current.label})`,
          type: 'line' as const,
          data: at(current.values),
          lineStyle: { width: lineWidth.projection, type: dash.projection, color: theme.products[input.product].line },
          itemStyle: { color: theme.products[input.product].line },
          endLabel: label('Vigente', theme.products[input.product].line),
          z: 2,
        }]
      : []),
    {
      name: 'Real',
      type: 'line',
      data: at(real),
      lineStyle: { width: lineWidth.real, color: theme.real },
      itemStyle: { color: theme.real },
      markLine: referenceLines(periods, theme.reference, undefined, input.publication),
      z: 4,
    },
  ];

  return {
    animationDuration: 400,
    grid: { left: 56, right: 190, top: 56, bottom: 32 },
    legend: {
      top: 0,
      left: 0,
      data: ['Real', ...(current ? [`Vigente (${current.label})`] : []), ...(selected ? [SELECTED] : []), OTHERS],
    },
    tooltip: {
      trigger: 'axis',
      formatter: (params) => {
        const list = Array.isArray(params) ? params : [params];
        const period = String(list[0]?.name ?? '');
        if (!focus) return periodLabel(period);
        const p = focus.values.get(period);
        const r = real.get(period);
        const lines = [`<strong>${periodLabel(period)} · Revisión ${focus.label}</strong>`];
        if (p !== undefined) lines.push(`Proyectado ${formatNumber(p, { decimals: 1 })} ${input.unit}`);
        if (r !== undefined) lines.push(`Real ${formatNumber(r, { decimals: 1 })} ${input.unit}`);
        if (p !== undefined && r !== undefined) lines.push(errorText(p, r));
        return lines.join('<br/>');
      },
    },
    xAxis: { type: 'category', data: periods, boundaryGap: false, axisLabel: { formatter: periodLabel } },
    yAxis: { type: 'value', name: input.unit, scale: true, axisLabel: { formatter: (v: number) => formatNumber(v) } },
    series,
  };
}

/**
 * Título con hallazgo (GRA-02) a partir del error a 12 meses de cada revisión, de la más antigua a la más
 * reciente: «Las revisiones de 2023–2024 sobreestimaron; las recientes se acercan al dato real».
 */
export function historyTitle(revisions: { year: string; error12: number | null }[]): string {
  const evaluated = revisions.filter((r) => r.error12 !== null) as { year: string; error12: number }[];
  if (evaluated.length < 3) return 'Revisiones publicadas frente al dato real';
  const half = Math.ceil(evaluated.length / 2);
  const old = evaluated.slice(0, half);
  const recent = evaluated.slice(half);
  const avg = (xs: { error12: number }[]) => xs.reduce((s, x) => s + x.error12, 0) / xs.length;
  const absAvg = (xs: { error12: number }[]) => xs.reduce((s, x) => s + Math.abs(x.error12), 0) / xs.length;
  const years = [...new Set(old.map((r) => r.year))];
  const span = years.length > 1 ? `${years[0]}–${years.at(-1)}` : years[0];
  const verb = avg(old) > 0 ? 'sobreestimaron' : 'subestimaron';
  if (absAvg(recent) < absAvg(old)) return `Las revisiones de ${span} ${verb}; las recientes se acercan al dato real`;
  return `Las revisiones recientes se alejan más del dato real que las de ${span}`;
}
