/**
 * De dónde salen los datos. Hoy, las cifras ilustrativas de `src/demo/`.
 * En T-18 este archivo pasa a llamar a la API (`/api/v1/...`) y `ILLUSTRATIVE` a `false`;
 * las vistas no cambian porque solo usan los hooks de `queries.ts`.
 */
import type { ProductKey } from '../lib/product';
import {
  demoAccuracy, demoAlerts, demoExogenous, demoObserved, demoRevisionPerformance, demoRevisions, demoRevisionValues, demoSystemToday,
} from '../demo/fixtures';
import type {
  Accuracy, Alert, ExogenousVariable, ObservedSeries, Revision, RevisionPerformance, RevisionValues, SystemToday,
} from './types';

export const ILLUSTRATIVE = true;

export const source = {
  observed: async (product: ProductKey): Promise<ObservedSeries> => demoObserved(product),
  revisions: async (product: ProductKey): Promise<Revision[]> => demoRevisions(product),
  revisionValues: async (revisionId: number): Promise<RevisionValues> => demoRevisionValues(revisionId),
  exogenous: async (): Promise<ExogenousVariable[]> => demoExogenous(),
  accuracy: async (): Promise<Accuracy> => demoAccuracy(),
  revisionPerformance: async (revisionId: number): Promise<RevisionPerformance> => demoRevisionPerformance(revisionId),
  systemToday: async (): Promise<SystemToday> => demoSystemToday(),
  alerts: async (): Promise<Alert[]> => demoAlerts(),
};
