// Toda ruta debe tener su página en docs/usuario/inventario/ (DOC-02; lo verifica scripts/inventario.py --check).
import { createBrowserRouter } from 'react-router-dom';
import { routes } from './routes.config';

export const router = createBrowserRouter(routes);
