import { Link } from 'react-router-dom';
import logoUrl from '../../estandares/logos/upme-horizontal-amarillo.svg';
import { cn } from '../../lib/cn';
import { icons, type IconName } from '../../lib/icons';

export type SideNavItem = { label: string; path: string; icon: IconName; count?: number };
export type SideNavGroup = { label?: string; items: SideNavItem[] };

type Props = {
  appName: string;
  groups: SideNavGroup[];
  activePath?: string;
  /** Parámetros que se conservan al navegar, p. ej. `?producto=gn` (LAY-07). */
  search?: string;
  onNavigate?: () => void;
  className?: string;
};

/**
 * Menú de la app interna (CMP: SideNav): ícono de 20 px + texto; ítem activo con barra de 3 px `brand`
 * a la izquierda (LAY-04) y `aria-current` (A11-03); contadores en `critical` (UX-05).
 */
export function SideNav({ appName, groups, activePath, search = '', onNavigate, className }: Props) {
  return (
    <nav aria-label="Menú de la aplicación" className={cn('w-60 h-full flex flex-col gap-6 px-4 py-6 bg-surface-sunken border-r border-line', className)}>
      <Link to={`/app${search}`} onClick={onNavigate} className="flex flex-col gap-2 px-2" aria-label={`${appName}, inicio`}>
        <img src={logoUrl} alt="UPME" className="h-10 w-auto self-start" />
        <span className="text-small text-ink-muted">{appName}</span>
      </Link>
      <div className="flex flex-col gap-6 overflow-y-auto">
        {groups.map((group, gi) => (
          <div key={group.label ?? gi} className="flex flex-col gap-1">
            {group.label && <p className="px-2 pb-1 text-label text-ink-muted uppercase tracking-wide">{group.label}</p>}
            <ul className="flex flex-col gap-1">
              {group.items.map((item) => {
                const active = item.path === activePath;
                const Icon = icons[item.icon];
                return (
                  <li key={item.path}>
                    <Link
                      to={`${item.path}${search}`}
                      onClick={onNavigate}
                      aria-current={active ? 'page' : undefined}
                      className={cn(
                        'relative flex items-center gap-3 h-11 px-3 rounded-md text-body',
                        active ? 'bg-surface-raised border border-line font-bold text-ink' : 'text-ink-muted hover:text-ink hover:bg-surface-raised',
                      )}
                    >
                      {active && <span className="absolute left-0 top-2 bottom-2 w-[3px] rounded-pill bg-brand" aria-hidden="true" />}
                      <Icon width={20} height={20} aria-hidden="true" />
                      <span className="flex-1">{item.label}</span>
                      {!!item.count && (
                        <span className="min-w-6 h-6 px-2 inline-flex items-center justify-center rounded-pill bg-critical text-on-primary text-label">
                          {item.count}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </nav>
  );
}
