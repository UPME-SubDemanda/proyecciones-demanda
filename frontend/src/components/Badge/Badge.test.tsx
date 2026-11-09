import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { Badge, IllustrativeBadge } from './Badge';

describe('Badge', () => {
  it('estado con texto y tokens de estado', () => {
    const html = renderToStaticMarkup(<Badge tone="success">Publicada</Badge>);
    expect(html).toContain('bg-success-soft text-success');
    expect(html).toContain('Publicada');
  });
  it('producto con relleno y texto on-brand', () =>
    expect(renderToStaticMarkup(<Badge tone="gn">GN</Badge>)).toContain('bg-gn-fill text-on-brand'));
  it('marca de cifras ilustrativas (CON-07)', () =>
    expect(renderToStaticMarkup(<IllustrativeBadge />)).toContain('Cifras ilustrativas'));
});
