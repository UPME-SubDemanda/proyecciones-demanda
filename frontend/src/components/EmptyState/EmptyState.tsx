import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

type Props = {
  title: string; // qué falta: «No hay revisiones publicadas de gas natural»
  description: string; // por qué y qué hacer (UX-06)
  action?: ReactNode;
  className?: string;
};

/** Estado vacío de una vista o tarjeta (UX-06). */
export function EmptyState({ title, description, action, className }: Props) {
  return (
    <div className={cn('flex flex-col items-start gap-2 p-6 bg-surface-sunken border border-line rounded-md', className)}>
      <p className="text-h3">{title}</p>
      <p className="text-body text-ink-muted">{description}</p>
      {action}
    </div>
  );
}
