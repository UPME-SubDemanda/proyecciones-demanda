/** Piezas comunes de los tableros del modo pantalla (TV-05). */
import type { ComponentType, ReactNode, SVGProps } from 'react';
import { cn } from '../../lib/cn';

/** Encabezado de un tablero: ícono de contexto en círculo, título y subtítulo. */
export function KioskHeader({
  icon: Icon, tone, title, subtitle,
}: { icon: ComponentType<SVGProps<SVGSVGElement>>; tone: 'ee' | 'gn'; title: string; subtitle: string }) {
  return (
    <div className="flex items-center gap-6">
      <span
        className={cn('w-[60px] h-[60px] inline-flex items-center justify-center rounded-pill text-on-brand shrink-0', tone === 'ee' ? 'bg-ee-fill' : 'bg-gn-fill')}
        aria-hidden="true"
      >
        <Icon width={36} height={36} />
      </span>
      <div>
        <h1 className="text-h1">{title}</h1>
        <p className="text-body text-ink-muted">{subtitle}</p>
      </div>
    </div>
  );
}

/** Tarjeta de un gráfico o bloque del tablero, con título (hallazgo) y subtítulo (GRA-02). */
export function Panel({
  title, subtitle, children, aside, className,
}: { title: string; subtitle: string; children: ReactNode; aside?: ReactNode; className?: string }) {
  return (
    <section className={cn('flex flex-col gap-2 p-6 bg-surface-raised border border-line rounded-md min-h-0', className)}>
      <div className="flex items-start justify-between gap-6">
        <div>
          <h2 className="text-h2">{title}</h2>
          <p className="text-small text-ink-muted">{subtitle}</p>
        </div>
        {aside}
      </div>
      <div className="flex-1 min-h-0">{children}</div>
    </section>
  );
}

/** Barras horizontales en HTML: etiqueta · barra · valor (comparar escenarios o revisiones). */
export function HorizontalBars({
  rows, max,
}: { rows: { key: string; label: string; ratio: number; value: string; colorClass?: string; color?: string }[]; max?: number }) {
  const top = max ?? Math.max(...rows.map((r) => r.ratio));
  return (
    <ul className="flex flex-col gap-3 pt-2">
      {rows.map((r) => (
        <li key={r.key} className="grid grid-cols-[200px_1fr_120px] items-center gap-4">
          <span className="text-body">{r.label}</span>
          <span className="h-5 rounded-sm bg-surface-sunken overflow-hidden" aria-hidden="true">
            <span className={cn('block h-full rounded-sm', r.colorClass)} style={{ width: `${(r.ratio / top) * 100}%`, background: r.color }} />
          </span>
          <span className="text-h3 text-right tabular">{r.value}</span>
        </li>
      ))}
    </ul>
  );
}

/** Fila de filtros vacía: mantiene la misma estructura en los tableros sin filtros (TV-05). */
export function NoFilters() {
  return <div className="h-11" aria-hidden="true" />;
}
