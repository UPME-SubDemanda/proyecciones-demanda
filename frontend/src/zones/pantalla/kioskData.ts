/** Cálculos de los tableros del modo pantalla, separados de la vista para probarlos. */
import type { Point } from '../../data/types';
import { monthName } from '../../lib/format';

/**
 * Tableros disponibles, en el orden de rotación por defecto. «Variables exógenas» (3 de 5 en el mockup)
 * llega con T-21, cuando tenga mockup.
 */
export const BOARD_KEYS = ['ee', 'gn', 'comparar', 'sistema'] as const;
export type BoardKey = (typeof BOARD_KEYS)[number];

/** Tableros de la URL (`?tableros=ee,sistema`, TV-08): solo los que existen, sin repetir; por defecto todos. */
export function parseBoards(value: string | null): BoardKey[] {
  const keys = (value ?? '').split(',').map((k) => k.trim()).filter((k): k is BoardKey => (BOARD_KEYS as readonly string[]).includes(k));
  const unique = [...new Set(keys)];
  return unique.length ? unique : [...BOARD_KEYS];
}

/** Revisiones que se comparan al empezar: las tres más recientes y la más antigua. `codes` va de la más reciente a la más antigua. */
export function defaultCompared(codes: string[]): string[] {
  return [...new Set([...codes.slice(0, 3), ...codes.slice(-1)])];
}

/** Título del abanico (GRA-02): «Las revisiones recientes proyectan una demanda más baja que las de 2023». */
export function fanTitle(change: number, oldestYear: string): string {
  if (Math.abs(change) < 0.05) return `Las revisiones recientes proyectan una demanda similar a las de ${oldestYear}`;
  return `Las revisiones recientes proyectan una demanda más ${change < 0 ? 'baja' : 'alta'} que las de ${oldestYear}`;
}

/** Título de la demanda diaria (GRA-02): «La demanda de energía de septiembre supera la de 2025». */
export function dailyTitle(current: Point[], previous: Point[], lastDay: string): string {
  const avg = (ps: Point[]) => ps.reduce((s, p) => s + p.value, 0) / ps.length;
  const year = Number(lastDay.slice(0, 4)) - 1;
  const verb = avg(current) >= avg(previous) ? 'supera la' : 'está por debajo de la';
  return `La demanda de energía de ${monthName(lastDay)} ${verb} de ${year}`;
}

// Cálculos compartidos con la app interna: viven en lib/insights.ts.
export { averageGrowth, deviationTitle } from '../../lib/insights';

/** Antigüedad de los datos (TV-07): «hace 5 min», «hace 3 h», «hace 2 días». */
export function formatAge(ms: number): string {
  const min = Math.floor(ms / 60_000);
  if (min < 1) return 'hace menos de 1 min';
  if (min < 60) return `hace ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 48) return `hace ${h} h`;
  return `hace ${Math.floor(h / 24)} días`;
}
