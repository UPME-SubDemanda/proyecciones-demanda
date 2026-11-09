/**
 * Formatos de números, fechas y procedencia en español de Colombia (CON-04, CON-05, CON-06).
 * Toda cifra que se muestre en la interfaz pasa por aquí.
 */

/** Espacio que no se parte entre la cifra y su unidad («78.452 GWh», «3,2 %»). */
export const NBSP = '\u00A0';
/** Signo menos tipográfico (CON-04). */
export const MINUS = '\u2212';

const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

type NumberOptions = { decimals?: number; signed?: boolean };

/** Número con punto de miles y coma decimal: 85600 → «85.600»; −1.8 → «−1,8». */
export function formatNumber(value: number, { decimals = 0, signed = false }: NumberOptions = {}): string {
  const text = new Intl.NumberFormat('es-CO', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
    signDisplay: signed ? 'exceptZero' : 'auto',
  }).format(value);
  return text.replace('-', MINUS);
}

/** Cifra con unidad: (85600, 'GWh') → «85.600 GWh». */
export function formatValue(value: number, unit: string, options?: NumberOptions): string {
  return `${formatNumber(value, options)}${NBSP}${unit}`;
}

/** Porcentaje con espacio antes del signo: (−1.8) → «−1,8 %»; signed → «+2,9 %». */
export function formatPercent(value: number, { decimals = 1, signed = false }: NumberOptions = {}): string {
  return formatValue(value, '%', { decimals, signed });
}

function parts(iso: string) {
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m) throw new Error(`Fecha no válida: ${iso}`);
  return { y, m, d };
}

const MONTH_NAMES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

/** Nombre completo del mes: «2026-09-30» → «septiembre». */
export function monthName(iso: string): string {
  return MONTH_NAMES[Number(iso.split('-')[1]) - 1];
}

/** Fecha en texto: «2026-10-15» → «15 oct 2026» (CON-05). */
export function formatDate(iso: string): string {
  const { y, m, d } = parts(iso);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

/** Mes y año: «2026-07» o «2026-07-01» → «jul-2026». */
export function formatMonth(iso: string): string {
  const { y, m } = parts(iso);
  return `${MONTHS[m - 1]}-${y}`;
}

/** Nombre de una revisión publicada: «2026-07» → «Revisión jul-2026» (CON-05, UPME-VOC-01). */
export function revisionLabel(iso: string): string {
  return `Revisión ${formatMonth(iso)}`;
}

export type Provenance = { version?: string; method?: string; cutoff?: string; source?: string };

/** Procedencia: «Revisión jul-2026 · EE-LP v3.2.0 · datos a sep-2026 · Fuente: XM» (PRI-02, CON-06). */
export function formatProvenance({ version, method, cutoff, source }: Provenance): string {
  const text = [version, method, cutoff && `datos a ${formatMonth(cutoff)}`, source && `Fuente: ${source}`]
    .filter(Boolean)
    .join(' · ');
  return text.charAt(0).toUpperCase() + text.slice(1);
}
