import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { Sparkline } from './Sparkline';

const points = (values: number[]) => values.map((value, i) => ({ period: String(2021 + i), value }));

describe('Sparkline', () => {
  it('es una imagen con nombre accesible y el ancho pedido (A11-04)', () => {
    const html = renderToStaticMarkup(
      <Sparkline observed={points([3, 2.5, 1.8])} reference={points([3, 3, 3])} ariaLabel="PIB: observado de 3,0 % a 1,8 %" width={96} />,
    );
    expect(html).toContain('role="img"');
    expect(html).toContain('aria-label="PIB: observado de 3,0 % a 1,8 %"');
    expect(html).toContain('width:96px');
  });
});
