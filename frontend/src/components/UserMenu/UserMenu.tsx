import { useEffect, useId, useRef, useState } from 'react';
import { Badge } from '../Badge/Badge';
import { cn } from '../../lib/cn';
import { icons } from '../../lib/icons';

type Props = {
  name: string;
  email: string;
  roles: string[];
  /** Salida de la app hacia el sitio público. */
  portalHref?: string;
  onLogout: () => void;
  className?: string;
};

/**
 * Menú del usuario del encabezado de la app: quién soy, mis roles, ir al portal y cerrar sesión.
 * Botón con `aria-expanded`; se cierra con Esc o al tocar fuera.
 */
export function UserMenu({ name, email, roles, portalHref = '/', onLogout, className }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const panelId = useId();
  const Icon = icons.user;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    const onClick = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    return () => { document.removeEventListener('keydown', onKey); document.removeEventListener('mousedown', onClick); };
  }, [open]);

  return (
    <div ref={ref} className={cn('relative', className)}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className="h-11 px-3 inline-flex items-center gap-2 rounded-md text-body text-ink hover:bg-surface-sunken"
      >
        <Icon width={20} height={20} aria-hidden="true" />
        <span className="max-w-[220px] truncate">{name || email}</span>
      </button>
      {open && (
        <div id={panelId} className="absolute right-0 top-12 z-30 w-72 p-4 flex flex-col gap-3 bg-surface-raised border border-line rounded-md shadow-overlay">
          <div>
            <p className="text-h3">{name || email}</p>
            <p className="text-small text-ink-muted break-all">{email}</p>
          </div>
          <div className="flex flex-wrap gap-1" aria-label="Roles">
            {roles.length ? roles.map((r) => <Badge key={r} tone="info">{r}</Badge>) : <Badge>Sin roles</Badge>}
          </div>
          <div className="flex flex-col border-t border-line pt-2">
            <a href={portalHref} className="h-10 inline-flex items-center text-body text-primary hover:underline">Ir al portal público</a>
            <button type="button" onClick={onLogout} className="h-10 inline-flex items-center text-body text-primary hover:underline">
              Cerrar sesión
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
