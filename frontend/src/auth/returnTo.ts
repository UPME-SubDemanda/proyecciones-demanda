/**
 * A dónde volver después de ingresar. Solo se aceptan rutas de la app interna (`/app…`), para que un
 * enlace no pueda mandar a otro sitio después del ingreso.
 *
 * El ingreso local vuelve con `?siguiente=`. El ingreso con Google siempre regresa a `/app` (backend);
 * por eso el destino se guarda antes en `sessionStorage` y la app lo usa al cargar.
 */

const KEY = 'ingreso.siguiente';
export const APP_HOME = '/app';

export function safeReturnTo(value: string | null | undefined): string {
  if (!value || !value.startsWith('/app') || value.startsWith('//')) return APP_HOME;
  return value;
}

export function rememberReturnTo(path: string): void {
  try {
    sessionStorage.setItem(KEY, safeReturnTo(path));
  } catch {
    // Sin almacenamiento (navegación privada estricta): se vuelve al inicio de la app.
  }
}

/** Devuelve el destino guardado (una sola vez) o `null`. */
export function takeReturnTo(): string | null {
  try {
    const value = sessionStorage.getItem(KEY);
    sessionStorage.removeItem(KEY);
    return value ? safeReturnTo(value) : null;
  } catch {
    return null;
  }
}

/** Dirección de ingreso que vuelve a `path`. */
export function loginUrl(path: string): string {
  const next = safeReturnTo(path);
  return next === APP_HOME ? '/ingresar' : `/ingresar?siguiente=${encodeURIComponent(next)}`;
}
