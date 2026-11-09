/** Cálculos de la página de inicio del portal, separados de la vista para probarlos. */
import type { Point, RevisionValues } from '../../data/types';
import { formatPercent } from '../../lib/format';
import { PRODUCTS, type ProductKey } from '../../lib/product';

export function valueAt(points: Point[], period: string): number | undefined {
  return points.find((p) => p.period === period)?.value;
}

/** Variación porcentual de `to` frente a `from`. */
export function change(from: number, to: number): number {
  return ((to - from) / from) * 100;
}

/** Último dato real. */
export function lastObserved(points: Point[]): Point {
  const last = points.at(-1);
  if (!last) throw new Error('Serie sin datos');
  return last;
}

/** Crecimiento acumulado bajo y alto del último dato real al final del horizonte. */
export function growthRange(observed: Point[], values: RevisionValues) {
  const base = lastObserved(observed).value;
  const horizon = values.scenarios.mid.at(-1)!.period;
  return {
    horizon,
    low: change(base, valueAt(values.scenarios.low, horizon)!),
    high: change(base, valueAt(values.scenarios.high, horizon)!),
  };
}

/** Título con el hallazgo y su cifra (GRA-02): «La demanda de energía eléctrica crecería entre 28 % y 62 % a 2040». */
export function growthTitle(product: ProductKey, observed: Point[], values: RevisionValues): string {
  const { horizon, low, high } = growthRange(observed, values);
  const name = PRODUCTS[product].name.toLowerCase();
  const pct = (v: number) => formatPercent(v, { decimals: 0 });
  return `La demanda de ${name} crecería entre ${pct(low)} y ${pct(high)} a ${horizon}`;
}
