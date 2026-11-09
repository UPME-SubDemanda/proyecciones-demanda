import type { ReactNode } from 'react';
import { Badge } from '../Badge/Badge';
import { cn } from '../../lib/cn';
import type { ProductKey } from '../../lib/product';
import { PRODUCTS } from '../../lib/product';

export type AlertItemSeverity = 'high' | 'medium' | 'low';

const SEVERITY: Record<AlertItemSeverity, { bar: string; label: string }> = {
  high: { bar: 'bg-critical', label: 'Severidad alta' },
  medium: { bar: 'bg-warning', label: 'Severidad media' },
  low: { bar: 'bg-info', label: 'Severidad baja' },
};

type Props = {
  severity: AlertItemSeverity;
  /** Título con la cifra: «PIB observado 1,8 % vs. supuesto 3,0 %». */
  title: string;
  product: ProductKey;
  /** Contexto: tipo · fecha (y responsable y estado cuando existan, PRI-04). */
  meta: string;
  /** Acción hacia la causa (PRI-04). */
  action?: ReactNode;
  className?: string;
};

/**
 * Fila de alerta (CMP: AlertItem): barra de severidad, título con cifra, producto, contexto y acción.
 * La severidad también se dice en texto para lectores de pantalla (A11-05).
 */
export function AlertItem({ severity, title, product, meta, action, className }: Props) {
  const s = SEVERITY[severity];
  return (
    <article className={cn('relative flex items-center gap-4 py-4 pl-6 pr-4 bg-surface-raised border border-line rounded-md overflow-hidden', className)}>
      <span className={cn('absolute left-0 top-0 bottom-0 w-1', s.bar)} aria-hidden="true" />
      <div className="flex-1 flex flex-col gap-1">
        <h3 className="text-h3">
          <span className="sr-only">{s.label}: </span>
          {title}
        </h3>
        <p className="flex items-center gap-2 text-small text-ink-muted">
          <Badge tone={product}>{PRODUCTS[product].short}</Badge>
          {meta}
        </p>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </article>
  );
}
