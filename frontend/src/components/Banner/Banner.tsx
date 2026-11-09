import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { icons } from '../../lib/icons';

type Props = {
  /** Qué pasa, con la cifra: «La proyección vigente de energía eléctrica está fuera de umbral desde julio». */
  title: string;
  /** Detalle y causa en una o dos frases. */
  children?: ReactNode;
  /** Acción hacia la causa, p. ej. un botón «Ver alertas». */
  action?: ReactNode;
  className?: string;
};

/**
 * Aviso de alerta alta (CMP: Banner, UX-05): máximo uno por vista, solo si la alerta afecta lo que se ve.
 * Ícono + texto, nunca solo color (A11-05).
 */
export function Banner({ title, children, action, className }: Props) {
  const Icon = icons.warning;
  return (
    <section role="alert" className={cn('flex items-start gap-4 p-4 bg-critical-soft border border-critical rounded-md', className)}>
      <Icon width={24} height={24} aria-hidden="true" className="shrink-0 text-critical" />
      <div className="flex-1 flex flex-col gap-1">
        <p className="text-h3">{title}</p>
        {children && <p className="text-body">{children}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </section>
  );
}
