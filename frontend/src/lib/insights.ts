/** Hallazgos y cálculos que comparten el modo pantalla y la app interna (títulos GRA-02, umbrales). */
import type { Point } from '../data/types';
import { formatPercent, monthName } from './format';

/** Crecimiento promedio anual compuesto, en %. */
export function averageGrowth(from: number, to: number, years: number): number {
  return ((to / from) ** (1 / years) - 1) * 100;
}

/** Título con el hallazgo (GRA-02): «La demanda real va 1,8 % por debajo de la proyección vigente». */
export function deviationTitle(yearToDate: number, revisionName: string, isCurrent: boolean): string {
  const target = isCurrent ? 'la proyección vigente' : `la ${revisionName}`;
  if (Math.abs(yearToDate) < 0.05) return `La demanda real va en línea con ${target}`;
  const side = yearToDate < 0 ? 'por debajo de' : 'por encima de';
  return `La demanda real va ${formatPercent(Math.abs(yearToDate))} ${side} ${target}`;
}

/**
 * Desde qué mes del año corrido la desviación acumulada (promedio de los meses del año) está fuera del umbral
 * y no ha vuelto a entrar. `null` si hoy está dentro. `points` son meses `2026-01`… en orden.
 */
export function outOfThresholdSince(points: Point[], threshold: number): string | null {
  const year = points.at(-1)?.period.slice(0, 4);
  const months = points.filter((p) => p.period.startsWith(year ?? ''));
  let since: string | null = null;
  let sum = 0;
  months.forEach((p, i) => {
    sum += p.value;
    const outside = Math.abs(sum / (i + 1)) > threshold;
    if (outside && since === null) since = p.period;
    if (!outside) since = null;
  });
  return since;
}

/** «desde julio» a partir de `2026-07`. */
export function sinceText(period: string): string {
  return `desde ${monthName(period)}`;
}
