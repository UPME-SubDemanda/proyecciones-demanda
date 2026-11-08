import { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { themeDark, themeLight } from '../../estandares/echarts-theme.js';

echarts.registerTheme('brand-light', themeLight);
echarts.registerTheme('brand-dark', themeDark);

type Props = { option: echarts.EChartsOption; height?: number; dark?: boolean; ariaLabel: string };

/** Envoltorio único de ECharts (GRA-00): tema de marca, redimensionado y etiqueta accesible (A11-04). */
export function EChart({ option, height = 360, dark = false, ariaLabel }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    const chart = echarts.init(ref.current, dark ? 'brand-dark' : 'brand-light');
    chart.setOption(option);
    const ro = new ResizeObserver(() => chart.resize());
    ro.observe(ref.current);
    return () => { ro.disconnect(); chart.dispose(); };
  }, [option, dark]);
  return <div ref={ref} role="img" aria-label={ariaLabel} style={{ height }} />;
}
