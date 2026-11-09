import { describe, expect, it } from 'vitest';
import { demoObserved, demoRevisions, demoRevisionValues } from '../../demo/fixtures';
import { change, growthRange, growthTitle, valueAt } from './portalData';

const observed = demoObserved('ee').points;
const values = demoRevisionValues(demoRevisions('ee').at(-1)!.id);

describe('cálculos del portal', () => {
  it('variación porcentual', () => expect(change(100, 103)).toBeCloseTo(3));
  it('valor de un periodo', () => expect(valueAt(observed, '2025')).toBe(observed.at(-1)!.value));
  it('rango de crecimiento al final del horizonte, bajo < alto', () => {
    const r = growthRange(observed, values);
    expect(r.horizon).toBe('2040');
    expect(r.low).toBeLessThan(r.high);
  });
  it('título con hallazgo y cifras (GRA-02)', () =>
    expect(growthTitle('ee', observed, values)).toMatch(/^La demanda de energía eléctrica crecería entre \d+ % y \d+ % a 2040$/));
});
