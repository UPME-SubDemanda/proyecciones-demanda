import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { DataTable, sortRows, type Column } from './DataTable';

type Row = { code: string; mape: number | null; current: boolean };
const rows: Row[] = [
  { code: 'jul-2026', mape: null, current: true },
  { code: 'ene-2026', mape: 1.4, current: false },
  { code: 'jul-2023', mape: 2.3, current: false },
];
const columns: Column<Row>[] = [
  { key: 'code', header: 'Revisión', render: (r) => r.code, sortValue: (r) => r.code, rowHeader: true },
  { key: 'mape', header: 'MAPE', render: (r) => r.mape ?? '—', sortValue: (r) => r.mape, numeric: true },
];

describe('DataTable (CMP)', () => {
  const html = renderToStaticMarkup(
    <DataTable caption="Revisiones" columns={columns} rows={rows} rowKey={(r) => r.code} highlight={(r) => r.current} />,
  );
  it('encabezado surface-sunken y nombre accesible', () => {
    expect(html).toContain('<caption class="sr-only">Revisiones</caption>');
    expect(html).toContain('bg-surface-sunken');
  });
  it('fila vigente en primary-soft', () => expect(html).toMatch(/<tr[^>]*bg-primary-soft[^>]*><th scope="row"[^>]*>jul-2026/));
  it('cifras a la derecha y tabulares (CON-04)', () => expect(html).toContain('text-right tabular'));
  it('columnas ordenables con botón', () => expect(html.match(/<th scope="col"[^>]*><button/g)).toHaveLength(2));
  it('pagina de a 25: con pocas filas no hay paginación', () => expect(html).not.toContain('Páginas de la tabla'));
  it('paginación cuando hay más filas que el tamaño de página', () => {
    const many = Array.from({ length: 30 }, (_, i) => ({ code: `r${i}`, mape: i, current: false }));
    expect(renderToStaticMarkup(<DataTable caption="x" columns={columns} rows={many} rowKey={(r) => r.code} />)).toContain('Página 1 de 2');
  });
  it('orden con vacíos al final', () => {
    expect(sortRows(rows, columns[1], 'asc').map((r) => r.code)).toEqual(['ene-2026', 'jul-2023', 'jul-2026']);
    expect(sortRows(rows, columns[1], 'desc').map((r) => r.code)).toEqual(['jul-2023', 'ene-2026', 'jul-2026']);
  });
});
