import { useCallback, useId, useRef, useState, type ReactNode } from 'react';
import type { ECharts, EChartsOption } from 'echarts';
import { Button } from '../Button/Button';
import { ILLUSTRATIVE_LABEL } from '../Badge/Badge';
import { EChart } from '../charts/EChart';
import { cn } from '../../lib/cn';
import { downloadFile, fileName, toCsv, type DownloadMeta } from '../../lib/download';
import { formatNumber } from '../../lib/format';
import { icons } from '../../lib/icons';

export type ChartTable = { headers: string[]; rows: (string | number | null)[][] };

type Props = {
  /** El hallazgo con su cifra, no el tema (GRA-02). */
  title: string;
  /** Unidad, alcance y versión (GRA-02). */
  subtitle: string;
  option: EChartsOption;
  /** Tabla equivalente: se muestra con «Ver como tabla» y alimenta el CSV (GRA-08, A11-04). */
  table: ChartTable;
  /** Fuente, versión y nombre del archivo de descarga (UX-07). */
  download: Omit<DownloadMeta, 'illustrative'>;
  /** Controles propios del gráfico, p. ej. un SegmentedControl de rango o de producto. */
  controls?: ReactNode;
  illustrative?: boolean;
  height?: number;
  dark?: boolean;
  /** Decimales de las cifras en la tabla visible. */
  decimals?: number;
  className?: string;
};

/**
 * Contenedor de gráfico (CMP: ChartCard): título con hallazgo, subtítulo, controles, acciones
 * (datos, imagen, tabla, pantalla completa) y fuente (GRA-08).
 */
export function ChartCard({
  title, subtitle, option, table, download, controls, illustrative = false, height = 360, dark = false, decimals = 1, className,
}: Props) {
  const [showTable, setShowTable] = useState(false);
  const chartRef = useRef<ECharts | null>(null);
  const cardRef = useRef<HTMLElement>(null);
  const titleId = useId();
  const onReady = useCallback((chart: ECharts) => { chartRef.current = chart; }, []);
  const meta: DownloadMeta = { ...download, illustrative };

  const downloadCsv = () => downloadFile(fileName(meta, 'csv'), toCsv(meta, table.headers, table.rows));
  const downloadPng = () => {
    const url = chartRef.current?.getDataURL({ type: 'png', pixelRatio: 2, backgroundColor: 'transparent' });
    if (!url) return;
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName(meta, 'png');
    a.click();
  };
  const fullscreen = () => void cardRef.current?.requestFullscreen?.();

  return (
    <section
      ref={cardRef}
      aria-labelledby={titleId}
      data-chart-card=""
      className={cn('flex flex-col gap-4 p-6 bg-surface-raised border border-line rounded-md', className)}
    >
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 id={titleId} className="text-h2">{title}</h2>
          <p className="text-small text-ink-muted">{subtitle}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {controls}
          <Button variant="ghost" size="sm" icon={icons.download} onClick={downloadCsv}>Descargar datos</Button>
          <Button variant="ghost" size="sm" onClick={downloadPng}>Descargar imagen</Button>
          <Button variant="ghost" size="sm" onClick={() => setShowTable((v) => !v)}>
            {showTable ? 'Ver gráfico' : 'Ver como tabla'}
          </Button>
          <Button variant="ghost" size="sm" onClick={fullscreen}>Pantalla completa</Button>
        </div>
      </header>

      {!showTable && <EChart option={option} height={height} dark={dark} ariaLabel={title} onReady={onReady} />}

      <div className={showTable ? 'overflow-x-auto' : 'sr-only'}>
        <table className="w-full text-small">
          <caption className="sr-only">{title}</caption>
          <thead className="bg-surface-sunken">
            <tr>
              {table.headers.map((h, i) => (
                <th key={h} scope="col" className={cn('px-3 py-2 text-label', i === 0 ? 'text-left' : 'text-right')}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row) => (
              <tr key={String(row[0])} className="border-t border-line">
                {row.map((value, i) =>
                  i === 0 ? (
                    <th key={i} scope="row" className="px-3 py-2 text-left font-normal">{value}</th>
                  ) : (
                    <td key={i} className="px-3 py-2 text-right tabular">
                      {typeof value === 'number' ? formatNumber(value, { decimals }) : (value ?? '—')}
                    </td>
                  ),
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <footer className="text-small text-ink-muted">
        Fuente: {download.source}.
        {illustrative && <> <strong className="text-ink">{ILLUSTRATIVE_LABEL}</strong>.</>}
      </footer>
    </section>
  );
}
