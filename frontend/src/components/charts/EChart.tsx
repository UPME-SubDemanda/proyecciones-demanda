import { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { themeDark, themeLight } from '../../estandares/echarts-theme.js';

echarts.registerTheme('brand-light', themeLight);
echarts.registerTheme('brand-dark', themeDark);

type Props = {
  option: echarts.EChartsOption;
  height?: number;
  dark?: boolean;
  ariaLabel: string;
  /** Recibe la instancia para acciones como descargar la imagen (GRA-08). */
  onReady?: (chart: echarts.ECharts) => void;
};

export function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Envoltorio único de ECharts (GRA-00): tema de marca, redimensionado, etiqueta accesible (A11-04)
 * y sin animación si el usuario lo pide (GRA-11, A11-06).
 */
export function EChart({ option, height = 360, dark = false, ariaLabel, onReady }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    const chart = echarts.init(ref.current, dark ? 'brand-dark' : 'brand-light');
    chart.setOption(prefersReducedMotion() ? { ...option, animation: false } : option);
    onReady?.(chart);
    const ro = new ResizeObserver(() => chart.resize());
    ro.observe(ref.current);
    return () => { ro.disconnect(); chart.dispose(); };
  }, [option, dark, onReady]);
  return <div ref={ref} role="img" aria-label={ariaLabel} style={{ height }} />;
}
