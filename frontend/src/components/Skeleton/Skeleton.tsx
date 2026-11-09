import { cn } from '../../lib/cn';

type Props = {
  /** Alto del bloque en px (una tarjeta de KPI ~ 160, un gráfico ~ 360). */
  height?: number;
  /** Qué se está cargando, para lectores de pantalla. */
  label?: string;
  className?: string;
};

/** Esqueleto de carga (UX-06): nunca un spinner a pantalla completa. */
export function Skeleton({ height = 160, label = 'Cargando', className }: Props) {
  return (
    <div
      role="status"
      aria-busy="true"
      className={cn('bg-surface-sunken border border-line rounded-md animate-pulse', className)}
      style={{ height }}
    >
      <span className="sr-only">{label}…</span>
    </div>
  );
}
