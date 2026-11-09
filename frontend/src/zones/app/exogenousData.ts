/**
 * Cálculos de presentación del monitor de exógenas (T-11): desvío frente al supuesto, estado según los umbrales
 * (ilustrativos hasta X-03) y títulos con hallazgo (GRA-02). No calcula impactos ni correlaciones: llegan con los datos.
 */
import type { BadgeTone } from '../../components/Badge/Badge';
import type { ExogenousMonitorVariable, Scenario } from '../../data/types';
import { formatNumber, formatPercent, formatValue } from '../../lib/format';

export type VariableStatus = 'out' | 'watch' | 'ok';

export const STATUS_LABEL: Record<VariableStatus, string> = { out: 'Fuera de rango', watch: 'En vigilancia', ok: 'En rango' };
export const STATUS_TONE: Record<VariableStatus, BadgeTone> = { out: 'critical', watch: 'warning', ok: 'success' };
const STATUS_ORDER: Record<VariableStatus, number> = { out: 0, watch: 1, ok: 2 };

/** Observado menos supuesto del escenario, en la unidad del desvío. */
export function deviation(v: ExogenousMonitorVariable, scenario: Scenario): number {
  return Math.round((v.observed - v.assumption[scenario]) * 100) / 100;
}

export function variableStatus(v: ExogenousMonitorVariable, scenario: Scenario): VariableStatus {
  const d = Math.abs(deviation(v, scenario));
  if (d >= v.threshold.out) return 'out';
  if (d >= v.threshold.watch) return 'watch';
  return 'ok';
}

/** Para ordenar la columna Estado: primero lo más grave. */
export function statusRank(status: VariableStatus): number {
  return STATUS_ORDER[status];
}

/** Decimales para mostrar un valor de la variable: cifras grandes sin decimales. */
export function decimalsFor(v: ExogenousMonitorVariable): number {
  return Math.abs(v.observed) >= 100 ? 0 : 1;
}

/** Las unidades largas («COP/USD», «millones») van en la línea de la fuente y no en cada celda, para que la tabla quepa. */
export function unitInCell(v: ExogenousMonitorVariable): boolean {
  return v.unit.length <= 4;
}

/** Valor con su unidad: «3,0 %», «24,1 °C», «420 MW», «+0,3» (el ONI lleva signo). */
export function formatVariableValue(v: ExogenousMonitorVariable, value: number): string {
  const options = { decimals: decimalsFor(v), signed: v.unit === '' };
  return v.unit && unitInCell(v) ? formatValue(value, v.unit, options) : formatNumber(value, options);
}

/** Desvío con signo y su unidad: «−1,2 pp», «+0,3 °C», «+90 MW». */
export function formatDeviation(v: ExogenousMonitorVariable, scenario: Scenario): string {
  const options = { decimals: decimalsFor(v), signed: true };
  const d = deviation(v, scenario);
  return v.deviationUnit && unitInCell(v) ? formatValue(d, v.deviationUnit, options) : formatNumber(d, options);
}

/** Fuente y frecuencia: «DANE, trimestral»; con la unidad si no va en las celdas: «EIA, diaria · USD/bbl». */
export function sourceLine(v: ExogenousMonitorVariable): string {
  return `${v.source}, ${v.frequency}${unitInCell(v) ? '' : ` · ${v.unit}`}`;
}

export type MonitorSummary = { total: number; out: number; watch: number; impact: number };

/** Cifras de los cuatro indicadores. El impacto total es la suma de los efectos de cada variable. */
export function monitorSummary(variables: ExogenousMonitorVariable[], scenario: Scenario): MonitorSummary {
  const statuses = variables.map((v) => variableStatus(v, scenario));
  const impact = variables.reduce((sum, v) => sum + v.impact[scenario], 0);
  return {
    total: variables.length,
    out: statuses.filter((s) => s === 'out').length,
    watch: statuses.filter((s) => s === 'watch').length,
    impact: Math.round(impact * 10) / 10 + 0,
  };
}

/** Variable que se muestra por defecto en el gráfico: la fuera de rango de mayor impacto, o la primera. */
export function defaultVariable(variables: ExogenousMonitorVariable[], scenario: Scenario): ExogenousMonitorVariable | undefined {
  return [...variables].sort((a, b) =>
    statusRank(variableStatus(a, scenario)) - statusRank(variableStatus(b, scenario))
    || Math.abs(b.impact[scenario]) - Math.abs(a.impact[scenario]))[0];
}

/**
 * Título de la tabla con el hallazgo (GRA-02): «PIB total es la única variable fuera de rango (−0,7 % en la demanda)».
 */
export function monitorTitle(variables: ExogenousMonitorVariable[], scenario: Scenario): string {
  const out = variables
    .filter((v) => variableStatus(v, scenario) === 'out')
    .sort((a, b) => Math.abs(b.impact[scenario]) - Math.abs(a.impact[scenario]));
  const watch = variables.filter((v) => variableStatus(v, scenario) === 'watch').length;
  const impact = (v: ExogenousMonitorVariable) => `${formatPercent(v.impact[scenario], { signed: true })} en la demanda`;
  if (out.length === 1) return `${out[0].name} es la única variable fuera de rango (${impact(out[0])})`;
  if (out.length > 1) return `${out.length} variables fuera de rango; la de mayor efecto es ${out[0].name} (${impact(out[0])})`;
  if (watch > 0) return `Ninguna variable fuera de rango; ${watch} en vigilancia`;
  return 'Todas las variables se comportan como supuso la revisión';
}

/**
 * Título del gráfico de correlación (GRA-02): con quiebre, si la relación se debilita o se fortalece desde ese año;
 * sin quiebre, la correlación más reciente.
 */
export function correlationTitle(v: ExogenousMonitorVariable): string {
  const last = v.rolling.at(-1);
  if (!last) return `Relación entre ${v.name} y la demanda`;
  if (v.breakFrom) {
    const before = v.rolling.find((p) => p.period === v.breakFrom)?.value ?? last.value;
    const verb = Math.abs(last.value) < Math.abs(before) ? 'se debilita' : 'se fortalece';
    return `La relación entre ${v.name} y la demanda ${verb} desde ${v.breakFrom.slice(0, 4)}`;
  }
  return `La relación entre ${v.name} y la demanda se mantiene estable (${formatNumber(last.value, { decimals: 2 })})`;
}
