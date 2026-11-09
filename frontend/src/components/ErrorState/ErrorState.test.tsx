import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { ErrorState } from './ErrorState';

describe('ErrorState (UX-06)', () => {
  it('se anuncia y pliega el detalle técnico', () => {
    const html = renderToStaticMarkup(<ErrorState title="No se pudo cargar" description="Reintente." detail="HTTP 500" />);
    expect(html).toContain('role="alert"');
    expect(html).toContain('<details');
    expect(html).toContain('HTTP 500');
  });
});
