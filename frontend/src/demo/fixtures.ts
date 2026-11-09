/**
 * CIFRAS ILUSTRATIVAS (CON-07). No son datos oficiales: sirven para construir las vistas
 * mientras se reúnen los datos reales (T-15). Se generan con fórmulas simples y deterministas,
 * con órdenes de magnitud parecidos a los de los mockups aprobados.
 * Este módulo se elimina en T-18, cuando las vistas lean la API.
 */
import type { ProductKey } from '../lib/product';
import type {
  Accuracy, Alert, ExogenousMonitor, ExogenousMonitorVariable, ExogenousVariable, Frequency, ObservedSeries, Point, Revision, RevisionPerformance, RevisionValues, Scenario, SystemToday,
} from '../data/types';

const FIRST_YEAR = 2010;
const LAST_OBSERVED_YEAR = 2025;
const HORIZON = 2040;

/** Variación pequeña y repetible por año, para que las series no sean rectas. */
function wobble(year: number, amplitude: number): number {
  return Math.sin(year * 1.7) * amplitude;
}

function round(value: number, decimals = 0): number {
  const f = 10 ** decimals;
  return Math.round(value * f) / f;
}

const BASE: Record<ProductKey, { start: number; growth: number; amplitude: number }> = {
  ee: { start: 56_000, growth: 0.026, amplitude: 0.012 }, // GWh
  gn: { start: 820, growth: 0.016, amplitude: 0.02 }, // GBTUD
};

function observedValue(product: ProductKey, year: number): number {
  const { start, growth, amplitude } = BASE[product];
  const covidDip = year === 2020 ? -0.05 : 0;
  return start * (1 + growth) ** (year - FIRST_YEAR) * (1 + wobble(year, amplitude) + covidDip);
}

export function demoObserved(product: ProductKey): ObservedSeries {
  const points: Point[] = [];
  for (let year = FIRST_YEAR; year <= LAST_OBSERVED_YEAR; year++) {
    points.push({ period: String(year), value: round(observedValue(product, year)) });
  }
  return {
    product,
    frequency: 'A',
    region: product === 'ee' ? 'SIN' : 'Nacional',
    unit: product === 'ee' ? 'GWh' : 'GBTUD',
    source: product === 'ee' ? 'XM' : 'Gestor del Mercado de Gas',
    cutoff: '2026-09',
    points,
  };
}

/** Revisiones semestrales; la última publicada es la vigente. */
const REVISION_CODES = ['2023-07', '2024-07', '2025-01', '2025-07', '2026-01', '2026-07'];
const MODEL: Record<ProductKey, string[]> = {
  ee: ['EE-LP v2.4.0', 'EE-LP v2.5.0', 'EE-LP v3.0.0', 'EE-LP v3.1.0', 'EE-LP v3.1.1', 'EE-LP v3.2.0'],
  gn: ['GN-MP v1.2.0', 'GN-MP v1.3.0', 'GN-MP v1.4.0', 'GN-MP v2.0.0', 'GN-MP v2.0.0', 'GN-MP v2.0.1'],
};
/** Error medio a 12 meses de cada revisión (MAPE, %), en el orden de REVISION_CODES; como el mockup. */
const MAPE: Record<ProductKey, number[]> = {
  ee: [2.3, 1.9, 1.6, 1.7, 1.4, 2.1],
  gn: [2.0, 1.8, 1.5, 1.6, 1.2, 1.4],
};
/** Error con signo a 12 meses (positivo = sobreestimó); la vigente aún no tiene 12 meses. Como el mockup. */
const ERROR12: Record<ProductKey, (number | null)[]> = {
  ee: [1.8, 1.0, 0.8, 1.2, -0.9, null],
  gn: [1.2, 0.9, -0.4, 0.6, 0.3, null],
};

function revisionId(product: ProductKey, index: number): number {
  return (product === 'ee' ? 100 : 200) + index;
}

export function demoRevisions(product: ProductKey): Revision[] {
  return REVISION_CODES.map((code, i) => {
    const [y, m] = code.split('-').map(Number);
    const cutoffMonth = m === 1 ? 12 : m - 1;
    const cutoffYear = m === 1 ? y - 1 : y;
    return {
      id: revisionId(product, i),
      product,
      code,
      publishedOn: `${code}-28`,
      cutoff: `${cutoffYear}-${String(cutoffMonth).padStart(2, '0')}`,
      model: MODEL[product][i],
      status: 'published',
      isCurrent: i === REVISION_CODES.length - 1,
    };
  });
}

const SPREAD: Record<Scenario, number> = { low: -0.009, mid: 0, high: 0.011 };

export function demoRevisionValues(id: number): RevisionValues {
  const product: ProductKey = id >= 200 ? 'gn' : 'ee';
  const index = id % 100;
  const { growth } = BASE[product];
  // Cada revisión arranca del último año con dato real cuando se publicó y es algo más optimista que la siguiente.
  const anchorYear = Math.min(LAST_OBSERVED_YEAR, Number(REVISION_CODES[index].slice(0, 4)) - 1);
  const anchor = observedValue(product, anchorYear);
  const optimism = (REVISION_CODES.length - 1 - index) * 0.0015;
  const scenarios = {} as Record<Scenario, Point[]>;
  for (const scenario of Object.keys(SPREAD) as Scenario[]) {
    const points: Point[] = [];
    for (let year = anchorYear; year <= HORIZON; year++) {
      const rate = growth + optimism + SPREAD[scenario];
      points.push({ period: String(year), value: round(anchor * (1 + rate) ** (year - anchorYear)) });
    }
    scenarios[scenario] = points;
  }
  return {
    revisionId: id,
    frequency: 'A',
    region: product === 'ee' ? 'SIN' : 'Nacional',
    unit: product === 'ee' ? 'GWh' : 'GBTUD',
    scenarios,
  };
}

/** Desviación mensual ilustrativa: arranca cerca de cero y se aleja (energía eléctrica hacia abajo, como el mockup). */
export function demoRevisionPerformance(id: number): RevisionPerformance {
  const product: ProductKey = id >= 200 ? 'gn' : 'ee';
  const months: string[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(Date.UTC(2026, 8 - i, 1)); // hasta sep-2026, la fecha de corte
    months.push(`${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`);
  }
  const [start, drift] = product === 'ee' ? [0.4, -0.3] : [0.3, 0.05];
  const monthlyDeviation = months.map((period, i) => ({
    period,
    value: round(start + drift * i + wobble(i + (product === 'ee' ? 3 : 7), 0.4), 1),
  }));
  const ytd = monthlyDeviation.filter((p) => p.period.startsWith('2026'));
  return {
    revisionId: id,
    monthlyDeviation,
    yearToDate: round(ytd.reduce((s, p) => s + p.value, 0) / ytd.length, 1),
    threshold: product === 'ee' ? 1.5 : 2,
    mape12: MAPE[product][id % 100],
    error12: ERROR12[product][id % 100],
  };
}

/** Último mes con dato diario: septiembre de 2026 (la fecha de corte). */
const DAILY_YEAR = 2026;
const DAILY_MONTH = 9;

/** Demanda diaria ilustrativa de los últimos 30 días: los fines de semana bajan cerca de 12 %. */
export function demoSystemToday(): SystemToday {
  const days = Array.from({ length: 30 }, (_, i) => i + 1);
  const isWeekend = (y: number, d: number) => [0, 6].includes(new Date(Date.UTC(y, DAILY_MONTH - 1, d)).getUTCDay());
  // El año anterior se compara contra el día equivalente de la semana, por eso usa el calendario del año actual.
  const energy = (d: number, base: number) => round(base * (isWeekend(DAILY_YEAR, d) ? 0.88 : 1) * (1 + wobble(d, 0.015)), 1);
  const date = (d: number) => `${DAILY_YEAR}-${String(DAILY_MONTH).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  const energyDaily = days.map((d) => ({ period: date(d), value: energy(d, 240) }));
  const energyPrevYear = days.map((d) => ({ period: date(d), value: energy(d, 234) }));
  const gasDaily = days.map((d) => ({ period: date(d), value: round(1050 * (isWeekend(DAILY_YEAR, d) ? 0.95 : 1) * (1 + wobble(d * 1.3, 0.03))) }));
  const last = energyDaily.at(-1)!;
  const lastPrev = energyPrevYear.at(-1)!;
  const gasLast = gasDaily.at(-1)!;
  const gasAvg = gasDaily.reduce((s, p) => s + p.value, 0) / gasDaily.length;
  return {
    lastDay: last.period,
    energyDaily,
    energyPrevYear,
    gasDaily,
    energyYesterday: last.value,
    energyVsLastYear: round(((last.value - lastPrev.value) / lastPrev.value) * 100, 1),
    peakPowerMW: 11_950,
    peakTime: '19:30',
    gasYesterday: gasLast.value,
    gasVsMonthAverage: round(((gasLast.value - gasAvg) / gasAvg) * 100, 1),
    energyYearToDate: 64_120,
    weekendDrop: 12,
  };
}

/** Alertas abiertas de ejemplo, como en el mockup del tablero ejecutivo. No hay reglas reales todavía (X-03, X-10). */
export function demoAlerts(): Alert[] {
  return [
    {
      id: 'a-1', severity: 'high', product: 'ee', type: 'Exógena vs. supuesto', date: '2026-10-14',
      title: 'PIB observado 1,8 % vs. supuesto 3,0 % (escenario medio)',
      action: { label: 'Ver variable', target: '/app/variables/exogenas?variable=gdp' },
    },
    {
      id: 'a-2', severity: 'high', product: 'ee', type: 'Desempeño', date: '2026-10-06',
      title: 'Error año corrido −1,8 %, fuera de umbral ±1,5 % por 3 meses',
      action: { label: 'Ver desempeño', target: '/app/proyecciones/vs-real' },
    },
    {
      id: 'a-3', severity: 'medium', product: 'gn', type: 'Evento climático', date: '2026-10-10',
      title: 'Probabilidad de El Niño 62 % para el próximo trimestre',
      action: { label: 'Ver monitor', target: '/app/variables/exogenas?variable=oni' },
    },
  ];
}

export function demoAccuracy(): Accuracy {
  return { value: 98.4, meanAbsError: 1.6, horizonMonths: 12 };
}

export function demoExogenous(): ExogenousVariable[] {
  const years = Array.from({ length: LAST_OBSERVED_YEAR - FIRST_YEAR + 1 }, (_, i) => FIRST_YEAR + i);
  return [
    {
      code: 'gdp',
      name: 'Crecimiento del PIB',
      unit: '%',
      source: 'DANE',
      points: years.map((y) => ({ period: String(y), value: y === 2020 ? -7.3 : round(3 + wobble(y, 1.5), 1) })),
    },
    {
      code: 'population',
      name: 'Población',
      unit: 'millones',
      source: 'DANE',
      points: years.map((y) => ({ period: String(y), value: round(45.5 * 1.011 ** (y - FIRST_YEAR), 1) })),
    },
    {
      code: 'oni',
      name: 'Índice Oceánico El Niño (ONI)',
      unit: '°C',
      source: 'NOAA',
      points: years.map((y) => ({ period: String(y), value: round(wobble(y * 2.3, 1.4), 1) })),
    },
  ];
}

type MonitorSpec = {
  code: string;
  name: string;
  source: string;
  frequency: Frequency;
  unit: string;
  deviationUnit: string;
  assumption: [number, number, number]; // bajo, medio, alto
  observed: number;
  /** % de demanda por unidad de desvío: el impacto ilustrativo es desvío × elasticidad. */
  elasticity: number;
  correlation: number;
  threshold: [number, number]; // vigilancia, fuera de rango
  /** Mes desde el que la correlación móvil cae (quiebre ilustrativo) y cuánto cae. */
  drop?: { from: string; by: number };
};

/**
 * Monitor de exógenas como el mockup aprobado: en energía eléctrica, 14 variables; el PIB fuera de rango,
 * ONI, temperatura y autogeneración solar en vigilancia, y un impacto total de −0,3 % en el escenario medio.
 */
const MONITOR: Record<ProductKey, MonitorSpec[]> = {
  ee: [
    { code: 'gdp', name: 'PIB total', source: 'DANE', frequency: 'trimestral', unit: '%', deviationUnit: 'pp', assumption: [2.2, 3.0, 3.8], observed: 1.8, elasticity: 0.58, correlation: 0.82, threshold: [0.5, 1.0], drop: { from: '2025-01', by: 0.17 } },
    { code: 'oni', name: 'Índice ONI (ENSO)', source: 'NOAA', frequency: 'mensual', unit: '', deviationUnit: '', assumption: [0.0, 0.3, 0.6], observed: 0.6, elasticity: 1.33, correlation: 0.41, threshold: [0.2, 0.5] },
    { code: 'temperature', name: 'Temperatura media', source: 'IDEAM', frequency: 'mensual', unit: '°C', deviationUnit: '°C', assumption: [23.9, 24.1, 24.3], observed: 24.4, elasticity: 1.0, correlation: 0.57, threshold: [0.2, 0.5] },
    { code: 'industry', name: 'Producción industrial', source: 'DANE', frequency: 'mensual', unit: '%', deviationUnit: 'pp', assumption: [1.8, 2.5, 3.2], observed: 2.3, elasticity: 0.5, correlation: 0.64, threshold: [0.5, 1.0] },
    { code: 'population', name: 'Población', source: 'DANE', frequency: 'anual', unit: '%', deviationUnit: 'pp', assumption: [1.0, 1.1, 1.2], observed: 1.1, elasticity: 0.9, correlation: 0.93, threshold: [0.1, 0.2] },
    { code: 'solar', name: 'Autogeneración solar', source: 'UPME', frequency: 'mensual', unit: 'MW', deviationUnit: 'MW', assumption: [380, 420, 470], observed: 510, elasticity: -0.0022, correlation: -0.38, threshold: [50, 150] },
    { code: 'cpi', name: 'Inflación (IPC)', source: 'DANE', frequency: 'mensual', unit: '%', deviationUnit: 'pp', assumption: [4.5, 4.0, 3.5], observed: 4.2, elasticity: 0.5, correlation: 0.12, threshold: [0.5, 1.0] },
    { code: 'fx', name: 'Tasa de cambio (TRM)', source: 'Banco de la República', frequency: 'diaria', unit: 'COP/USD', deviationUnit: 'COP/USD', assumption: [4300, 4100, 3900], observed: 4020, elasticity: 0.00125, correlation: -0.21, threshold: [150, 300] },
    { code: 'rainfall', name: 'Lluvias frente a lo normal', source: 'IDEAM', frequency: 'mensual', unit: '%', deviationUnit: 'pp', assumption: [95, 100, 105], observed: 102, elasticity: 0.01, correlation: -0.33, threshold: [10, 20] },
    { code: 'ev', name: 'Vehículos eléctricos', source: 'RUNT', frequency: 'mensual', unit: 'mil', deviationUnit: 'mil', assumption: [9, 10, 11], observed: 11.2, elasticity: 0.08, correlation: 0.29, threshold: [2, 4] },
    { code: 'households', name: 'Usuarios residenciales', source: 'SUI', frequency: 'mensual', unit: 'millones', deviationUnit: 'millones', assumption: [15.1, 15.2, 15.3], observed: 15.2, elasticity: 2, correlation: 0.88, threshold: [0.2, 0.4] },
    { code: 'workdays', name: 'Festivos y días hábiles', source: 'Calendario oficial', frequency: 'anual', unit: 'días', deviationUnit: 'días', assumption: [247, 247, 247], observed: 247, elasticity: 0.1, correlation: 0.71, threshold: [1, 2] },
    { code: 'brent', name: 'Precio del petróleo (Brent)', source: 'EIA', frequency: 'diaria', unit: 'USD/bbl', deviationUnit: 'USD/bbl', assumption: [65, 75, 85], observed: 68, elasticity: 0.015, correlation: 0.18, threshold: [10, 20] },
    { code: 'retail', name: 'Comercio minorista', source: 'DANE', frequency: 'mensual', unit: '%', deviationUnit: 'pp', assumption: [2.0, 2.8, 3.5], observed: 2.6, elasticity: 0.1, correlation: 0.66, threshold: [0.5, 1.0] },
  ],
  gn: [
    { code: 'thermal', name: 'Generación térmica a gas', source: 'XM', frequency: 'mensual', unit: 'GBTUD', deviationUnit: 'GBTUD', assumption: [250, 280, 310], observed: 365, elasticity: 0.009, correlation: 0.76, threshold: [30, 60], drop: { from: '2025-07', by: -0.1 } },
    { code: 'oni', name: 'Índice ONI (ENSO)', source: 'NOAA', frequency: 'mensual', unit: '', deviationUnit: '', assumption: [0.0, 0.3, 0.6], observed: 0.6, elasticity: 0.67, correlation: 0.52, threshold: [0.2, 0.5] },
    { code: 'gdp', name: 'PIB total', source: 'DANE', frequency: 'trimestral', unit: '%', deviationUnit: 'pp', assumption: [2.2, 3.0, 3.8], observed: 1.8, elasticity: 0.25, correlation: 0.61, threshold: [0.5, 1.0] },
    { code: 'industry', name: 'Producción industrial', source: 'DANE', frequency: 'mensual', unit: '%', deviationUnit: 'pp', assumption: [1.8, 2.5, 3.2], observed: 2.3, elasticity: 0.5, correlation: 0.58, threshold: [0.5, 1.0] },
    { code: 'households', name: 'Usuarios residenciales', source: 'SUI', frequency: 'mensual', unit: 'millones', deviationUnit: 'millones', assumption: [11.3, 11.4, 11.5], observed: 11.4, elasticity: 1.5, correlation: 0.84, threshold: [0.2, 0.4] },
    { code: 'henryhub', name: 'Precio Henry Hub', source: 'EIA', frequency: 'diaria', unit: 'USD/MBTU', deviationUnit: 'USD/MBTU', assumption: [2.8, 3.4, 4.0], observed: 3.6, elasticity: -0.5, correlation: -0.27, threshold: [0.5, 1.0] },
    { code: 'cng', name: 'Vehículos a gas (GNV)', source: 'RUNT', frequency: 'mensual', unit: 'mil', deviationUnit: 'mil', assumption: [640, 650, 660], observed: 647, elasticity: 0.01, correlation: 0.35, threshold: [10, 20] },
    { code: 'temperature', name: 'Temperatura media', source: 'IDEAM', frequency: 'mensual', unit: '°C', deviationUnit: '°C', assumption: [23.9, 24.1, 24.3], observed: 24.4, elasticity: 0.3, correlation: 0.22, threshold: [0.2, 0.5] },
    { code: 'fx', name: 'Tasa de cambio (TRM)', source: 'Banco de la República', frequency: 'diaria', unit: 'COP/USD', deviationUnit: 'COP/USD', assumption: [4300, 4100, 3900], observed: 4020, elasticity: 0.00125, correlation: -0.19, threshold: [150, 300] },
    { code: 'population', name: 'Población', source: 'DANE', frequency: 'anual', unit: '%', deviationUnit: 'pp', assumption: [1.0, 1.1, 1.2], observed: 1.1, elasticity: 0.6, correlation: 0.9, threshold: [0.1, 0.2] },
  ],
};

/** Importancia relativa (SHAP) del modelo de la revisión vigente, como el mockup. */
const IMPORTANCE: Record<ProductKey, { name: string; share: number }[]> = {
  ee: [
    { name: 'Población', share: 31 }, { name: 'PIB total', share: 27 }, { name: 'Producción industrial', share: 16 },
    { name: 'Temperatura media', share: 12 }, { name: 'Festivos y días hábiles', share: 8 }, { name: 'Índice ONI', share: 6 },
  ],
  gn: [
    { name: 'Generación térmica a gas', share: 34 }, { name: 'PIB total', share: 22 }, { name: 'Usuarios residenciales', share: 18 },
    { name: 'Índice ONI', share: 12 }, { name: 'Producción industrial', share: 9 }, { name: 'Precio Henry Hub', share: 5 },
  ],
};

const SCENARIO_ORDER: Scenario[] = ['low', 'mid', 'high'];
const MONTHS = Array.from({ length: 69 }, (_, i) => `${2021 + Math.floor(i / 12)}-${String((i % 12) + 1).padStart(2, '0')}`); // 2021-01 a 2026-09

/** Redondea sin dejar «−0». */
function r(value: number, decimals: number): number {
  return round(value, decimals) + 0;
}

/** Últimos seis periodos en la frecuencia de la variable. */
function trendPeriods(frequency: Frequency): string[] {
  if (frequency === 'anual') return ['2021', '2022', '2023', '2024', '2025', '2026'];
  if (frequency === 'trimestral') return ['2025-T2', '2025-T3', '2025-T4', '2026-T1', '2026-T2', '2026-T3'];
  return MONTHS.slice(-6);
}

function monitorVariable(spec: MonitorSpec, index: number): ExogenousMonitorVariable {
  const decimals = Math.abs(spec.observed) >= 100 ? 0 : 1;
  const assumption = Object.fromEntries(SCENARIO_ORDER.map((s, i) => [s, spec.assumption[i]])) as Record<Scenario, number>;
  const periods = trendPeriods(spec.frequency);
  const start = assumption.mid;
  const observedTrend = periods.map((period, k) => ({
    period,
    value: k === periods.length - 1
      ? spec.observed
      : r(start + (spec.observed - start) * (k / (periods.length - 1)) + wobble(k + index, spec.threshold[0] * 0.15), decimals),
  }));
  const breakIndex = spec.drop ? MONTHS.indexOf(spec.drop.from) : -1;
  const rolling = MONTHS.map((period, i) => {
    const base = Math.max(-0.95, Math.min(0.95, spec.correlation + Math.sin((i + index * 7) / 5) * 0.03));
    const fall = spec.drop && i >= breakIndex ? spec.drop.by * ((i - breakIndex) / (MONTHS.length - 1 - breakIndex)) : 0;
    const value = r(base - fall, 2);
    const half = 0.06 + (spec.drop && i >= breakIndex ? 0.03 : 0);
    return { period, value, low: r(Math.max(-1, value - half), 2), high: r(Math.min(1, value + half), 2) };
  });
  return {
    code: spec.code,
    name: spec.name,
    source: spec.source,
    frequency: spec.frequency,
    unit: spec.unit,
    deviationUnit: spec.deviationUnit,
    assumption,
    observed: spec.observed,
    impact: Object.fromEntries(SCENARIO_ORDER.map((s) => [s, r((spec.observed - assumption[s]) * spec.elasticity, 1)])) as Record<Scenario, number>,
    correlation: spec.correlation,
    threshold: { watch: spec.threshold[0], out: spec.threshold[1] },
    trend: {
      observed: observedTrend,
      assumption: Object.fromEntries(SCENARIO_ORDER.map((s) => [s, periods.map((period) => ({ period, value: assumption[s] }))])) as Record<Scenario, Point[]>,
    },
    rolling,
    breakFrom: spec.drop?.from ?? null,
  };
}

export function demoExogenousMonitor(product: ProductKey): ExogenousMonitor {
  return {
    product,
    revisionCode: REVISION_CODES.at(-1)!,
    model: MODEL[product].at(-1)!,
    period: '2026',
    cutoff: '2026-09',
    demandSource: product === 'ee' ? 'XM' : 'Gestor del Mercado de Gas',
    variables: MONITOR[product].map(monitorVariable),
    importance: IMPORTANCE[product],
  };
}
