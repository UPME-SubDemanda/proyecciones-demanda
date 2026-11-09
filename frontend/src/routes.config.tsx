import type { RouteObject } from 'react-router-dom';
import { PortalHome } from './zones/portal/PortalHome';
import { KioskPage } from './zones/pantalla/KioskPage';
import { ExecutiveDashboard } from './zones/app/ExecutiveDashboard';
import { AppLayout } from './zones/app/AppLayout';
import { LoginPage } from './auth/LoginPage';
import { RequireRole } from './auth/RequireRole';

// Declarar cada ruta con `path: '...'` en una línea (lo lee scripts/inventario.py).
export const routes: RouteObject[] = [
  { path: '/', element: <PortalHome /> },
  { path: '/ingresar', element: <LoginPage /> },
  { path: '/pantalla', element: <KioskPage /> },
  { path: '/app', element: <RequireRole role="viewer"><AppLayout /></RequireRole>, children: [{ index: true, element: <ExecutiveDashboard /> }] },
];
