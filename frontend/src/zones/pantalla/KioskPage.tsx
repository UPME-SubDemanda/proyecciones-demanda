import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { KioskShell, type KioskBoard } from '../../components/KioskShell/KioskShell';
import { parseInterval } from '../../components/KioskShell/rotation';
import { useObservedSeries, useSystemToday } from '../../data/queries';
import { formatMonth } from '../../lib/format';
import { PRODUCTS } from '../../lib/product';
import { KioskCompareBoard, KioskCompareHeader } from './KioskCompareBoard';
import { KioskBoardHeader, KioskProductBoard } from './KioskProductBoard';
import { KioskSystemBoard, KioskSystemHeader } from './KioskSystemBoard';
import { formatAge, parseBoards, type BoardKey } from './kioskData';

const REFRESH_MS = 15 * 60_000;

/**
 * Modo pantalla (T-07): tableros rotativos para televisores. Configuración por URL (TV-08):
 * `/pantalla?tableros=ee,gn,comparar,sistema&intervalo=20`. Solo datos públicos (TV-06).
 */
export function KioskPage() {
  const [params, setParams] = useSearchParams();
  const keys = parseBoards(params.get('tableros'));
  const interval = parseInterval(params.get('intervalo'));
  const queryClient = useQueryClient();
  const ee = useObservedSeries('ee');
  const gn = useObservedSeries('gn');
  const system = useSystemToday();
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

  const updatedAt = Math.min(...[ee.dataUpdatedAt, gn.dataUpdatedAt, system.dataUpdatedAt].filter(Boolean));
  const offline = ee.isError || gn.isError || system.isError;
  const age = Number.isFinite(updatedAt) && updatedAt > 0 ? formatAge(now - updatedAt) : '';
  const status = !age ? 'Cargando datos…' : offline ? `Sin conexión · últimos datos de ${age}` : `Actualizado ${age}`;

  const board = (key: BoardKey): KioskBoard => {
    if (key === 'ee' || key === 'gn') {
      const series = (key === 'ee' ? ee : gn).data;
      return {
        key,
        title: PRODUCTS[key].name,
        header: <KioskBoardHeader product={key} />,
        body: <KioskProductBoard product={key} />,
        source: `UPME con datos de ${series?.data.source ?? (key === 'ee' ? 'XM' : 'Gestor del Mercado de Gas')}`,
        cutoff: series ? formatMonth(series.data.cutoff) : undefined,
        illustrative: series?.illustrative ?? true,
      };
    }
    if (key === 'comparar') {
      return {
        key,
        title: 'Comparar proyecciones',
        header: <KioskCompareHeader />,
        body: <KioskCompareBoard />,
        source: 'UPME con datos de XM',
        cutoff: ee.data ? formatMonth(ee.data.data.cutoff) : undefined,
        illustrative: ee.data?.illustrative ?? true,
      };
    }
    return {
      key,
      title: 'El sistema hoy',
      header: <KioskSystemHeader />,
      body: <KioskSystemBoard />,
      source: 'XM y Gestor del Mercado de Gas',
      cutoff: system.data ? formatMonth(system.data.data.lastDay) : undefined,
      illustrative: system.data?.illustrative ?? true,
    };
  };

  return (
    <KioskShell
      boards={keys.map(board)}
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
