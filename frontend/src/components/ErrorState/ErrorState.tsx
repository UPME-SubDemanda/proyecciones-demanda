import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { icons } from '../../lib/icons';

type Props = {
  title: string; // qué pasó, en lenguaje claro
  description: string; // cómo seguir (UX-06)
  /** Detalle técnico, plegado por defecto. */
  detail?: string;
  action?: ReactNode; // p. ej. «Reintentar»
  className?: string;
};

/** Estado de error de una vista o tarjeta (UX-06): ícono + texto, nunca solo color (A11-05). */
export function ErrorState({ title, description, detail, action, className }: Props) {
  const Icon = icons.warning;
  return (
    <div role="alert" className={cn('flex flex-col items-start gap-2 p-6 bg-critical-soft border border-critical rounded-md', className)}>
      <p className="flex items-center gap-2 text-h3 text-critical">
        <Icon width={24} height={24} aria-hidden="true" />
        {title}
      </p>
      <p className="text-body">{description}</p>
      {detail && (
        <details className="text-small text-ink-muted">
          <summary className="cursor-pointer">Detalle técnico</summary>
          <pre className="mt-2 text-mono whitespace-pre-wrap">{detail}</pre>
        </details>
      )}
      {action}
    </div>
  );
}
