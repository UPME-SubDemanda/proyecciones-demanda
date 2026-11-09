import { describe, expect, it } from 'vitest';
import type { LineSeriesOption } from 'echarts';
import { dash, roles } from '../../estandares/echarts-theme.js';
import { demoObserved, demoRevisions, demoRevisionValues } from '../../demo/fixtures';
import { errorText, historyChartOption, historyTitle, OTHERS, SELECTED } from './historyChart';

const revisions = demoRevisions('ee').map((r) => ({
  code: r.code, label: r.code, points: demoRevisionValues(r.id).scenarios.mid, current: r.isCurrent,
}));
const base = { product: 'ee' as const, observed: demoObserved('ee').points, revisions, selectedColor: 'azul', unit: 'TWh/año', divisor: 1000 };

describe('gráfico del histórico (GRA-01, GRA-06)', () => {
  it('sin selección: real, vigente discontinua y las demás finas', () => {
    const s = historyChartOption(base).series as LineSeriesOption[];
    expect(s.filter((x) => x.name === OTHERS)).toHaveLength(5);
    expect(s.find((x) => String(x.name).startsWith('Vigente'))?.lineStyle?.type).toEqual(dash.projection);
    expect(s.find((x) => x.name === OTHERS)?.lineStyle?.color).toBe(roles.light.revisionPast);
  });
  it('la seleccionada se resalta con su color y rótulo', () => {
    const s = historyChartOption({ ...base, selected: '2023-07' }).series as LineSeriesOption[];
    const sel = s.find((x) => x.name === SELECTED)!;
    expect(sel.lineStyle?.color).toBe('azul');
    expect(sel.endLabel?.formatter).toBe('2023-07 (seleccionada)');
    expect(s.filter((x) => x.name === OTHERS)).toHaveLength(4);
  });
  it('seleccionar la vigente no la duplica', () =>
    expect((historyChartOption({ ...base, selected: '2026-07' }).series as LineSeriesOption[]).some((x) => x.name === SELECTED)).toBe(false));
});

describe('error y título (GRA-02, GRA-05)', () => {
  it('error con signo y sentido', () => {
    expect(errorText(84.7, 83.2)).toBe('Error +1,8 % (sobreestimó)');
    expect(errorText(82, 83.2)).toMatch(/subestimó/);
  });
  it('título con hallazgo', () =>
    expect(historyTitle([
      { year: '2023', error12: 1.8 }, { year: '2024', error12: 1.0 }, { year: '2025', error12: 0.8 },
      { year: '2025', error12: 1.2 }, { year: '2026', error12: -0.9 }, { year: '2026', error12: null },
    ])).toBe('Las revisiones de 2023–2025 sobreestimaron; las recientes se acercan al dato real'));
  it('sin datos suficientes, título neutro', () => expect(historyTitle([{ year: '2026', error12: null }])).toBe('Revisiones publicadas frente al dato real'));
});
