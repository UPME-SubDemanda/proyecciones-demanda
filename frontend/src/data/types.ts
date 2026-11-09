/**
 * Tipos de los datos que leen las vistas. Siguen el modelo de datos de la etapa 1
 * (docs/tecnica/modelo-de-datos.md) y serán la forma de las respuestas de la API (T-18).
 * Cada vista anota en su PR qué campos necesitó; esa lista alimenta T-16.
 */
import type { ProductKey } from '../lib/product';

export type Scenario = 'low' | 'mid' | 'high';

export const SCENARIO_LABEL: Record<Scenario, string> = { low: 'Bajo', mid: 'Medio', high: 'Alto' };

export type RevisionStatus = 'draft' | 'in_review' | 'approved' | 'published' | 'superseded';

/** Punto de una serie anual. `period` es el año (`2026`); en mensual será `2026-09`. */
export type Point = { period: string; value: number };

/** core.series_observed — dato real. */
export type ObservedSeries = {
  product: ProductKey;
  frequency: 'A' | 'M';
  region: string;
  unit: string;
  source: string;
  cutoff: string; // último periodo con dato real, `2026-09`
  points: Point[];
};

/** core.revisions — revisión publicada. */
export type Revision = {
  id: number;
  product: ProductKey;
  code: string; // `2026-07`
  publishedOn: string; // `2026-07-31`
  cutoff: string; // fecha de corte de los datos, `2026-06`
  model: string; // texto libre en la etapa 1, `EE-LP v3.2.0`
  status: RevisionStatus;
  isCurrent: boolean; // la vigente
};

/** core.revision_values — valores proyectados por escenario. */
export type RevisionValues = {
  revisionId: number;
  frequency: 'A';
  region: string;
  unit: string;
  scenarios: Record<Scenario, Point[]>;
};

/** core.exogenous_variables + core.exogenous_observed. */
export type ExogenousVariable = {
  code: string; // `gdp`
  name: string;
  unit: string;
  source: string;
  points: Point[];
};

/**
 * Desempeño de una revisión frente al dato real (definiciones pendientes, X-14 y X-03).
 * `monthlyDeviation`: diferencia mensual real vs. proyectado, en %, últimos 12 meses (`period` = `2026-09`).
 */
export type RevisionPerformance = {
  revisionId: number;
  monthlyDeviation: Point[];
  yearToDate: number; // % real vs. proyectado en el año corrido
  threshold: number; // ± % aceptable (X-03)
  mape12: number; // error medio absoluto a 12 meses, %
};

/**
 * Acierto de las proyecciones publicadas. La definición del indicador está pendiente (X-14):
 * hoy se muestra como 100 % menos el error medio absoluto a `horizonMonths` meses.
 */
export type Accuracy = {
  value: number; // %
  meanAbsError: number; // %
  horizonMonths: number;
};

/** Datos de ejemplo o reales: las vistas muestran «Cifras ilustrativas» si es `true` (CON-07). */
export type WithOrigin<T> = { data: T; illustrative: boolean };
