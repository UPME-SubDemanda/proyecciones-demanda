import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { KioskShell, type KioskBoard } from '../../components/KioskShell/KioskShell';
import { parseInterval } from '../../components/KioskShell/rotation';
import { useObservedSeries } from '../../data/queries';
import { formatMonth } from '../../lib/format';
import { PRODUCTS } from '../../lib/product';
import { KioskBoardHeader, KioskProductBoard } from './KioskProductBoard';
import { formatAge, parseBoards } from './kioskData';

const REFRESH_MS = 15 * 60_000;

/**
 * Modo pantalla (T-07): tableros rotativos para televisores. Configuración por URL (TV-08):
 * `/pantalla?tableros=ee,gn&intervalo=20`. Solo datos públicos (TV-06).
 */
export function KioskPage() {
  const [params, setParams] = useSearchParams();
  const products = parseBoards(params.get('tableros'));
  const interval = parseInterval(params.get('intervalo'));
  const queryClient = useQueryClient();
  const ee = useObservedSeries('ee');
  const gn = useObservedSeries('gn');
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    document.title = 'Modo pantalla · Proyecciones de demanda de energía · UPME'; // A11-08
  }, []);

  // Vuelve a pedir los datos cada 15 min. Si falla, React Query conserva los últimos (TV-07).
  useEffect(() => {
    const id = window.setInterval(() => {
      void queryClient.invalidateQueries();
      setNow(Date.now());
    }, REFRESH_MS);
    const clock = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => { window.clearInterval(id); window.clearInterval(clock); };
  }, [queryClient]);

  const updatedAt = Math.min(...[ee.dataUpdatedAt, gn.dataUpdatedAt].filter(Boolean));
  const offline = ee.isError || gn.isError;
  const age = Number.isFinite(updatedAt) && updatedAt > 0 ? formatAge(now - updatedAt) : '';
  const status = !age ? 'Cargando datos…' : offline ? `Sin conexión · últimos datos de ${age}` : `Actualizado ${age}`;

  const boards: KioskBoard[] = products.map((p) => {
    const series = (p === 'ee' ? ee : gn).data;
    const cutoff = series ? ` · datos a ${formatMonth(series.data.cutoff)}` : '';
    return {
      key: p,
      title: PRODUCTS[p].name,
      header: <KioskBoardHeader product={p} />,
      body: <KioskProductBoard product={p} />,
      source: `UPME con datos de ${series?.data.source ?? (p === 'ee' ? 'XM' : 'Gestor del Mercado de Gas')}${cutoff}`,
      illustrative: series?.illustrative ?? true,
    };
  });

  return (
    <KioskShell
      boards={boards}
      intervalSeconds={interval}
      status={status}
      onIntervalChange={(s) =>
        setParams((prev) => {
          const next = new URLSearchParams(prev);
          next.set('intervalo', String(s));
          return next;
        }, { replace: true })
      }
    />
  );
}
