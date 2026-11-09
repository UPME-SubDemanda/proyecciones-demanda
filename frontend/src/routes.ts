// Toda ruta debe tener su página en docs/usuario/inventario/ (DOC-02; lo verifica scripts/inventario.py --check).
import { createElement, lazy, Suspense } from 'react';
import { createBrowserRouter, type RouteObject } from 'react-router-dom';
import { routes } from './routes.config';

// Herramientas de desarrollo: solo existen con `pnpm dev` y no entran al build de producción,
// por eso no van en el inventario.
const devRoutes: RouteObject[] = import.meta.env.DEV
  ? [{
      path: '/dev/componentes',
      element: createElement(
        Suspense,
        { fallback: null },
        createElement(lazy(() => import('./dev/ComponentGallery').then((m) => ({ default: m.ComponentGallery })))),
      ),
    }]
  : [];

export const router = createBrowserRouter([...routes, ...devRoutes]);
