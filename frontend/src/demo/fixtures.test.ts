import { describe, expect, it } from 'vitest';
import { demoExogenous, demoObserved, demoRevisions, demoRevisionValues } from './fixtures';
import { ILLUSTRATIVE } from '../data/source';

describe('cifras ilustrativas (CON-07)', () => {
  it('se declaran como ilustrativas mientras no haya datos reales', () => expect(ILLUSTRATIVE).toBe(true));

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

  it('variables exógenas con fuente y unidad', () =>
    demoExogenous().forEach((v) => expect(v.source && v.unit).toBeTruthy()));
});
