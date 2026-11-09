import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { SegmentedControl } from './SegmentedControl';

const options = [
  { value: 'ee', label: 'Energía eléctrica' },
  { value: 'gn', label: 'Gas natural' },
] as const;

describe('SegmentedControl', () => {
  const html = renderToStaticMarkup(
    <SegmentedControl options={[...options]} value="gn" onChange={() => {}} ariaLabel="Producto" />,
  );
  it('grupo con nombre accesible', () => expect(html).toContain('role="group" aria-label="Producto"'));
  it('botones nativos con aria-pressed (A11-03)', () => {
    expect(html.match(/<button type="button"/g)).toHaveLength(2);
    expect(html).toContain('aria-pressed="true"');
    expect(html).toContain('aria-pressed="false"');
  });
  it('marca la opción elegida', () =>
    expect(html.indexOf('aria-pressed="true"')).toBeGreaterThan(html.indexOf('Energía eléctrica')));
});
