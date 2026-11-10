/**
 * De dónde salen los datos de cada vista, y si son reales o ilustrativos (CON-07).
 *
 * Desde T-37 (issue #40, provisional): energía eléctrica sale de la API (`/api/v1/ee/...`, datos reales de la base);
 * lo demás sigue con las cifras ilustrativas de `src/demo/`, marcado como tal: gas natural, exógenas, alertas,
 * acierto (X-14) y, en «El sistema hoy», la potencia máxima y el gas. Las vistas no cambian: solo usan los hooks de
 * `queries.ts`, y cada respuesta dice si es ilustrativa.
 *
 * Si la API falla, se lanza el error: la vista muestra su estado de error, nunca cifras de ejemplo como si fueran reales.
 */
import type { components } from '../api/schema';
import type { ProductKey } from '../lib/product';
import {
  demoAccuracy, demoAlerts, demoExogenous, demoExogenousMonitor, demoObserved, demoRevisionPerformance, demoRevisions, demoRevisionValues, demoSystemToday,
} from '../demo/fixtures';
import type {
  Accuracy, Alert, ExogenousMonitor, ExogenousVariable, ObservedSeries, Revision, RevisionPerformance, RevisionStatus, RevisionValues, SystemToday, WithOrigin,
} from './types';

type Api = components['schemas'];

/** Ids de las revisiones ilustrativas (energía eléctrica 100+, gas natural 200+); las reales son las de la base. */
export const DEMO_REVISION_ID = 100;

const real = <T>(data: T): WithOrigin<T> => ({ data, illustrative: false });
const demo = <T>(data: T): WithOrigin<T> => ({ data, illustrative: true });

async function api<T>(path: string): Promise<T> {
  const response = await fetch(`/api/v1${path}`);
  if (!response.ok) throw new Error(`La API respondió ${response.status} en ${path}`);
  return (await response.json()) as T;
}

const isDemoRevision = (id: number) => id >= DEMO_REVISION_ID;

export const source = {
  observed: async (product: ProductKey): Promise<WithOrigin<ObservedSeries>> => {
    if (product !== 'ee') return demo(demoObserved(product));
    const body = await api<Api['ObservedSeries']>('/ee/observed');
    return real({ ...body, product: 'ee', frequency: 'A' });
  },
  revisions: async (product: ProductKey): Promise<WithOrigin<Revision[]>> => {
    if (product !== 'ee') return demo(demoRevisions(product));
    const body = await api<Api['Revision'][]>('/ee/revisions');
    return real(body.map((r) => ({ ...r, product: 'ee' as const, status: r.status as RevisionStatus })));
  },
  revisionValues: async (revisionId: number): Promise<WithOrigin<RevisionValues>> => {
    if (isDemoRevision(revisionId)) return demo(demoRevisionValues(revisionId));
    const body = await api<Api['RevisionValues']>(`/ee/revisions/${revisionId}/values`);
    return real({ ...body, frequency: 'A' });
  },
  revisionPerformance: async (revisionId: number): Promise<WithOrigin<RevisionPerformance>> => {
    if (isDemoRevision(revisionId)) return demo(demoRevisionPerformance(revisionId));
    return real(await api<Api['RevisionPerformance']>(`/ee/revisions/${revisionId}/performance`));
  },
  /** Energía real (XM); potencia máxima y gas ilustrativos, marcados en `illustrativeParts`. */
  systemToday: async (): Promise<WithOrigin<SystemToday>> => {
    const energy = await api<Api['SystemTodayEnergy']>('/ee/system-today');
    return real({ ...demoSystemToday(), ...energy, illustrativeParts: { energy: false, peak: true, gas: true } });
  },
  exogenous: async (): Promise<WithOrigin<ExogenousVariable[]>> => demo(demoExogenous()),
  exogenousMonitor: async (product: ProductKey): Promise<WithOrigin<ExogenousMonitor>> => demo(demoExogenousMonitor(product)),
  accuracy: async (): Promise<WithOrigin<Accuracy>> => demo(demoAccuracy()),
  alerts: async (): Promise<WithOrigin<Alert[]>> => demo(demoAlerts()),
};
