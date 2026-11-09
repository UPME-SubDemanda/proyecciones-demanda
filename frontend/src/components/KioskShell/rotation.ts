/**
 * Lógica de rotación del modo pantalla, sin React, para probarla con tiempos simulados.
 * TV-02: rotación cada N s con barra de progreso. TV-03: navegación manual y arrastre de 80 px.
 * TV-04: cualquier interacción pausa 30 s; a los 5 min sin interacción, los filtros vuelven a sus valores.
 *
 * El tiempo del tablero se acumula solo mientras corre: en una pausa la barra se congela
 * (sigue visible) y al reanudar continúa donde iba.
 */

export const INTERVALS = [10, 20, 30, 60] as const; // segundos (TV-02)
export const DEFAULT_INTERVAL = 20;
export const INTERACTION_PAUSE_MS = 30_000;
export const IDLE_RESET_MS = 5 * 60_000;
export const SWIPE_THRESHOLD_PX = 80;

export type RotationState = {
  index: number;
  /** Tiempo ya mostrado del tablero actual, sin contar el tramo en curso. */
  elapsed: number;
  /** Inicio del tramo en curso, o `null` si está en pausa. */
  runningSince: number | null;
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
  return {
    index: 0, elapsed: 0, runningSince: now, pauseUntil: 0, userPaused: false,
    lastInteraction: now, resetKey: 0, idleResetDone: true,
  };
}

export function wrap(index: number, count: number): number {
  return ((index % count) + count) % count;
}

function isPaused(s: RotationState, now: number): boolean {
  return s.userPaused || now < s.pauseUntil;
}

/** Tiempo mostrado del tablero actual hasta `now`. */
function shown(s: RotationState, now: number): number {
  return s.elapsed + (s.runningSince === null ? 0 : now - s.runningSince);
}

/** Detiene el tramo en curso y acumula su tiempo. */
function freeze(s: RotationState, now: number): RotationState {
  return s.runningSince === null ? s : { ...s, elapsed: shown(s, now), runningSince: null };
}

/** Avanza el reloj: congela o reanuda, cambia de tablero al cumplirse el intervalo y reinicia filtros tras 5 min. */
export function tick(s: RotationState, now: number, count: number, intervalMs: number): RotationState {
  let next = s;
  if (!s.idleResetDone && now - s.lastInteraction >= IDLE_RESET_MS) {
    next = { ...next, resetKey: s.resetKey + 1, idleResetDone: true };
  }
  if (isPaused(next, now)) return freeze(next, now);
  if (next.runningSince === null) next = { ...next, runningSince: now };
  if (count >= 2 && shown(next, now) >= intervalMs) {
    return { ...next, index: wrap(next.index + 1, count), elapsed: 0, runningSince: now };
  }
  return next;
}

/** Cualquier toque, clic o arrastre: pausa 30 s (TV-04) y congela la barra. */
export function interact(s: RotationState, now: number): RotationState {
  return { ...freeze(s, now), pauseUntil: now + INTERACTION_PAUSE_MS, lastInteraction: now, idleResetDone: false };
}

/** Ir a un tablero: empieza de cero, en pausa por interacción. */
export function goTo(s: RotationState, index: number, now: number, count: number): RotationState {
  return { ...interact(s, now), index: wrap(index, count), elapsed: 0 };
}

export function togglePause(s: RotationState, now: number): RotationState {
  if (s.userPaused) return { ...s, userPaused: false, pauseUntil: 0, runningSince: now };
  return { ...interact(s, now), userPaused: true };
}

/** Fracción del intervalo ya mostrada, para la barra de progreso (0 a 1); en pausa queda congelada. */
export function progress(s: RotationState, now: number, intervalMs: number): number {
  return Math.min(1, Math.max(0, shown(s, now) / intervalMs));
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
