import { describe, expect, it } from 'vitest';
import {
  demoExogenous, demoExogenousMonitor, demoObserved, demoRevisionPerformance, demoRevisions, demoRevisionValues, demoSystemToday,
} from './fixtures';

describe('cifras ilustrativas (CON-07)', () => {

  it('son deterministas', () => expect(demoObserved('ee')).toEqual(demoObserved('ee')));

  it('el dato real llega hasta 2025 con magnitudes del mockup', () => {
    const ee = demoObserved('ee').points;
    expect(ee.at(-1)?.period).toBe('2025');
    expect(ee.at(-1)!.value).toBeGreaterThan(75_000);
    expect(ee.at(-1)!.value).toBeLessThan(95_000);
  });

  it('una sola revisión vigente, la última', () => {
    const revs = demoRevisions('gn');
    expect(revs.filter((r) => r.isCurrent)).toHaveLength(1);
    expect(revs.at(-1)?.isCurrent).toBe(true);
  });

  it('escenarios ordenados bajo ≤ medio ≤ alto', () => {
    const { scenarios } = demoRevisionValues(demoRevisions('ee').at(-1)!.id);
    scenarios.mid.forEach((p, i) => {
      expect(scenarios.low[i].value).toBeLessThanOrEqual(p.value);
      expect(scenarios.high[i].value).toBeGreaterThanOrEqual(p.value);
    });
  });

  it('los valores de una revisión de gas están en GBTUD', () =>
    expect(demoRevisionValues(demoRevisions('gn')[0].id).unit).toBe('GBTUD'));

  it('desviación de 12 meses hasta la fecha de corte; energía eléctrica fuera de umbral como el mockup', () => {
    const perf = demoRevisionPerformance(demoRevisions('ee').at(-1)!.id);
    expect(perf.monthlyDeviation).toHaveLength(12);
    expect(perf.monthlyDeviation.at(-1)?.period).toBe('2026-09');
    expect(Math.abs(perf.yearToDate)).toBeGreaterThan(perf.threshold);
  });

  it('demanda diaria: 30 días y el año anterior por debajo, alineado por día de la semana', () => {
    const t = demoSystemToday();
    expect(t.energyDaily).toHaveLength(30);
    t.energyDaily.forEach((p, i) => expect(t.energyPrevYear[i].value).toBeLessThan(p.value));
    expect(t.lastDay).toBe('2026-09-30');
  });

  it('variables exógenas con fuente y unidad', () =>
    demoExogenous().forEach((v) => expect(v.source && v.unit).toBeTruthy()));

  it('monitor de exógenas: correlación móvil dentro de su intervalo y entre −1 y 1; importancia suma 100 %', () => {
    for (const product of ['ee', 'gn'] as const) {
      const m = demoExogenousMonitor(product);
      expect(m.revisionCode).toBe('2026-07');
      m.variables.forEach((v) => {
        expect(v.rolling).toHaveLength(69);
        v.rolling.forEach((p) => {
          expect(p.low).toBeLessThanOrEqual(p.value);
          expect(p.high).toBeGreaterThanOrEqual(p.value);
          expect(p.low).toBeGreaterThanOrEqual(-1);
          expect(p.high).toBeLessThanOrEqual(1);
        });
        expect(v.trend.observed.at(-1)!.value).toBe(v.observed);
        expect(Object.is(v.impact.mid, -0)).toBe(false);
      });
      expect(m.importance!.reduce((s, i) => s + i.share, 0)).toBe(100);
    }
  });
});
