import { describe, expect, it } from 'vitest';
import {
  goTo, initialRotation, interact, parseInterval, pauseSecondsLeft, progress, swipeDirection, tick, togglePause,
  type RotationState,
} from './rotation';

const S = 1000;
const MIN = 60 * S;

/** Simula el reloj de la pantalla: un tick por segundo hasta `to`. */
function run(s: RotationState, from: number, to: number, count = 2, interval = 20 * S): RotationState {
  let state = s;
  for (let t = from; t <= to; t += S) state = tick(state, t, count, interval);
  return state;
}

describe('rotación del modo pantalla', () => {
  it('cambia de tablero al cumplirse el intervalo y vuelve al primero (TV-02)', () => {
    let s = run(initialRotation(0), 0, 19 * S);
    expect(s.index).toBe(0);
    s = run(s, 20 * S, 20 * S);
    expect(s.index).toBe(1);
    s = run(s, 21 * S, 40 * S);
    expect(s.index).toBe(0);
  });

  it('una interacción pausa 30 s, congela la barra y luego continúa donde iba (TV-04)', () => {
    let s = run(initialRotation(0), 0, 5 * S);
    s = interact(s, 5 * S);
    expect(pauseSecondsLeft(s, 10 * S)).toBe(25);
    s = run(s, 6 * S, 30 * S);
    expect(s.index).toBe(0);
    expect(progress(s, 30 * S, 20 * S)).toBeCloseTo(0.25); // congelada en 5 de 20 s, sigue visible
    s = run(s, 31 * S, 49 * S);
    expect(s.index).toBe(0); // faltan 15 s desde que terminó la pausa (35 s)
    s = run(s, 50 * S, 50 * S);
    expect(s.index).toBe(1);
  });

  it('la pausa con el botón no se reanuda sola y conserva la barra', () => {
    let s = run(initialRotation(0), 0, 8 * S);
    s = togglePause(s, 8 * S);
    s = run(s, 9 * S, 10 * MIN);
    expect(s.index).toBe(0);
    expect(progress(s, 10 * MIN, 20 * S)).toBeCloseTo(0.4);
    s = togglePause(s, 10 * MIN);
    expect(run(s, 10 * MIN, 10 * MIN + 12 * S).index).toBe(1);
  });

  it('a los 5 minutos sin interacción, los filtros vuelven a sus valores (TV-04)', () => {
    let s = interact(initialRotation(0), 0);
    s = tick(s, 4 * MIN, 2, 20 * S);
    expect(s.resetKey).toBe(0);
    s = tick(s, 5 * MIN, 2, 20 * S);
    expect(s.resetKey).toBe(1);
    s = tick(s, 9 * MIN, 2, 20 * S);
    expect(s.resetKey).toBe(1); // una sola vez por periodo sin interacción
  });

  it('ir a un tablero con los puntos o las flechas empieza de cero', () => {
    const s = goTo(run(initialRotation(0), 0, 10 * S), -1, 10 * S, 3);
    expect(s.index).toBe(2);
    expect(progress(s, 10 * S, 20 * S)).toBe(0);
    expect(goTo(initialRotation(0), 3, 0, 3).index).toBe(0);
  });

  it('progreso de la barra (0 a 1)', () => expect(progress(run(initialRotation(0), 0, 10 * S), 10 * S, 20 * S)).toBeCloseTo(0.5));

  it('arrastre de 80 px o más (TV-03)', () => {
    expect(swipeDirection(-120)).toBe(1);
    expect(swipeDirection(90)).toBe(-1);
    expect(swipeDirection(40)).toBe(0);
  });

  it('intervalo de la URL solo con valores permitidos (TV-08)', () => {
    expect(parseInterval('30')).toBe(30);
    expect(parseInterval('15')).toBe(20);
    expect(parseInterval(null)).toBe(20);
  });
});
