import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

export type User = { id: number; email: string; name: string; roles: string[] };
type Ctx = { user: User | null; loading: boolean; refresh: () => Promise<void>; logout: () => Promise<void> };

const AuthCtx = createContext<Ctx>({ user: null, loading: true, refresh: async () => {}, logout: async () => {} });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const refresh = async () => {
    const r = await fetch('/api/v1/auth/me', { credentials: 'include' });
    setUser(r.ok ? await r.json() : null);
    setLoading(false);
  };
  const logout = async () => {
    await fetch('/api/v1/auth/logout', { method: 'POST', credentials: 'include' });
    setUser(null);
  };
  useEffect(() => { void refresh(); }, []);
  return <AuthCtx.Provider value={{ user, loading, refresh, logout }}>{children}</AuthCtx.Provider>;
}

export const useAuth = () => useContext(AuthCtx);
export const hasRole = (u: User | null, role: string) => !!u && (u.roles.includes('admin') || u.roles.includes(role));
