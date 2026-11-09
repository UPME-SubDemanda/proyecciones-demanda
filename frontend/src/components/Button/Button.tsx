import type { ComponentType, ReactNode, SVGProps } from 'react';
import { cn } from '../../lib/cn';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

type Props = {
  children: ReactNode; // verbo + objeto: «Descargar datos» (CON-02)
  variant?: ButtonVariant; // `primary`: máximo uno por vista
  size?: 'md' | 'sm'; // 40 px; `sm` 32 px en tablas y barras de gráfico
  icon?: ComponentType<SVGProps<SVGSVGElement>>;
  href?: string; // si se da, es un enlace con aspecto de botón
  onClick?: () => void;
  type?: 'button' | 'submit';
  /** Si se da, el botón queda deshabilitado y explica por qué (CMP: «Deshabilitado con explicación»). */
  disabledReason?: string;
  className?: string;
};

const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-on-primary border border-primary',
  secondary: 'bg-surface-raised text-ink border border-line-strong hover:bg-surface-sunken',
  ghost: 'bg-transparent text-primary border border-transparent hover:bg-primary-soft',
  danger: 'bg-critical text-on-primary border border-critical',
};

/** Botón del inventario (CMP). Elemento nativo `<button>` o `<a>` (CMP-03). */
export function Button({
  children, variant = 'secondary', size = 'md', icon: Icon, href, onClick, type = 'button', disabledReason, className,
}: Props) {
  const classes = cn(
    'inline-flex items-center justify-center gap-2 rounded-md font-bold whitespace-nowrap',
    size === 'md' ? 'h-10 px-4 text-body' : 'h-8 px-3 text-small',
    VARIANTS[variant],
    disabledReason && 'opacity-50 cursor-not-allowed',
    className,
  );
  const content = (
    <>
      {Icon && <Icon width={20} height={20} aria-hidden="true" />}
      {children}
    </>
  );
  if (href && !disabledReason) {
    return <a href={href} className={classes}>{content}</a>;
  }
  return (
    <button type={type} className={classes} onClick={onClick} disabled={!!disabledReason} title={disabledReason}>
      {content}
    </button>
  );
}
