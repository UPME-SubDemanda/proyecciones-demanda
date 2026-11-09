/** Cálculos del tablero ejecutivo, separados de la vista para probarlos. */

export const RANGES = ['5', '10', 'todo'] as const;
export type RangeKey = (typeof RANGES)[number];
export const RANGE_LABEL: Record<RangeKey, string> = { '5': '5 años', '10': '10 años', todo: 'Todo' };
export const DEFAULT_RANGE: RangeKey = '10';
/** Años de proyección que se ven después del último dato real con los rangos cortos. */
const AHEAD = 5;

export function parseRange(value: string | null): RangeKey {
  return (RANGES as readonly string[]).includes(value ?? '') ? (value as RangeKey) : DEFAULT_RANGE;
}

/** Años visibles: N años de historia antes del último dato real y 5 de proyección; «Todo» sin recorte. */
export function rangeYears(range: RangeKey, lastObservedYear: number): [number, number] | undefined {
  if (range === 'todo') return undefined;
  return [lastObservedYear - Number(range), lastObservedYear + AHEAD];
}

/** Valor estimado del año corrido: lo proyectado para el año, corregido por la desviación acumulada. */
export function yearToDateEstimate(projected: number, deviationPct: number): number {
  return projected * (1 + deviationPct / 100);
}
