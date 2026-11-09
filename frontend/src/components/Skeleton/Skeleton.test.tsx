import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { Skeleton } from './Skeleton';

describe('Skeleton (UX-06)', () => {
  it('esqueleto accesible, sin spinner', () => {
    const html = renderToStaticMarkup(<Skeleton label="Cargando gráfico" />);
    expect(html).toContain('role="status"');
    expect(html).toContain('Cargando gráfico…');
  });
});
