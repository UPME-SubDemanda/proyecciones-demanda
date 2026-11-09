import { describe, expect, it } from 'vitest';
import { fileName, toCsv, type DownloadMeta } from './download';

const meta: DownloadMeta = {
  context: 'ee', version: 'Revisión jul-2026', content: 'Real vs. proyección', source: 'XM, UPME',
  cutoff: '2026-09', illustrative: true,
};

describe('descargas (UX-07)', () => {
  it('nombre {contexto}_{version}_{contenido}', () =>
    expect(fileName(meta, 'csv')).toBe('ee_revision-jul-2026_real-vs-proyeccion.csv'));

  it('CSV con encabezado de procedencia y licencia', () => {
    const csv = toCsv(meta, ['año', 'real'], [[2025, 83.1], [2026, null]]);
    expect(csv.split('\n')).toEqual([
      '# Fuente: XM, UPME',
      '# Versión: Revisión jul-2026',
      '# Datos a: 2026-09',
      '# Licencia: Por definir (pendiente X-04)',
      '# Cifras ilustrativas: no son datos oficiales',
      'año;real',
      '2025;83.1',
      '2026;',
      '',
    ]);
  });

  it('escapa separadores y comillas', () =>
    expect(toCsv({ ...meta, illustrative: false }, ['nota'], [['a;b "c"']])).toContain('"a;b ""c"""'));
});
