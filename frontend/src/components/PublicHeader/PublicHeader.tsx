import { useId, useState } from 'react';
import logoUrl from '../../estandares/logos/upme-horizontal-amarillo.svg';
import { cn } from '../../lib/cn';
import { icons } from '../../lib/icons';

export type PublicNavItem = { label: string; href: string; active?: boolean };
/** Enlace discreto a la derecha del menú, p. ej. «Ingresar» a la app interna. */
export type PublicHeaderAction = { label: string; href: string; icon?: 'user' };

type Props = {
  /** Nombre del sitio junto al logo. */
  siteName: string;
  /** Ítems del menú superior. Solo vistas que existen: se agregan a medida que salen. */
  items: PublicNavItem[];
  action?: PublicHeaderAction;
  className?: string;
};

export const GOVCO_URL = 'https://www.gov.co';

/**
 * Barra GOV.CO de 48 px (UPME-LEG-01). El logo oficial se toma del CDN de GOV.CO;
 * mientras se confirma la dirección del archivo (X-11) se muestra el texto «GOV.CO» enlazado.
 * El portal siempre usa el tema claro, donde `on-primary` es blanco sobre `govco`.
 */
export function GovcoBar({ className }: { className?: string }) {
  return (
    <div className={cn('bg-govco text-on-primary', className)}>
      <div className="max-w-[1200px] mx-auto px-6 h-12 flex items-center">
        <a href={GOVCO_URL} className="font-bold text-h3 text-on-primary" aria-label="Portal del Estado colombiano GOV.CO">
          GOV.CO
        </a>
      </div>
    </div>
  );
}

/**
 * Encabezado del portal (CMP: PublicHeader): barra GOV.CO + logo + menú superior + franja `brand` de 4 px.
 * Ítem activo con subrayado de 3 px `brand` (LAY-04). En móvil, el menú se abre con un botón (A11-07).
 */
export function PublicHeader({ siteName, items, action, className }: Props) {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  return (
    <header className={cn('bg-surface-raised', className)}>
      <GovcoBar />
      <div className="border-b-4 border-brand">
        <div className="max-w-[1200px] mx-auto px-6 min-h-[84px] flex items-center justify-between gap-6">
          <a href="/" className="flex items-center gap-4 min-h-11" aria-label={`${siteName}, inicio`}>
            <img src={logoUrl} alt="UPME" className="h-10 w-auto" />
            <span className="hidden sm:block pl-4 border-l border-line text-h3 max-w-[200px]">{siteName}</span>
          </a>

          <button
            type="button"
            className="lg:hidden h-11 px-4 rounded-md border border-line-strong text-body font-bold"
            aria-expanded={open}
            aria-controls={menuId}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? 'Cerrar' : 'Menú'}
          </button>

          <div className="hidden lg:flex items-center gap-8">
            <nav aria-label="Menú principal">
              <NavList items={items} />
            </nav>
            {action && <ActionLink action={action} />}
          </div>
        </div>
        {open && (
          <nav id={menuId} aria-label="Menú principal" className="lg:hidden border-t border-line">
            <NavList items={items} vertical />
            {action && <div className="px-6 pb-4"><ActionLink action={action} /></div>}
          </nav>
        )}
      </div>
    </header>
  );
}

function ActionLink({ action }: { action: PublicHeaderAction }) {
  const Icon = action.icon ? icons[action.icon] : null;
  return (
    <a href={action.href} className="inline-flex items-center gap-2 min-h-11 pl-6 lg:border-l border-line text-body text-ink-muted hover:text-ink">
      {Icon && <Icon width={20} height={20} aria-hidden="true" />}
      {action.label}
    </a>
  );
}

function NavList({ items, vertical = false }: { items: PublicNavItem[]; vertical?: boolean }) {
  return (
    <ul className={cn('flex', vertical ? 'flex-col px-6 py-2' : 'items-center gap-6')}>
      {items.map((item) => (
        <li key={item.href}>
          <a
            href={item.href}
            aria-current={item.active ? 'page' : undefined}
            className={cn(
              'flex items-center min-h-11 text-body border-b-[3px]',
              item.active ? 'border-brand font-bold text-ink' : 'border-transparent text-ink-muted hover:text-ink',
            )}
          >
            {item.label}
          </a>
        </li>
      ))}
    </ul>
  );
}
