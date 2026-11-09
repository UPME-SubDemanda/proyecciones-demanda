import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

type Props = {
  children: ReactNode;
  active: boolean;
  onToggle: () => void;
  /** `touch`: 44 px para portal y modo pantalla (A11-07). */
  size?: 'md' | 'touch';
  className?: string;
};

/** Filtro combinable (CMP: Chip): activo con fondo `brand-soft` y borde `brand`; `aria-pressed` (A11-03). */
export function Chip({ children, active, onToggle, size = 'md', className }: Props) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onToggle}
      className={cn(
        'inline-flex items-center px-4 rounded-pill border text-body whitespace-nowrap',
        size === 'touch' ? 'h-11' : 'h-8',
        active ? 'bg-brand-soft border-brand text-ink font-bold' : 'bg-transparent border-line-strong text-ink-muted',
        className,
      )}
    >
      {children}
    </button>
  );
}
