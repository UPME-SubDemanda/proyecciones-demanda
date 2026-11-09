/** Cálculos de los tableros del modo pantalla, separados de la vista para probarlos. */
import { formatPercent } from '../../lib/format';
import { PRODUCT_KEYS, type ProductKey } from '../../lib/product';

/** Tableros de la URL (`?tableros=ee,gn`, TV-08): solo los que existen, sin repetir; por defecto todos. */
export function parseBoards(value: string | null): ProductKey[] {
  const keys = (value ?? '').split(',').map((k) => k.trim()).filter((k): k is ProductKey => (PRODUCT_KEYS as string[]).includes(k));
  const unique = [...new Set(keys)];
  return unique.length ? unique : PRODUCT_KEYS;
}

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

/** Antigüedad de los datos (TV-07): «hace 5 min», «hace 3 h», «hace 2 días». */
export function formatAge(ms: number): string {
  const min = Math.floor(ms / 60_000);
  if (min < 1) return 'hace menos de 1 min';
  if (min < 60) return `hace ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 48) return `hace ${h} h`;
  return `hace ${Math.floor(h / 24)} días`;
}
