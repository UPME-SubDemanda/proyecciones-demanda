import { useId } from 'react';
import { cn } from '../../lib/cn';

type Props = {
  label: string; // «Rango»
  min: number;
  max: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  step?: number;
  className?: string;
};

/** Mantiene «desde» ≤ «hasta» al mover cualquiera de las dos manijas. */
export function clampRange([from, to]: [number, number], moved: 'from' | 'to'): [number, number] {
  if (from <= to) return [from, to];
  return moved === 'from' ? [to, to] : [from, from];
}

/**
 * Rango de años con dos manijas y sus valores visibles (CMP: RangeSlider).
 * Dos `<input type="range">` nativos con su etiqueta (CMP-03, A11-03).
 */
export function RangeSlider({ label, min, max, value, onChange, step = 1, className }: Props) {
  const id = useId();
  const [from, to] = value;
  const handle = (which: 'from' | 'to', v: number) =>
    onChange(clampRange(which === 'from' ? [v, to] : [from, v], which));
  return (
    <fieldset className={cn('inline-flex items-center gap-4', className)}>
      <legend className="sr-only">{label}</legend>
      <span className="text-body text-ink-muted" aria-hidden="true">{label}</span>
      <label htmlFor={`${id}-from`} className="inline-flex items-center gap-2 text-body text-ink-muted">
        Desde <strong className="text-ink tabular">{from}</strong>
      </label>
      <input
        id={`${id}-from`}
        type="range"
        min={min}
        max={max}
        step={step}
        value={from}
        onChange={(e) => handle('from', Number(e.target.value))}
        className="w-48 h-11 accent-brand"
      />
      <label htmlFor={`${id}-to`} className="inline-flex items-center gap-2 text-body text-ink-muted">
        Hasta <strong className="text-ink tabular">{to}</strong>
      </label>
      <input
        id={`${id}-to`}
        type="range"
        min={min}
        max={max}
        step={step}
        value={to}
        onChange={(e) => handle('to', Number(e.target.value))}
        className="w-48 h-11 accent-brand"
      />
    </fieldset>
  );
}
