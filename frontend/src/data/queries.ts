/**
 * Hooks con los que las vistas leen datos (React Query). Es el único punto de acceso a los datos: de dónde sale cada
 * dato, y si es real o ilustrativo, lo decide `source.ts`.
 */
import { useQuery } from '@tanstack/react-query';
import type { ProductKey } from '../lib/product';
import type { Resolution } from '../lib/resolution';
import { source } from './source';
import type { WithOrigin } from './types';

/** Junta varias respuestas: es ilustrativo si alguna lo es. */
async function all<T>(requests: Promise<WithOrigin<T>>[]): Promise<WithOrigin<T[]>> {
  const results = await Promise.all(requests);
  return { data: results.map((r) => r.data), illustrative: results.some((r) => r.illustrative) };
}

/** Dato real del producto: anual, o mensual en energía eléctrica. */
export function useObservedSeries(product: ProductKey, frequency: Resolution = 'A') {
  return useQuery({ queryKey: ['observed', product, frequency], queryFn: () => source.observed(product, frequency) });
}

/** Revisiones publicadas del producto, de la más antigua a la vigente. */
export function useRevisions(product: ProductKey) {
  return useQuery({ queryKey: ['revisions', product], queryFn: () => source.revisions(product) });
}

/** Valores por escenario de una revisión (anual o mensual). No consulta mientras no haya revisión elegida. */
export function useRevisionValues(revisionId: number | undefined, frequency: Resolution = 'A') {
  return useQuery({
    queryKey: ['revision-values', revisionId, frequency],
    queryFn: () => source.revisionValues(revisionId as number, frequency),
    enabled: revisionId !== undefined,
  });
}

/** Variables exógenas con sus valores observados. */
export function useExogenous() {
  return useQuery({ queryKey: ['exogenous'], queryFn: () => source.exogenous() });
}

/** Monitor de exógenas del producto: supuestos de la revisión vigente frente a lo observado (T-11). */
export function useExogenousMonitor(product: ProductKey) {
  return useQuery({ queryKey: ['exogenous-monitor', product], queryFn: () => source.exogenousMonitor(product) });
}

/** Acierto de las proyecciones publicadas (definición pendiente, X-14). */
export function useAccuracy() {
  return useQuery({ queryKey: ['accuracy'], queryFn: () => source.accuracy() });
}

/** Desempeño de una revisión frente al dato real: desviación mensual, año corrido y error medio (X-14). */
export function useRevisionPerformance(revisionId: number | undefined) {
  return useQuery({
    queryKey: ['revision-performance', revisionId],
    queryFn: () => source.revisionPerformance(revisionId as number),
    enabled: revisionId !== undefined,
  });
}

/** Demanda diaria reciente de energía y gas (tablero «El sistema hoy»). */
export function useSystemToday() {
  return useQuery({ queryKey: ['system-today'], queryFn: () => source.systemToday() });
}

/** Desempeño de varias revisiones a la vez (p. ej. el MAPE de todas, para compararlas). */
export function useRevisionsPerformance(revisionIds: number[]) {
  return useQuery({
    queryKey: ['revisions-performance', revisionIds],
    queryFn: () => all(revisionIds.map((id) => source.revisionPerformance(id))),
    enabled: revisionIds.length > 0,
  });
}

/** Valores de varias revisiones a la vez (abanico de revisiones), anuales o mensuales. */
export function useRevisionsValues(revisionIds: number[], frequency: Resolution = 'A') {
  return useQuery({
    queryKey: ['revisions-values', revisionIds, frequency],
    queryFn: () => all(revisionIds.map((id) => source.revisionValues(id, frequency))),
    enabled: revisionIds.length > 0,
  });
}

/** Alertas abiertas (ejemplo hasta definir las reglas, X-03 y X-10). */
export function useAlerts() {
  return useQuery({ queryKey: ['alerts'], queryFn: () => source.alerts() });
}
