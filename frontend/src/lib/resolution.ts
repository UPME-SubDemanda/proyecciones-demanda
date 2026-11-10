/**
 * Resolución de las gráficas de proyección: anual (por omisión, como los mockups aprobados) o mensual (issue #40).
 * Solo energía eléctrica tiene datos mensuales reales; gas natural sigue anual con cifras ilustrativas.
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

/** `?resolucion=mensual` en la URL; cualquier otro valor es anual. */
export function parseResolution(value: string | null): Resolution {
  return value === 'mensual' ? 'M' : 'A';
}

/** Resolución guardada en la URL (vistas de la app y del portal), para compartir el enlace tal como se ve. */
export function useResolution(): [Resolution, (r: Resolution) => void] {
  const [params, setParams] = useSearchParams();
  const set = (r: Resolution) =>
    setParams((prev) => {
      const next = new URLSearchParams(prev);
      if (r === 'M') next.set('resolucion', 'mensual'); else next.delete('resolucion');
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

/** Unidad de las gráficas de energía eléctrica: TWh por año, o GWh por mes. */
export function eeChartUnit(resolution: Resolution) {
  return resolution === 'M'
    ? { unit: 'GWh/mes', short: 'GWh', divisor: 1, decimals: 0 }
    : { unit: 'TWh/año', short: 'TWh', divisor: 1000, decimals: 1 };
}
