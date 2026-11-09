/**
 * Valor actual de un token CSS (`--primary`), para los pocos casos en que ECharts necesita un color que el
 * tema de gráficos no trae. Así el código sigue usando nombres de tokens (TOK-02). Sin navegador
 * (pruebas), devuelve `fallback`.
 */
export function cssVar(name: string, fallback: string): string {
  if (typeof document === 'undefined') return fallback;
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || fallback;
}
