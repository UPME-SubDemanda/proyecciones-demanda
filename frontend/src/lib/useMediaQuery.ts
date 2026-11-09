import { useEffect, useState } from 'react';

/** `true` mientras se cumpla la media query, p. ej. `(max-width: 639px)` (quiebres de LAY-08). */
export function useMediaQuery(query: string): boolean {
  const get = () => typeof window !== 'undefined' && !!window.matchMedia?.(query).matches;
  const [matches, setMatches] = useState(get);
  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    onChange();
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [query]);
  return matches;
}

/** Pantalla de teléfono: por debajo del primer quiebre del portal (640 px). */
export const PHONE = '(max-width: 639px)';
