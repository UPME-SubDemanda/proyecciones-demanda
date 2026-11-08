import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

export function LoginPage() {
  const { refresh } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const r = await fetch('/api/v1/auth/login', {
      method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!r.ok) return setError((await r.json()).detail ?? 'No fue posible ingresar.');
    await refresh();
    nav('/app');
  };
  return (
    <main className="min-h-screen grid place-items-center bg-surface">
      <form onSubmit={submit} className="bg-surface-raised border border-line rounded-md p-6 w-96 flex flex-col gap-4">
        <h1 className="text-h1">Ingresar</h1>
        <a href="/api/v1/auth/google/login" className="h-10 rounded-md bg-primary text-on-primary grid place-items-center">
          Ingresar con la cuenta institucional
        </a>
        <label className="flex flex-col gap-1 text-small text-ink-muted">Correo
          <input className="h-10 border border-line-strong rounded-sm px-3 text-ink" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label className="flex flex-col gap-1 text-small text-ink-muted">Contraseña
          <input type="password" className="h-10 border border-line-strong rounded-sm px-3 text-ink" value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        {error && <p role="alert" className="text-critical text-small">{error}</p>}
        <button className="h-10 rounded-md border border-line-strong">Ingresar con usuario local</button>
      </form>
    </main>
  );
}
