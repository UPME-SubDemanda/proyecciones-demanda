/**
 * Descargas de datos (UX-07, GRA-08): nombre `{contexto}_{version}_{contenido}.{ext}` y encabezado
 * con fuente, versión, fecha de corte y licencia de uso.
 */

export type DownloadMeta = {
  context: string; // p. ej. «ee»
  version: string; // p. ej. «rev-2026-07»
  content: string; // p. ej. «real-vs-proyeccion»
  source: string;
  cutoff?: string;
  license?: string;
  illustrative?: boolean;
};

// El texto de la licencia lo define jurídica junto con lo que se publica (X-04).
const DEFAULT_LICENSE = 'Por definir (pendiente X-04)';

function slug(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function fileName(meta: DownloadMeta, ext: string): string {
  return `${slug(meta.context)}_${slug(meta.version)}_${slug(meta.content)}.${ext}`;
}

function cell(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return '';
  const text = String(value);
  return /[";\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

/**
 * CSV con separador «;» (Excel en español abre bien así) y valores sin formato de miles,
 * para que se puedan recalcular. Las líneas de encabezado empiezan con «#».
 */
export function toCsv(meta: DownloadMeta, headers: string[], rows: (string | number | null)[][]): string {
  const header = [
    `# Fuente: ${meta.source}`,
    `# Versión: ${meta.version}`,
    meta.cutoff ? `# Datos a: ${meta.cutoff}` : null,
    `# Licencia: ${meta.license ?? DEFAULT_LICENSE}`,
    meta.illustrative ? '# Cifras ilustrativas: no son datos oficiales' : null,
  ].filter(Boolean);
  const body = [headers, ...rows].map((r) => r.map(cell).join(';'));
  return [...header, ...body].join('\n') + '\n';
}

/** Descarga un archivo en el navegador. */
export function downloadFile(name: string, content: string | Blob, type = 'text/csv;charset=utf-8'): void {
  const blob = typeof content === 'string' ? new Blob(['\uFEFF', content], { type }) : content;
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}
