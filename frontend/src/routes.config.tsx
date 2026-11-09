import type { RouteObject } from 'react-router-dom';
import { PortalHome } from './zones/portal/PortalHome';
import { KioskPage } from './zones/pantalla/KioskPage';
import { AppHome } from './zones/app/AppHome';
import { LoginPage } from './auth/LoginPage';
import { RequireRole } from './auth/RequireRole';

// Declarar cada ruta con `path: '...'` en una línea (lo lee scripts/inventario.py).
export const routes: RouteObject[] = [
  { path: '/', element: <PortalHome /> },
  { path: '/ingresar', element: <LoginPage /> },
  { path: '/pantalla', element: <KioskPage /> },
  { path: '/app', element: <RequireRole role="viewer"><AppHome /></RequireRole> },
];
