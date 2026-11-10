/** Cálculos del tablero ejecutivo, separados de la vista para probarlos. */

export const RANGES = ['revision', '5', '10', 'todo'] as const;
export type RangeKey = (typeof RANGES)[number];
/** «Revisión»: un año antes de la publicación de la vigente a un año después del último dato real (issue #40). */
export const RANGE_LABEL: Record<RangeKey, string> = { revision: 'Revisión', '5': '5 años', '10': '10 años', todo: 'Todo' };
export const DEFAULT_RANGE: RangeKey = '10';
/** Años de proyección que se ven después del último dato real con los rangos cortos. */
const AHEAD = 5;

/** Rango elegido en la URL; sin elegir, «Revisión» en mensual y 10 años en anual. */
export function parseRange(value: string | null, monthly = false): RangeKey {
  if ((RANGES as readonly string[]).includes(value ?? '')) return value as RangeKey;
  return monthly ? 'revision' : DEFAULT_RANGE;
}

/** Años visibles: N años de historia antes del último dato real y 5 de proyección; «Todo» sin recorte. */
export function rangeYears(range: RangeKey, lastObservedYear: number, revisionWindow?: [number, number]): [number, number] | undefined {
  if (range === 'todo') return undefined;
  if (range === 'revision') return revisionWindow ?? [lastObservedYear - 1, lastObservedYear + 1];
  return [lastObservedYear - Number(range), lastObservedYear + AHEAD];
}

/** Valor estimado del año corrido: lo proyectado para el año, corregido por la desviación acumulada. */
export function yearToDateEstimate(projected: number, deviationPct: number): number {
  return projected * (1 + deviationPct / 100);
}
