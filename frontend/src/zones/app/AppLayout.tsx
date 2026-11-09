import { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { takeReturnTo } from '../../auth/returnTo';
import { AppShell } from '../../components/AppShell/AppShell';
import { SegmentedControl } from '../../components/SegmentedControl/SegmentedControl';
import { UserMenu } from '../../components/UserMenu/UserMenu';
import { icons } from '../../lib/icons';
import { PRODUCT_KEYS, PRODUCT_PARAM, PRODUCTS, useProduct } from '../../lib/product';
import { activeItem, activeLocation, visibleNavigation } from './navigation';

export const APP_NAME = 'Proyecciones de demanda';

/**
 * Estructura de todas las rutas `/app/*` (T-08): menú lateral, encabezado con el producto activo
 * (LAY-07) y el menú del usuario. Las vistas se dibujan en el `<Outlet />`.
 */
export function AppLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [product, setProduct] = useProduct();
  const groups = visibleNavigation(user);
  const active = activeItem(location.pathname, groups);

  // Tras ingresar con Google se llega siempre a /app: si se había pedido otra página, se va a ella.
  useEffect(() => {
    const next = takeReturnTo();
    if (next && next !== location.pathname + location.search) navigate(next, { replace: true });
    // Solo al entrar a la app.
  }, []);

  if (!user) return null; // RequireRole ya garantiza la sesión

  return (
    <AppShell
      appName={APP_NAME}
      groups={groups}
      activePath={active?.path}
      search={`?${PRODUCT_PARAM}=${product.key}`}
      location={activeLocation(location.pathname, groups)}
      controls={
        <>
          <SegmentedControl
            ariaLabel="Producto"
            value={product.key}
            onChange={setProduct}
            options={PRODUCT_KEYS.map((k) => ({ value: k, label: PRODUCTS[k].name, icon: icons[k] }))}
          />
          <UserMenu
            name={user.name}
            email={user.email}
            roles={user.roles}
            onLogout={async () => {
              await logout();
              navigate('/');
            }}
          />
        </>
      }
    >
      <Outlet />
    </AppShell>
  );
}
