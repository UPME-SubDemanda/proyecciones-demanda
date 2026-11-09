import { useEffect, useRef } from 'react';
import type { EChartsOption } from 'echarts';
import type { EChartsType as ECharts } from 'echarts/core';
import * as echarts from 'echarts/core';
import { BarChart, LineChart } from 'echarts/charts';
import {
  AriaComponent, DataZoomComponent, GridComponent, LegendComponent, MarkAreaComponent, MarkLineComponent,
  MarkPointComponent, TitleComponent, TooltipComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { themeDark, themeLight } from '../../estandares/echarts-theme.js';

// Solo los módulos que usan los gráficos del proyecto: el portal carga mucho menos que con ECharts completo.
// Si un gráfico nuevo necesita otro tipo o componente, se agrega aquí.
echarts.use([
  LineChart, BarChart, GridComponent, TooltipComponent, LegendComponent, MarkLineComponent, MarkAreaComponent,
  MarkPointComponent, DataZoomComponent, AriaComponent, TitleComponent, CanvasRenderer,
]);

echarts.registerTheme('brand-light', themeLight);
echarts.registerTheme('brand-dark', themeDark);

type Props = {
  option: EChartsOption;
  height?: number;
  dark?: boolean;
  ariaLabel: string;
  /** Recibe la instancia para acciones como descargar la imagen (GRA-08). */
  onReady?: (chart: ECharts) => void;
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
