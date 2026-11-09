import { useCallback, useEffect, useState, type RefObject } from 'react';

/**
 * Pantalla completa de un elemento (o de toda la página si no se da). Devuelve si está activa
 * y una función para entrar o salir, para que el mismo botón diga «Pantalla completa» o
 * «Salir de pantalla completa». La tecla Esc del navegador también sale.
 */
export function useFullscreen(target?: RefObject<HTMLElement | null>): [boolean, () => void] {
  const [active, setActive] = useState(false);

  useEffect(() => {
    const onChange = () => {
      const el = document.fullscreenElement;
      setActive(!!el && (!target || el === target.current));
    };
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, [target]);

  const toggle = useCallback(() => {
    if (document.fullscreenElement) void document.exitFullscreen?.();
    else void (target?.current ?? document.documentElement).requestFullscreen?.();
  }, [target]);

  return [active, toggle];
}

/** Sale de pantalla completa si está activa (antes de navegar a otra vista). */
export function exitFullscreen(): void {
  if (typeof document !== 'undefined' && document.fullscreenElement) void document.exitFullscreen?.();
}
