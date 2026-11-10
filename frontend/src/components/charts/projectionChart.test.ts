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
  it('modo compacto reduce el margen derecho', () => {
    const grid = projectionChartOption({ ...input, compact: true }).grid as { right: number };
    expect(grid.right).toBeLessThan(120);
  });
  it('sin bajo o alto no hay banda: el que quede va como línea punteada fina', () => {
    const s = projectionChartOption({ ...input, scenarios: ['mid', 'high'] }).series as LineSeriesOption[];
    expect(s.find((x) => x.name === 'Escenarios bajo–alto')).toBeUndefined();
    expect(s.find((x) => x.name === 'Alto')?.lineStyle?.type).toEqual(dash.scenario);
  });
  it('sin el medio no se dibuja la proyección', () => {
    const s = projectionChartOption({ ...input, scenarios: ['low', 'high'] }).series as LineSeriesOption[];
    expect(s.find((x) => x.name === 'Vigente jul-2026')).toBeUndefined();
  });
  it('el rango de años recorta el eje', () => {
    const x = projectionChartOption({ ...input, range: [2015, 2035] }).xAxis as { data: string[] };
    expect(x.data[0]).toBe('2015');
    expect(x.data.at(-1)).toBe('2035');
  });
  it('punto del año corrido con su rótulo', () => {
    const s = projectionChartOption({ ...input, ytdPoint: { period: '2026', value: 84100, label: '2026 año corrido: 84,1 (−1,8 %)' } }).series as LineSeriesOption[];
    const real = s.find((x) => x.name === 'Real')!;
    expect(real.markPoint?.data).toEqual([{ name: 'Año corrido', coord: ['2026', 84.1] }]);
  });
  it('fuera del modo pantalla no pisa las etiquetas del eje del tema', () => {
    const x = projectionChartOption(input).xAxis as Record<string, unknown>;
    expect('axisLabel' in x).toBe(false);
  });
  it('línea de corte de datos', () =>
    expect(byName('Real').markLine?.data).toEqual([{ xAxis: '2025', label: { formatter: 'Corte sep-2026', position: 'end' } }]));
  it('línea de publicación de la revisión, si cae en el rango visible (issue #40)', () => {
    const series = projectionChartOption({ ...input, publication: { period: '2026', label: 'Publicado' } }).series as LineSeriesOption[];
    const lines = series.find((s) => s.name === 'Real')!.markLine!.data as { xAxis: string }[];
    expect(lines.map((l) => l.xAxis)).toEqual(['2025', '2026']);
    const outside = projectionChartOption({ ...input, publication: { period: '1990', label: 'x' } }).series as LineSeriesOption[];
    expect((outside.find((s) => s.name === 'Real')!.markLine!.data as unknown[]).length).toBe(1);
  });
  it('en mensual rotula los meses y la tabla dice «Mes» (issue #40)', () => {
    const monthlyInput = {
      ...input,
      observed: [{ period: '2026-03', value: 7000 }],
      projection: { ...input.projection, scenarios: { low: [{ period: '2026-04', value: 6900 }], mid: [{ period: '2026-04', value: 7100 }], high: [{ period: '2026-04', value: 7300 }] } },
      cutoff: undefined,
    };
    const x = projectionChartOption(monthlyInput).xAxis as { axisLabel: { formatter: (v: string) => string } };
    expect(x.axisLabel.formatter('2026-04')).toBe('abr-2026');
    const table = projectionTable(monthlyInput);
    expect(table.headers[0]).toBe('Mes');
    expect(table.rows.map((r) => r[0])).toEqual(['mar-2026', 'abr-2026']);
  });
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
