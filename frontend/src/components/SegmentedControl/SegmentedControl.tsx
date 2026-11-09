import type { ComponentType, SVGProps } from 'react';
import { cn } from '../../lib/cn';

export type SegmentOption<T extends string> = {
  value: T;
  label: string;
  icon?: ComponentType<SVGProps<SVGSVGElement>>;
};

type Props<T extends string> = {
  options: SegmentOption<T>[]; // 2 a 5 opciones excluyentes
  value: T;
  onChange: (value: T) => void;
  ariaLabel: string; // qué se elige: «Producto», «Rango»
  /** `touch`: 44 px de alto para portal y modo pantalla (A11-07). */
  size?: 'md' | 'touch';
  className?: string;
};

/** Opciones excluyentes con `aria-pressed` (CMP: SegmentedControl, A11-03). */
export function SegmentedControl<T extends string>({ options, value, onChange, ariaLabel, size = 'md', className }: Props<T>) {
  return (
    <div role="group" aria-label={ariaLabel} className={cn('inline-flex p-1 gap-1 rounded-pill bg-surface-sunken', className)}>
      {options.map(({ value: v, label, icon: Icon }) => {
        const active = v === value;
        return (
          <button
            key={v}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(v)}
            className={cn(
              'inline-flex items-center gap-2 px-4 rounded-pill text-body whitespace-nowrap border',
              size === 'touch' ? 'h-11' : 'h-8',
              active ? 'bg-surface-raised border-line text-ink font-bold' : 'border-transparent text-ink-muted hover:text-ink',
            )}
          >
            {Icon && <Icon width={20} height={20} aria-hidden="true" />}
            {label}
          </button>
        );
      })}
    </div>
  );
}
