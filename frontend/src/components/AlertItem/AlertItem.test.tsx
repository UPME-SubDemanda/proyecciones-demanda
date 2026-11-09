import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { AlertItem } from './AlertItem';

describe('AlertItem (PRI-04)', () => {
  const html = renderToStaticMarkup(
    <AlertItem severity="high" product="ee" title="PIB observado 1,8 % vs. supuesto 3,0 %" meta="Exógena vs. supuesto · 14 oct 2026" action={<a href="/x">Ver variable</a>} />,
  );
  it('barra de severidad y severidad en texto (A11-05)', () => {
    expect(html).toContain('bg-critical');
    expect(html).toContain('Severidad alta');
  });
  it('título con cifra, producto, contexto y acción', () => {
    expect(html).toContain('PIB observado 1,8 %');
    expect(html).toContain('bg-ee-fill');
    expect(html).toContain('14 oct 2026');
    expect(html).toContain('Ver variable');
  });
  it('severidad media en warning', () =>
    expect(renderToStaticMarkup(<AlertItem severity="medium" product="gn" title="x" meta="y" />)).toContain('bg-warning'));
});
