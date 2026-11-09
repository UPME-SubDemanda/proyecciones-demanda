import { useMemo } from 'react';
import { EChart } from '../charts/EChart';
import { sparklineOption } from '../charts/exogenousCharts';
import type { Point } from '../../data/types';

type Props = {
  observed: Point[];
  /** Referencia punteada: el supuesto, una meta o un umbral. */
  reference: Point[];
  /** Qué muestra, para lectores de pantalla (A11-04): «PIB total: observado baja de 3,0 % a 1,8 %». */
  ariaLabel: string;
  width?: number;
  height?: number;
};

/**
 * Tendencia en una celda de tabla (CMP: Sparkline): observado sólido frente a una referencia punteada, sin ejes
 * (GRA-01). La cifra exacta va en las columnas vecinas; aquí solo se ve la forma.
 */
export function Sparkline({ observed, reference, ariaLabel, width = 140, height = 36 }: Props) {
  const option = useMemo(() => sparklineOption(observed, reference), [observed, reference]);
  return (
    <div style={{ width }}>
      <EChart option={option} height={height} ariaLabel={ariaLabel} />
    </div>
  );
}
