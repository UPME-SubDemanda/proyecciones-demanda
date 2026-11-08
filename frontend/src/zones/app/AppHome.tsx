import { useAuth } from '../../auth/AuthContext';

export function AppHome() {
  const { user, logout } = useAuth();
  return (
    <main className="p-6 flex flex-col gap-4">
      <h1 className="text-h1">Inicio</h1>
      <p className="text-ink-muted">Sesión: {user?.email} · roles: {user?.roles.join(', ') || 'ninguno'}</p>
      <button className="self-start h-10 px-4 rounded-md border border-line-strong" onClick={() => void logout()}>Salir</button>
    </main>
  );
}
