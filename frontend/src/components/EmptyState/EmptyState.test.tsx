import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { EmptyState } from './EmptyState';

describe('EmptyState (UX-06)', () => {
  it('dice por qué y qué hacer', () => {
    const html = renderToStaticMarkup(<EmptyState title="Sin revisiones" description="Aún no se ha cargado ninguna." />);
    expect(html).toContain('Sin revisiones');
    expect(html).toContain('Aún no se ha cargado ninguna.');
  });
});
