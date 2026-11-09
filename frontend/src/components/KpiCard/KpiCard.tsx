import type { ReactNode } from 'react';
import { ILLUSTRATIVE_LABEL } from '../Badge/Badge';
import { cn } from '../../lib/cn';
import { formatNumber } from '../../lib/format';

/** `good`/`bad` solo cuando subir o bajar es bueno o malo (CMP: KpiCard). */
export type KpiTone = 'neutral' | 'good' | 'bad';

type Props = {
  label: string;
  value: number;
  unit: string;
  /** Cifra ya escrita como texto, cuando no es un número: «ene-2026». Reemplaza a `value`. */
  valueText?: string;
  /** Color de la cifra, solo si es buena o mala (como `changeTone`). */
  valueTone?: KpiTone;
  decimals?: number;
  signed?: boolean; // muestra «+» en valores positivos (errores, variaciones)
  /** Variación o estado bajo la cifra: «+2,9 % frente a 2025», «Fuera de umbral ±1,5 %». */
  change?: string;
  changeTone?: KpiTone;
  /** Procedencia (PRI-02, CON-06), ya formateada con `formatProvenance`. */
  provenance?: string;
  illustrative?: boolean;
  /** Elemento arriba de la etiqueta, p. ej. un ProductIcon en el portal. */
  leading?: ReactNode;
  className?: string;
};

const CHANGE_TONE: Record<KpiTone, string> = {
  neutral: 'text-ink-muted',
  good: 'text-success',
  bad: 'text-critical',
};

/** Cifra clave: etiqueta · valor + unidad · variación · procedencia (CMP: KpiCard). */
export function KpiCard({
  label, value, unit, valueText, valueTone = 'neutral', decimals = 0, signed = false, change, changeTone = 'neutral', provenance,
  illustrative, leading, className,
}: Props) {
  return (
    <article className={cn('flex flex-col gap-2 p-6 bg-surface-raised border border-line rounded-md', className)}>
      {leading}
      <h3 className="text-small text-ink-muted">{label}</h3>
      <p className="flex items-baseline gap-1">
        <span className={cn('text-kpi tabular', valueTone !== 'neutral' && CHANGE_TONE[valueTone])}>
          {valueText ?? formatNumber(value, { decimals, signed })}
        </span>
        <span className="text-body text-ink-muted">{unit}</span>
      </p>
      {change && <p className={cn('text-small font-bold', CHANGE_TONE[changeTone])}>{change}</p>}
      {(provenance || illustrative) && (
        <p className="mt-auto pt-3 border-t border-line text-small text-ink-muted">
          {provenance}
          {provenance && illustrative && ' · '}
          {illustrative && <strong className="text-ink">{ILLUSTRATIVE_LABEL}</strong>}
        </p>
      )}
    </article>
  );
}
