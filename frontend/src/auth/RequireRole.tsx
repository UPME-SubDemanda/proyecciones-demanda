import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { ErrorState } from '../components/ErrorState/ErrorState';
import { Skeleton } from '../components/Skeleton/Skeleton';
import { hasRole, useAuth } from './AuthContext';
import { loginUrl } from './returnTo';

/** Protege una ruta: sin sesión va a ingresar (y vuelve después); sin el rol, explica cuál falta (UX-06). */
export function RequireRole({ role, children }: { role: string; children: ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <div className="p-6"><Skeleton height={240} label="Verificando la sesión" /></div>;
  if (!user) return <Navigate to={loginUrl(location.pathname + location.search)} replace />;
  if (!hasRole(user, role))
    return (
      <main className="max-w-[720px] mx-auto p-6">
        <ErrorState
          title="Sin permiso"
          description={`Necesita el rol «${role}». Pídalo a un administrador del equipo de la Subdirección de Demanda.`}
          action={<a href="/" className="text-primary underline">Ir al portal público</a>}
        />
      </main>
    );
  return <>{children}</>;
}
