/**
 * CIFRAS ILUSTRATIVAS (CON-07). No son datos oficiales: sirven para construir las vistas
 * mientras se reúnen los datos reales (T-15). Se generan con fórmulas simples y deterministas,
 * con órdenes de magnitud parecidos a los de los mockups aprobados.
 * Este módulo se elimina en T-18, cuando las vistas lean la API.
 */
import type { ProductKey } from '../lib/product';
import type {
  Accuracy, ExogenousVariable, ObservedSeries, Point, Revision, RevisionPerformance, RevisionValues, Scenario,
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
const REVISION_CODES = ['2025-01', '2025-07', '2026-01', '2026-07'];
const MODEL: Record<ProductKey, string[]> = {
  ee: ['EE-LP v3.0.0', 'EE-LP v3.1.0', 'EE-LP v3.1.1', 'EE-LP v3.2.0'],
  gn: ['GN-MP v1.4.0', 'GN-MP v2.0.0', 'GN-MP v2.0.0', 'GN-MP v2.0.1'],
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
  // Cada revisión arranca del último dato real y es un poco más optimista que la siguiente.
  const anchor = observedValue(product, LAST_OBSERVED_YEAR);
  const optimism = (REVISION_CODES.length - 1 - index) * 0.002;
  const scenarios = {} as Record<Scenario, Point[]>;
  for (const scenario of Object.keys(SPREAD) as Scenario[]) {
    const points: Point[] = [];
    for (let year = LAST_OBSERVED_YEAR; year <= HORIZON; year++) {
      const rate = growth + optimism + SPREAD[scenario];
      points.push({ period: String(year), value: round(anchor * (1 + rate) ** (year - LAST_OBSERVED_YEAR)) });
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
    mape12: product === 'ee' ? 2.1 : 1.4,
  };
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
