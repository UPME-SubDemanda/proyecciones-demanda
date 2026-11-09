import { useAuth } from '../../auth/AuthContext';
import { EmptyState } from '../../components/EmptyState/EmptyState';
import { useProduct } from '../../lib/product';
import { AppPage } from './AppPage';

/**
 * Inicio de la app interna. Hoy muestra el esqueleto de vista (LAY-05); el tablero ejecutivo
 * ocupa este lugar en T-09 (UX-08: cada perfil tendrá su página de inicio).
 */
export function AppHome() {
  const { user } = useAuth();
  const [product] = useProduct();
  return (
    <AppPage title="Inicio" subtitle={`${product.name} · sesión de ${user?.name || user?.email}`}>
      <EmptyState
        title="Aquí estará el tablero ejecutivo"
        description={`Está en construcción. Mostrará cómo va la demanda de ${product.name.toLowerCase()} frente a la proyección vigente, sus indicadores y las alertas abiertas.`}
      />
    </AppPage>
  );
}
