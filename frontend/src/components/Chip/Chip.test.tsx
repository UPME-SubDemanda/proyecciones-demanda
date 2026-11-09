import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { Chip } from './Chip';

describe('Chip', () => {
  it('activo con brand-soft, borde brand y aria-pressed (A11-03)', () => {
    const html = renderToStaticMarkup(<Chip active onToggle={() => {}}>Medio</Chip>);
    expect(html).toContain('aria-pressed="true"');
    expect(html).toContain('bg-brand-soft border-brand');
  });
  it('inactivo y táctil de 44 px', () => {
    const html = renderToStaticMarkup(<Chip active={false} size="touch" onToggle={() => {}}>Alto</Chip>);
    expect(html).toContain('aria-pressed="false"');
    expect(html).toContain('h-11');
  });
});
