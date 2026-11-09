/**
 * Menú lateral de la app interna (LAY-06): grupos y orden fijos de `docs/tecnica/diseno-app.md`.
 * Agregar o quitar un grupo obliga a actualizar ese documento en el mismo PR.
 *
 * Solo se muestran las vistas que ya existen (`built: true`); las demás se activan a medida que se
 * construyen (T-08, #17). Lo que un rol no puede usar no se muestra (UX-08).
 */
import { hasRole, type User } from '../../auth/AuthContext';
import type { IconName } from '../../lib/icons';

export type NavItem = {
  label: string;
  path: string;
  icon: IconName;
  /** Rol mínimo para verla; por defecto, `viewer`. */
  role?: string;
  /** La vista existe; si no, no se muestra. */
  built: boolean;
  /** Paso del plan de trabajo que la construye. */
  step: string;
};

export type NavGroup = { label?: string; items: NavItem[] };

export const NAVIGATION: NavGroup[] = [
  { items: [{ label: 'Inicio', path: '/app', icon: 'home', built: true, step: 'T-08 / T-09' }] },
  {
    label: 'Proyecciones',
    items: [
      { label: 'Proyección vs. real', path: '/app/proyecciones/vs-real', icon: 'realVsEstimated', built: false, step: 'T-12' },
      { label: 'Histórico de revisiones', path: '/app/proyecciones/historico', icon: 'history', built: true, step: 'T-10' },
      { label: 'Comparar revisiones', path: '/app/proyecciones/comparar', icon: 'history', built: false, step: 'T-13' },
    ],
  },
  {
    label: 'Variables',
    items: [{ label: 'Monitor de exógenas', path: '/app/exogenas', icon: 'exogenous', built: false, step: 'T-11' }],
  },
  {
    label: 'Modelos',
    items: [{ label: 'Registro de modelos', path: '/app/modelos', icon: 'models', role: 'modeler', built: false, step: 'fase 2' }],
  },
  {
    label: 'Operación',
    items: [
      { label: 'Ejecutar proyección', path: '/app/ejecutar', icon: 'run', role: 'modeler', built: false, step: 'fase 2' },
      { label: 'Alertas', path: '/app/alertas', icon: 'alerts', built: false, step: 'X-10' },
    ],
  },
  { items: [{ label: 'Datos y documentación', path: '/app/datos', icon: 'documentation', built: false, step: 'X-10' }] },
  {
    label: 'Administración',
    items: [{ label: 'Usuarios y roles', path: '/app/usuarios', icon: 'user', role: 'admin', built: false, step: 'T-14' }],
  },
];

/** Grupos visibles para un usuario: solo vistas construidas y permitidas; sin grupos vacíos. */
export function visibleNavigation(user: User | null, groups: NavGroup[] = NAVIGATION): NavGroup[] {
  return groups
    .map((g) => ({ ...g, items: g.items.filter((i) => i.built && hasRole(user, i.role ?? 'viewer')) }))
    .filter((g) => g.items.length > 0);
}

/** Ítem activo para una ruta: el de la ruta más larga que la contiene. */
export function activeItem(pathname: string, groups: NavGroup[]): NavItem | undefined {
  return groups
    .flatMap((g) => g.items)
    .filter((i) => pathname === i.path || pathname.startsWith(`${i.path}/`))
    .sort((a, b) => b.path.length - a.path.length)[0];
}

/** Ubicación para el encabezado: «Proyecciones / Histórico de revisiones», o solo la vista si no tiene grupo. */
export function activeLocation(pathname: string, groups: NavGroup[]): string {
  for (const g of groups) {
    const item = activeItem(pathname, [g]);
    if (item && activeItem(pathname, groups) === item) return g.label ? `${g.label} / ${item.label}` : item.label;
  }
  return 'Inicio';
}
