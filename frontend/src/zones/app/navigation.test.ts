import { describe, expect, it } from 'vitest';
import { activeItem, NAVIGATION, visibleNavigation, type NavGroup } from './navigation';

const user = (roles: string[]) => ({ id: 1, email: 'a@upme.gov.co', name: 'A', roles });

const groups: NavGroup[] = [
  { items: [{ label: 'Inicio', path: '/app', icon: 'home', built: true, step: '' }] },
  {
    label: 'Proyecciones',
    items: [
      { label: 'Histórico', path: '/app/proyecciones/historico', icon: 'history', built: true, step: '' },
      { label: 'Comparar', path: '/app/proyecciones/comparar', icon: 'history', built: false, step: '' },
    ],
  },
  { label: 'Administración', items: [{ label: 'Usuarios', path: '/app/usuarios', icon: 'user', role: 'admin', built: true, step: '' }] },
];

describe('menú lateral (LAY-06, UX-08)', () => {
  it('hoy solo muestra Inicio', () => {
    const visible = visibleNavigation(user(['viewer']));
    expect(visible.flatMap((g) => g.items).map((i) => i.label)).toEqual(['Inicio']);
  });
  it('oculta lo no construido y los grupos vacíos', () => {
    const v = visibleNavigation(user(['viewer']), groups);
    expect(v.map((g) => g.label)).toEqual([undefined, 'Proyecciones']);
    expect(v[1].items.map((i) => i.label)).toEqual(['Histórico']);
  });
  it('Administración solo para admin', () =>
    expect(visibleNavigation(user(['admin']), groups).map((g) => g.label)).toContain('Administración'));
  it('ítem activo: la ruta más específica', () => {
    expect(activeItem('/app/proyecciones/historico/2026-07', groups)?.label).toBe('Histórico');
    expect(activeItem('/app', groups)?.label).toBe('Inicio');
  });
  it('el orden de los grupos es el de diseno-app.md', () =>
    expect(NAVIGATION.map((g) => g.label ?? g.items[0].label)).toEqual([
      'Inicio', 'Proyecciones', 'Variables', 'Modelos', 'Operación', 'Datos y documentación', 'Administración',
    ]));
});
