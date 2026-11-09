import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { ProductIcon } from './ProductIcon';

describe('ProductIcon', () => {
  it('círculo con el relleno del producto y nombre accesible', () => {
    const html = renderToStaticMarkup(<ProductIcon product="ee" />);
    expect(html).toContain('bg-ee-fill');
    expect(html).toContain('aria-label="Energía eléctrica"');
  });
  it('decorativo no se anuncia', () =>
    expect(renderToStaticMarkup(<ProductIcon product="gn" decorative />)).toContain('aria-hidden="true"'));
});
