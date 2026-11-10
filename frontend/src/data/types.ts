/**
 * Tipos de los datos que leen las vistas. Las respuestas de la API (`src/api/schema.d.ts`, generado con
 * `pnpm gen:api`, TEC-08) se adaptan a estos tipos en `source.ts`.
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
  frequency: 'A' | 'M';
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

/** Frecuencia con la que la fuente publica una variable exógena. */
export type Frequency = 'diaria' | 'mensual' | 'trimestral' | 'anual';

/**
 * Una variable del monitor de exógenas (T-11): supuesto de la revisión vigente por escenario frente a lo observado
 * en el año corrido. `assumption`, `observed` y `deviation` van en `unit`; si `deviationUnit` es `pp`, el supuesto y
 * lo observado son tasas (%) y el desvío va en puntos porcentuales.
 *
 * Impacto, correlación, correlación móvil y quiebre llegan **ya calculados** con la revisión o con una carga (T-17):
 * la app no los calcula (etapa 1). Los umbrales son ilustrativos hasta definir X-03.
 */
export type ExogenousMonitorVariable = {
  code: string; // `gdp`
  name: string;
  source: string;
  frequency: Frequency;
  unit: string; // `%`, `°C`, `MW`
  deviationUnit: string; // `pp`, `°C`, `MW`
  assumption: Record<Scenario, number>;
  observed: number;
  /** Efecto estimado del desvío en la demanda del año, % (elasticidad del modelo × desvío), por escenario. */
  impact: Record<Scenario, number>;
  /** Correlación con la demanda en el periodo de estimación del modelo, −1 a 1. */
  correlation: number;
  /** Desvío absoluto desde el que la variable pasa a «En vigilancia» y a «Fuera de rango» (ilustrativos, X-03). */
  threshold: { watch: number; out: number };
  /** Tendencia reciente: observado y supuesto por escenario, en la frecuencia de la variable. */
  trend: { observed: Point[]; assumption: Record<Scenario, Point[]> };
  /** Correlación móvil de 24 meses con la demanda, con intervalo del 95 % (`period` = `2026-09`). */
  rolling: { period: string; value: number; low: number; high: number }[];
  /** Quiebre estructural detectado en la correlación (CUSUM), desde ese mes; `null` si no hay. */
  breakFrom: string | null;
};

/** Importancia relativa de una variable en el modelo (SHAP), en % del total. */
export type VariableImportance = { name: string; share: number };

/** Monitor de exógenas de un producto frente a su revisión vigente (T-11). */
export type ExogenousMonitor = {
  product: ProductKey;
  revisionCode: string; // `2026-07`
  model: string; // `EE-LP v3.2.0`
  period: string; // año corrido, `2026`
  cutoff: string; // último mes con dato observado, `2026-09`
  demandSource: string; // fuente de la demanda con la que se correlaciona, `XM`
  variables: ExogenousMonitorVariable[];
  /** `null` si el modelo de la revisión no tiene importancia calculada. */
  importance: VariableImportance[] | null;
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
  /** Error con signo de los 12 meses siguientes a la publicación, % (positivo = sobreestimó). `null` si aún no hay 12 meses. */
  error12: number | null;
};

/**
 * Demanda diaria reciente para el tablero «El sistema hoy». `period` = `2026-09-30`.
 * Datos operativos públicos (XM y Gestor del Mercado de Gas); la definición final está en X-14.
 */
export type SystemToday = {
  lastDay: string;
  energyDaily: Point[]; // GWh por día, últimos 30 días
  energyPrevYear: Point[]; // mismo día del año anterior (mismas fechas, un año antes)
  gasDaily: Point[]; // GBTUD por día
  energyYesterday: number; // GWh
  energyVsLastYear: number; // % frente al mismo día del año anterior
  peakPowerMW: number;
  peakTime: string; // «19:30»
  gasYesterday: number; // GBTUD
  gasVsMonthAverage: number; // %
  energyYearToDate: number; // GWh, enero hasta el último mes
  weekendDrop: number; // % que bajan los fines de semana
  /** Qué partes son ilustrativas (T-37): la energía es real; la potencia máxima de ayer y el gas, todavía no. */
  illustrativeParts: { energy: boolean; peak: boolean; gas: boolean };
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

/** Alerta abierta (PRI-04): severidad, título con cifra, producto, tipo, fecha y acción hacia la causa. Reglas: X-03, X-10. */
export type AlertSeverity = 'high' | 'medium' | 'low';
export type Alert = {
  id: string;
  severity: AlertSeverity;
  title: string;
  product: ProductKey;
  type: string; // «Exógena vs. supuesto», «Desempeño», «Evento climático»
  date: string; // `2026-10-14`
  /** Acción hacia la causa y la vista donde se resuelve (`target`, una ruta de la app). */
  action: { label: string; target: string };
};

/** Datos de ejemplo o reales: las vistas muestran «Cifras ilustrativas» si es `true` (CON-07). */
export type WithOrigin<T> = { data: T; illustrative: boolean };
