/**
 * Lógica de rotación del modo pantalla, sin React, para probarla con tiempos simulados.
 * TV-02: rotación cada N s. TV-03: navegación manual y arrastre de 80 px.
 * TV-04: cualquier interacción pausa 30 s; a los 5 min sin interacción, los filtros vuelven a sus valores.
 */

export const INTERVALS = [10, 20, 30, 60] as const; // segundos (TV-02)
export const DEFAULT_INTERVAL = 20;
export const INTERACTION_PAUSE_MS = 30_000;
export const IDLE_RESET_MS = 5 * 60_000;
export const SWIPE_THRESHOLD_PX = 80;

export type RotationState = {
  index: number;
  /** Inicio del tablero actual (o de la reanudación tras una pausa). */
  startedAt: number;
  /** Pausa por interacción hasta este instante (TV-04). */
  pauseUntil: number;
  /** Pausa con el botón: no se reanuda sola. */
  userPaused: boolean;
  lastInteraction: number;
  /** Cambia cada vez que hay que volver los filtros a sus valores por defecto. */
  resetKey: number;
  /** Ya se hizo el reinicio de este periodo sin interacción. */
  idleResetDone: boolean;
};

export function initialRotation(now: number): RotationState {
  return { index: 0, startedAt: now, pauseUntil: 0, userPaused: false, lastInteraction: now, resetKey: 0, idleResetDone: true };
}

export function wrap(index: number, count: number): number {
  return ((index % count) + count) % count;
}

/** Avanza el reloj: cambia de tablero si se cumplió el intervalo y reinicia filtros tras 5 min sin interacción. */
export function tick(s: RotationState, now: number, count: number, intervalMs: number): RotationState {
  let next = s;
  if (!s.idleResetDone && now - s.lastInteraction >= IDLE_RESET_MS) {
    next = { ...next, resetKey: s.resetKey + 1, idleResetDone: true };
  }
  if (next.userPaused || now < next.pauseUntil || count < 2) return next;
  const from = Math.max(next.startedAt, next.pauseUntil);
  if (now - from >= intervalMs) {
    return { ...next, index: wrap(next.index + 1, count), startedAt: now, pauseUntil: 0 };
  }
  return next;
}

/** Cualquier toque, clic o arrastre: pausa 30 s (TV-04). */
export function interact(s: RotationState, now: number): RotationState {
  return { ...s, pauseUntil: now + INTERACTION_PAUSE_MS, lastInteraction: now, idleResetDone: false };
}

export function goTo(s: RotationState, index: number, now: number, count: number): RotationState {
  return { ...interact(s, now), index: wrap(index, count), startedAt: now };
}

export function togglePause(s: RotationState, now: number): RotationState {
  return s.userPaused ? { ...s, userPaused: false, startedAt: now, pauseUntil: 0 } : { ...interact(s, now), userPaused: true };
}

/** Fracción del intervalo ya transcurrida, para la barra de progreso (0 en pausa). */
export function progress(s: RotationState, now: number, intervalMs: number): number {
  if (s.userPaused || now < s.pauseUntil) return 0;
  const from = Math.max(s.startedAt, s.pauseUntil);
  return Math.min(1, Math.max(0, (now - from) / intervalMs));
}

/** Segundos que faltan para reanudar tras una interacción, o 0. */
export function pauseSecondsLeft(s: RotationState, now: number): number {
  return s.userPaused || now >= s.pauseUntil ? 0 : Math.ceil((s.pauseUntil - now) / 1000);
}

/** Dirección de un arrastre horizontal: −1 (al anterior), 1 (al siguiente) o 0 si no supera el umbral. */
export function swipeDirection(dx: number): -1 | 0 | 1 {
  if (dx <= -SWIPE_THRESHOLD_PX) return 1;
  if (dx >= SWIPE_THRESHOLD_PX) return -1;
  return 0;
}

/** Intervalo de la URL (`?intervalo=30`), solo si es uno de los permitidos (TV-08). */
export function parseInterval(value: string | null): number {
  const n = Number(value);
  return (INTERVALS as readonly number[]).includes(n) ? n : DEFAULT_INTERVAL;
}
