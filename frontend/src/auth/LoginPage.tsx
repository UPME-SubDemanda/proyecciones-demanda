import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { rememberReturnTo, safeReturnTo } from './returnTo';

/**
 * Ingreso a la app interna. Sin mockup aprobado todavía (X-06): solo se asegura que, al ingresar,
 * se vuelva a la página que se pidió (`?siguiente=`) y que haya cómo volver al portal.
 */
export function LoginPage() {
  const { user, refresh } = useAuth();
  const nav = useNavigate();
  const [params] = useSearchParams();
  const next = safeReturnTo(params.get('siguiente'));
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    document.title = 'Ingresar · Proyecciones de demanda · UPME'; // A11-08
  }, []);

  // Si ya hay sesión, no hay nada que hacer aquí.
  useEffect(() => {
    if (user) nav(next, { replace: true });
  }, [user, next, nav]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const r = await fetch('/api/v1/auth/login', {
      method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!r.ok) return setError((await r.json()).detail ?? 'No fue posible ingresar.');
    await refresh();
    nav(next, { replace: true });
  };

  return (
    <main className="min-h-screen grid place-items-center bg-surface p-6">
      <form onSubmit={submit} className="bg-surface-raised border border-line rounded-md p-6 w-full max-w-[384px] flex flex-col gap-4">
        <h1 className="text-h1">Ingresar</h1>
        <a
          href="/api/v1/auth/google/login"
          onClick={() => rememberReturnTo(next)}
          className="h-11 rounded-md bg-primary text-on-primary grid place-items-center font-bold"
        >
          Ingresar con la cuenta institucional
        </a>
        <label className="flex flex-col gap-1 text-small text-ink-muted">Correo
          <input type="email" autoComplete="username" className="h-11 border border-line-strong rounded-sm px-3 text-ink bg-surface-raised" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label className="flex flex-col gap-1 text-small text-ink-muted">Contraseña
          <input type="password" autoComplete="current-password" className="h-11 border border-line-strong rounded-sm px-3 text-ink bg-surface-raised" value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        {error && <p role="alert" className="text-critical text-small">{error}</p>}
        <button className="h-11 rounded-md border border-line-strong font-bold">Ingresar con usuario local</button>
        <a href="/" className="self-start text-small text-primary underline">Volver al portal público</a>
      </form>
    </main>
  );
}
