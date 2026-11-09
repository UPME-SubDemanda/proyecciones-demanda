import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';
import type { ProductKey } from '../../lib/product';

export type BadgeTone = 'success' | 'info' | 'warning' | 'critical' | 'neutral' | ProductKey;

const TONES: Record<BadgeTone, string> = {
  success: 'bg-success-soft text-success',
  info: 'bg-info-soft text-info',
  warning: 'bg-warning-soft text-warning',
  critical: 'bg-critical-soft text-critical',
  neutral: 'bg-surface-sunken text-ink-muted border border-line',
  ee: 'bg-ee-fill text-on-brand',
  gn: 'bg-gn-fill text-on-brand',
};

/** Estado o producto en 1–2 palabras, siempre con texto (CMP, A11-05). */
export function Badge({ tone = 'neutral', children, className }: { tone?: BadgeTone; children: ReactNode; className?: string }) {
  return (
    <span className={cn('inline-flex items-center h-6 px-2 rounded-sm text-label whitespace-nowrap', TONES[tone], className)}>
      {children}
    </span>
  );
}

/** Texto obligatorio mientras se muestren datos de ejemplo (CON-07). */
export const ILLUSTRATIVE_LABEL = 'Cifras ilustrativas';

/** Marca de datos de ejemplo (CON-07). */
export function IllustrativeBadge({ className }: { className?: string }) {
  return <Badge tone="warning" className={className}>{ILLUSTRATIVE_LABEL}</Badge>;
}
