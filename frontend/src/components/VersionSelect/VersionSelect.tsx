import { useId } from 'react';
import { cn } from '../../lib/cn';

export type VersionOption = { value: string; label: string; current?: boolean };

type Props = {
  label: string; // «Proyección», «Revisión»
  options: VersionOption[];
  value: string;
  onChange: (value: string) => void;
  size?: 'md' | 'touch';
  className?: string;
};

/**
 * Elegir una versión publicada (CMP: VersionSelect). `<select>` nativo con `<label>` (CMP-03, A11-03);
 * la vigente lleva «(vigente)». Por defecto, la vista debe elegir la vigente.
 */
export function VersionSelect({ label, options, value, onChange, size = 'md', className }: Props) {
  const id = useId();
  return (
    <div className={cn('inline-flex items-center gap-3', className)}>
      <label htmlFor={id} className="text-body text-ink-muted">{label}</label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          'px-3 rounded-md border border-line-strong bg-surface-raised text-ink text-body',
          size === 'touch' ? 'h-11' : 'h-10',
        )}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}{o.current ? ' (vigente)' : ''}
          </option>
        ))}
      </select>
    </div>
  );
}
