import { describe, expect, it } from 'vitest';
import type { LineSeriesOption } from 'echarts';
import { dash, roles } from '../../estandares/echarts-theme.js';
import { demoObserved, demoRevisions, demoRevisionValues } from '../../demo/fixtures';
import { projectionChartOption, projectionTable, type ProjectionChartInput } from './projectionChart';

const current = demoRevisions('ee').at(-1)!;
const input: ProjectionChartInput = {
  product: 'ee',
  observed: demoObserved('ee').points,
  projection: demoRevisionValues(current.id),
  projectionLabel: 'Vigente jul-2026',
  unit: 'TWh/año',
  divisor: 1000,
  cutoff: { period: '2025', label: 'Corte sep-2026' },
};
const series = projectionChartOption(input).series as LineSeriesOption[];
const byName = (name: string) => series.find((s) => s.name === name)!;

describe('gráfico real vs. proyección (GRA-01)', () => {
  it('real: línea sólida con el color de dato observado', () => {
    const real = byName('Real');
    expect(real.lineStyle?.type).toBeUndefined();
    expect(real.lineStyle?.color).toBe(roles.light.real);
  });
  it('proyección: discontinua con el color de línea del producto', () => {
    const projection = byName('Vigente jul-2026');
    expect(projection.lineStyle?.type).toEqual(dash.projection);
    expect(projection.lineStyle?.color).toBe(roles.light.products.ee.line);
  });
  it('escenarios: banda translúcida sin borde', () => {
    const band = byName('Escenarios bajo–alto');
    expect(band.stack).toBe('band');
    expect(band.lineStyle?.opacity).toBe(0);
    expect(band.areaStyle?.color).toBe(roles.light.products.ee.band);
  });
  it('etiqueta al final de la proyección (GRA-04) y unidad en el eje (GRA-07)', () => {
    expect(byName('Vigente jul-2026').endLabel?.show).toBe(true);
    expect((projectionChartOption(input).yAxis as { name: string }).name).toBe('TWh/año');
  });
  it('línea de corte de datos', () => expect(byName('Real').markLine?.data).toEqual([{ xAxis: '2025' }]));
  it('tema oscuro usa los roles oscuros', () => {
    const dark = projectionChartOption({ ...input, dark: true }).series as LineSeriesOption[];
    expect(dark.find((s) => s.name === 'Real')!.lineStyle?.color).toBe(roles.dark.real);
  });
});

describe('tabla equivalente (GRA-08)', () => {
  const table = projectionTable(input);
  it('columnas con unidad', () => expect(table.headers).toEqual(['Año', 'Real (TWh/año)', 'Bajo (TWh/año)', 'Medio (TWh/año)', 'Alto (TWh/año)']));
  it('un año con real y proyección comparte fila', () => {
    const row2025 = table.rows.find((r) => r[0] === '2025')!;
    expect(row2025[1]).not.toBeNull();
    expect(row2025[3]).not.toBeNull();
  });
});
