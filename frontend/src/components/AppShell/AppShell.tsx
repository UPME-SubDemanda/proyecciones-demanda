import { useEffect, useState, type ReactNode } from 'react';
import { SideNav, type SideNavGroup } from '../SideNav/SideNav';
import { cn } from '../../lib/cn';

type Props = {
  appName: string;
  groups: SideNavGroup[];
  activePath?: string;
  /** Parámetros que el menú conserva al navegar (`?producto=gn`, LAY-07). */
  search?: string;
  /** Texto de ubicación a la izquierda del encabezado: «Inicio». */
  location: string;
  /** Controles a la derecha del encabezado: selector de producto, menú del usuario. */
  controls?: ReactNode;
  children: ReactNode;
};

/**
 * Esqueleto de la app interna (LAY-01): menú lateral de 240 px en `surface-sunken` y encabezado con
 * franja `brand` de 4 px (LAY-03, LAY-04). Bajo 1024 px el menú se pliega y se abre con «Menú» (LAY-08).
 */
export function AppShell({ appName, groups, activePath, search, location, controls, children }: Props) {
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    if (!navOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setNavOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [navOpen]);

  const nav = (onNavigate?: () => void) => (
    <SideNav appName={appName} groups={groups} activePath={activePath} search={search} onNavigate={onNavigate} />
  );

  return (
    <div className="min-h-screen bg-surface lg:grid lg:grid-cols-[240px_1fr]">
      <a href="#contenido" className="sr-only focus:not-sr-only focus:p-4">Saltar al contenido</a>

      <div className="hidden lg:block bg-surface-sunken border-r border-line">
        <div className="sticky top-0 h-screen">{nav()}</div>
      </div>

      {navOpen && (
        <div className="lg:hidden fixed inset-0 z-40" role="dialog" aria-modal="true" aria-label="Menú de la aplicación">
          <button type="button" aria-label="Cerrar menú" className="absolute inset-0 w-full h-full bg-ink opacity-40" onClick={() => setNavOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 shadow-overlay">{nav(() => setNavOpen(false))}</div>
        </div>
      )}

      <div className="min-w-0 flex flex-col">
        <header className="sticky top-0 z-20 bg-surface-raised border-b-4 border-brand">
          <div className="h-[72px] px-6 flex items-center gap-4">
            <button
              type="button"
              className={cn('lg:hidden h-11 px-4 rounded-md border border-line-strong text-body font-bold')}
              aria-expanded={navOpen}
              onClick={() => setNavOpen(true)}
            >
              Menú
            </button>
            <p className="flex-1 min-w-0 truncate text-body text-ink-muted">{location}</p>
            <div className="flex items-center gap-4">{controls}</div>
          </div>
        </header>
        <main id="contenido" className="flex-1 w-full max-w-[1280px] mx-auto px-6 py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
