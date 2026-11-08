import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { hasRole, useAuth } from './AuthContext';

export function RequireRole({ role, children }: { role: string; children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-6 text-ink-muted">Cargando…</div>;
  if (!user) return <Navigate to="/ingresar" replace />;
  if (!hasRole(user, role))
    return (
      <div className="p-6">
        <h1 className="text-h1">Sin permiso</h1>
        <p className="text-ink-muted">Necesita el rol «{role}». Pídalo a un administrador del equipo (UX-06).</p>
      </div>
    );
  return <>{children}</>;
}
