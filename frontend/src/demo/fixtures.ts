/**
 * CIFRAS ILUSTRATIVAS (CON-07). No son datos oficiales: sirven para construir las vistas
 * mientras se reúnen los datos reales (T-15). Se generan con fórmulas simples y deterministas,
 * con órdenes de magnitud parecidos a los de los mockups aprobados.
 * Este módulo se elimina en T-18, cuando las vistas lean la API.
 */
import type { ProductKey } from '../lib/product';
import type {
  Accuracy, Alert, ExogenousVariable, ObservedSeries, Point, Revision, RevisionPerformance, RevisionValues, Scenario, SystemToday,
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
      action: { label: 'Ver variable', target: '/app/exogenas' },
    },
    {
      id: 'a-2', severity: 'high', product: 'ee', type: 'Desempeño', date: '2026-10-06',
      title: 'Error año corrido −1,8 %, fuera de umbral ±1,5 % por 3 meses',
      action: { label: 'Ver desempeño', target: '/app/proyecciones/vs-real' },
    },
    {
      id: 'a-3', severity: 'medium', product: 'gn', type: 'Evento climático', date: '2026-10-10',
      title: 'Probabilidad de El Niño 62 % para el próximo trimestre',
      action: { label: 'Ver monitor', target: '/app/exogenas' },
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
