import { useMemo, useState, type ReactNode } from 'react';
import { cn } from '../../lib/cn';

export type Column<T> = {
  key: string;
  header: string;
  /** Contenido de la celda. */
  render: (row: T) => ReactNode;
  /** Valor para ordenar; si falta, la columna no se ordena. */
  sortValue?: (row: T) => string | number | null;
  /** Cifras a la derecha y tabulares (CON-04). */
  numeric?: boolean;
  /** La columna nombra la fila (`<th scope="row">`). */
  rowHeader?: boolean;
  className?: string;
};

type Props<T> = {
  caption: string; // nombre accesible de la tabla
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  /** Fila destacada con `primary-soft` (la vigente). */
  highlight?: (row: T) => boolean;
  /** Fila elegida (p. ej. la que se resalta en el gráfico). */
  selected?: (row: T) => boolean;
  onSelect?: (row: T) => void;
  pageSize?: number;
  empty?: ReactNode;
  className?: string;
};

type Sort = { key: string; dir: 'asc' | 'desc' } | null;

export const PAGE_SIZE = 25;

/** Ordena filas por una columna; los vacíos van al final. */
export function sortRows<T>(rows: T[], column: Column<T> | undefined, dir: 'asc' | 'desc'): T[] {
  if (!column?.sortValue) return rows;
  const value = column.sortValue;
  return [...rows].sort((a, b) => {
    const va = value(a);
    const vb = value(b);
    if (va === null && vb === null) return 0;
    if (va === null) return 1;
    if (vb === null) return -1;
    const cmp = typeof va === 'number' && typeof vb === 'number' ? va - vb : String(va).localeCompare(String(vb), 'es');
    return dir === 'asc' ? cmp : -cmp;
  });
}

/**
 * Tabla de datos (CMP: DataTable): encabezado `surface-sunken`, cifras a la derecha tabulares, fila vigente
 * `primary-soft`, orden por columna (`aria-sort`) y paginación de 25.
 */
export function DataTable<T>({
  caption, columns, rows, rowKey, highlight, selected, onSelect, pageSize = PAGE_SIZE, empty, className,
}: Props<T>) {
  const [sort, setSort] = useState<Sort>(null);
  const [page, setPage] = useState(0);
  const sorted = useMemo(
    () => (sort ? sortRows(rows, columns.find((c) => c.key === sort.key), sort.dir) : rows),
    [rows, columns, sort],
  );
  const pages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const current = Math.min(page, pages - 1);
  const visible = sorted.slice(current * pageSize, (current + 1) * pageSize);

  const toggleSort = (key: string) =>
    setSort((s) => (s?.key !== key ? { key, dir: 'asc' } : s.dir === 'asc' ? { key, dir: 'desc' } : null));

  return (
    <div className={cn('flex flex-col', className)}>
      <div className="overflow-x-auto">
        <table className="w-full text-body">
          <caption className="sr-only">{caption}</caption>
          <thead className="bg-surface-sunken">
            <tr>
              {columns.map((c) => {
                const ariaSort = sort?.key === c.key ? (sort.dir === 'asc' ? 'ascending' : 'descending') : undefined;
                return (
                  <th
                    key={c.key}
                    scope="col"
                    aria-sort={ariaSort}
                    className={cn('px-4 py-3 text-label text-ink-muted whitespace-nowrap', c.numeric ? 'text-right' : 'text-left', c.className)}
                  >
                    {c.sortValue ? (
                      <button type="button" onClick={() => toggleSort(c.key)} className="inline-flex items-center gap-1 hover:text-ink">
                        {c.header}
                        <span aria-hidden="true">{sort?.key === c.key ? (sort.dir === 'asc' ? '↑' : '↓') : ''}</span>
                      </button>
                    ) : (
                      c.header
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-6 text-ink-muted">{empty ?? 'Sin resultados.'}</td>
              </tr>
            ) : (
              visible.map((row) => {
                const isSelected = selected?.(row);
                return (
                  <tr
                    key={rowKey(row)}
                    aria-selected={onSelect ? !!isSelected : undefined}
                    className={cn(
                      'border-t border-line',
                      highlight?.(row) && 'bg-primary-soft',
                      isSelected && 'outline outline-2 -outline-offset-2 outline-primary',
                      onSelect && 'cursor-pointer hover:bg-surface-sunken',
                    )}
                    onClick={onSelect ? () => onSelect(row) : undefined}
                  >
                    {columns.map((c) => {
                      const Cell = c.rowHeader ? 'th' : 'td';
                      return (
                        <Cell
                          key={c.key}
                          scope={c.rowHeader ? 'row' : undefined}
                          className={cn('px-4 py-3 whitespace-nowrap', c.numeric ? 'text-right tabular' : 'text-left', c.rowHeader && 'font-bold', c.className)}
                        >
                          {c.render(row)}
                        </Cell>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      {pages > 1 && (
        <nav aria-label="Páginas de la tabla" className="flex items-center justify-end gap-3 px-4 py-3 border-t border-line text-small">
          <button type="button" disabled={current === 0} onClick={() => setPage(current - 1)} className="h-8 px-3 rounded-md border border-line-strong disabled:opacity-50">
            Anterior
          </button>
          <span className="tabular">Página {current + 1} de {pages}</span>
          <button type="button" disabled={current >= pages - 1} onClick={() => setPage(current + 1)} className="h-8 px-3 rounded-md border border-line-strong disabled:opacity-50">
            Siguiente
          </button>
        </nav>
      )}
    </div>
  );
}
