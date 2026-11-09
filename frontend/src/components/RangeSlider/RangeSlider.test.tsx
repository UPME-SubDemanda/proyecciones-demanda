import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { clampRange, RangeSlider } from './RangeSlider';

describe('RangeSlider', () => {
  it('dos manijas con sus valores visibles', () => {
    const html = renderToStaticMarkup(<RangeSlider label="Rango" min={2010} max={2040} value={[2015, 2035]} onChange={() => {}} />);
    expect(html.match(/type="range"/g)).toHaveLength(2);
    expect(html).toContain('2015');
    expect(html).toContain('2035');
  });
  it('desde nunca supera a hasta', () => {
    expect(clampRange([2036, 2035], 'from')).toEqual([2035, 2035]);
    expect(clampRange([2020, 2018], 'to')).toEqual([2020, 2020]);
    expect(clampRange([2015, 2035], 'from')).toEqual([2015, 2035]);
  });
});
