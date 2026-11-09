import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { VersionSelect } from './VersionSelect';

describe('VersionSelect', () => {
  const html = renderToStaticMarkup(
    <VersionSelect
      label="Proyección"
      value="2026-07"
      onChange={() => {}}
      options={[{ value: '2026-01', label: 'Revisión ene-2026' }, { value: '2026-07', label: 'Revisión jul-2026', current: true }]}
    />,
  );
  it('select nativo con etiqueta asociada (CMP-03)', () => {
    const id = html.match(/<label for="([^"]+)"/)?.[1];
    expect(id).toBeTruthy();
    expect(html).toContain(`<select id="${id}"`);
  });
  it('marca la vigente', () => expect(html).toContain('Revisión jul-2026 (vigente)'));
});
