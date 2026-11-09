/**
 * Hooks con los que las vistas leen datos (React Query). Es el único punto de acceso a los datos:
 * cambiar de cifras ilustrativas a la API solo toca `source.ts`.
 */
import { useQuery } from '@tanstack/react-query';
import type { ProductKey } from '../lib/product';
import { ILLUSTRATIVE, source } from './source';
import type { WithOrigin } from './types';

function withOrigin<T>(fetcher: () => Promise<T>): () => Promise<WithOrigin<T>> {
  return async () => ({ data: await fetcher(), illustrative: ILLUSTRATIVE });
}

/** Dato real anual del producto. */
export function useObservedSeries(product: ProductKey) {
  return useQuery({ queryKey: ['observed', product], queryFn: withOrigin(() => source.observed(product)) });
}

/** Revisiones publicadas del producto, de la más antigua a la vigente. */
export function useRevisions(product: ProductKey) {
  return useQuery({ queryKey: ['revisions', product], queryFn: withOrigin(() => source.revisions(product)) });
}

/** Valores por escenario de una revisión. No consulta mientras no haya revisión elegida. */
export function useRevisionValues(revisionId: number | undefined) {
  return useQuery({
    queryKey: ['revision-values', revisionId],
    queryFn: withOrigin(() => source.revisionValues(revisionId as number)),
    enabled: revisionId !== undefined,
  });
}

/** Variables exógenas con sus valores observados. */
export function useExogenous() {
  return useQuery({ queryKey: ['exogenous'], queryFn: withOrigin(() => source.exogenous()) });
}

/** Acierto de las proyecciones publicadas (definición pendiente, X-14). */
export function useAccuracy() {
  return useQuery({ queryKey: ['accuracy'], queryFn: withOrigin(() => source.accuracy()) });
}

/** Desempeño de una revisión frente al dato real: desviación mensual, año corrido y error medio (X-14). */
export function useRevisionPerformance(revisionId: number | undefined) {
  return useQuery({
    queryKey: ['revision-performance', revisionId],
    queryFn: withOrigin(() => source.revisionPerformance(revisionId as number)),
    enabled: revisionId !== undefined,
  });
}

/** Demanda diaria reciente de energía y gas (tablero «El sistema hoy»). */
export function useSystemToday() {
  return useQuery({ queryKey: ['system-today'], queryFn: withOrigin(() => source.systemToday()) });
}

/** Desempeño de varias revisiones a la vez (p. ej. el MAPE de todas, para compararlas). */
export function useRevisionsPerformance(revisionIds: number[]) {
  return useQuery({
    queryKey: ['revisions-performance', revisionIds],
    queryFn: withOrigin(() => Promise.all(revisionIds.map((id) => source.revisionPerformance(id)))),
    enabled: revisionIds.length > 0,
  });
}

/** Valores de varias revisiones a la vez (abanico de revisiones). */
export function useRevisionsValues(revisionIds: number[]) {
  return useQuery({
    queryKey: ['revisions-values', revisionIds],
    queryFn: withOrigin(() => Promise.all(revisionIds.map((id) => source.revisionValues(id)))),
    enabled: revisionIds.length > 0,
  });
}
