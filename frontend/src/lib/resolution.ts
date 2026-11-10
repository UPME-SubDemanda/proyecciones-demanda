/**
 * Resolución de las gráficas de proyección: mensual (por omisión, decidido por el líder el 2026-11-10) o anual
 * (issue #40). Solo energía eléctrica tiene datos mensuales reales; gas natural sigue anual con cifras ilustrativas.
 *
 * En mensual, cada gráfica abre alrededor de la revisión: desde un año antes de su publicación hasta un año después
 * del último dato real (`publicationWindow`), con una línea vertical en el mes de publicación.
 */
import { useSearchParams } from 'react-router-dom';
import type { SegmentOption } from '../components/SegmentedControl/SegmentedControl';
import { formatMonth } from './format';
import type { ProductKey } from './product';

export type Resolution = 'A' | 'M';

export const RESOLUTION_OPTIONS: SegmentOption<Resolution>[] = [
  { value: 'A', label: 'Anual' },
  { value: 'M', label: 'Mensual' },
];

export const DEFAULT_RESOLUTION: Resolution = 'M';

/** `?resolucion=anual` en la URL; cualquier otro valor (o ninguno) es mensual. */
export function parseResolution(value: string | null): Resolution {
  return value === 'anual' ? 'A' : DEFAULT_RESOLUTION;
}

/** Resolución guardada en la URL (vistas de la app y del portal), para compartir el enlace tal como se ve. */
export function useResolution(): [Resolution, (r: Resolution) => void] {
  const [params, setParams] = useSearchParams();
  const set = (r: Resolution) =>
    setParams((prev) => {
      const next = new URLSearchParams(prev);
      if (r === 'A') next.set('resolucion', 'anual'); else next.delete('resolucion');
      return next;
    }, { replace: true, preventScrollReset: true });
  return [parseResolution(params.get('resolucion')), set];
}

/** Solo energía eléctrica tiene datos mensuales: gas natural siempre se ve anual. */
export function effectiveResolution(product: ProductKey, resolution: Resolution): Resolution {
  return product === 'ee' ? resolution : 'A';
}

/** Año de un periodo anual (`2026`) o mensual (`2026-04`). */
export function periodYear(period: string): number {
  return Number(period.slice(0, 4));
}

/** Rótulo de un periodo: `2026` queda igual; `2026-04` → «abr-2026». */
export function periodLabel(period: string): string {
  return period.length === 7 ? formatMonth(period) : period;
}

/** Si el periodo cae en el rango de años, ambos incluidos. */
export function inYearRange(period: string, range?: [number, number]): boolean {
  return !range || (periodYear(period) >= range[0] && periodYear(period) <= range[1]);
}

/**
 * Años que se ven por omisión en mensual: desde un año antes de la publicación de la revisión hasta un año después
 * del último dato real. Revisión jul-2026 con datos a oct-2026 → 2025–2027.
 */
export function publicationWindow(publishedOn: string, lastRealPeriod: string): [number, number] {
  return [periodYear(publishedOn) - 1, periodYear(lastRealPeriod) + 1];
}

/** Periodo de la publicación en la resolución de la gráfica: `2026-07` en mensual, `2026` en anual. */
export function publicationPeriod(publishedOn: string, resolution: Resolution): string {
  return resolution === 'M' ? publishedOn.slice(0, 7) : publishedOn.slice(0, 4);
}

/** Rótulo de la línea de publicación: «Publicado» (el mes ya se lee en el eje y en el nombre de la revisión). */
export function publicationLabel(_publishedOn?: string): string {
  return 'Publicado';
}

/** Unidad de las gráficas de energía eléctrica: TWh por año, o GWh por mes. */
export function eeChartUnit(resolution: Resolution) {
  return resolution === 'M'
    ? { unit: 'GWh/mes', short: 'GWh', divisor: 1, decimals: 0 }
    : { unit: 'TWh/año', short: 'TWh', divisor: 1000, decimals: 1 };
}
