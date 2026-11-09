import { describe, expect, it } from 'vitest';
import {
  goTo, initialRotation, interact, parseInterval, pauseSecondsLeft, progress, swipeDirection, tick, togglePause,
} from './rotation';

const S = 1000;
const MIN = 60 * S;

describe('rotación del modo pantalla', () => {
  it('cambia de tablero al cumplirse el intervalo y vuelve al primero (TV-02)', () => {
    let s = initialRotation(0);
    s = tick(s, 19 * S, 2, 20 * S);
    expect(s.index).toBe(0);
    s = tick(s, 20 * S, 2, 20 * S);
    expect(s.index).toBe(1);
    s = tick(s, 40 * S, 2, 20 * S);
    expect(s.index).toBe(0);
  });

  it('una interacción pausa 30 s y muestra la cuenta regresiva (TV-04)', () => {
    let s = interact(initialRotation(0), 5 * S);
    expect(pauseSecondsLeft(s, 10 * S)).toBe(25);
    s = tick(s, 30 * S, 2, 20 * S);
    expect(s.index).toBe(0); // sigue en pausa
    s = tick(s, 55 * S, 2, 20 * S);
    expect(s.index).toBe(1); // 35 s de pausa + 20 s de intervalo
  });

  it('la pausa con el botón no se reanuda sola', () => {
    let s = togglePause(initialRotation(0), 0);
    s = tick(s, 10 * MIN, 2, 20 * S);
    expect(s.index).toBe(0);
    expect(progress(s, 10 * MIN, 20 * S)).toBe(0);
    s = togglePause(s, 10 * MIN);
    expect(tick(s, 10 * MIN + 20 * S, 2, 20 * S).index).toBe(1);
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

  it('ir a un tablero con los puntos o las flechas', () => {
    expect(goTo(initialRotation(0), -1, 0, 3).index).toBe(2);
    expect(goTo(initialRotation(0), 3, 0, 3).index).toBe(0);
  });

  it('progreso de la barra (0 a 1)', () => expect(progress(initialRotation(0), 10 * S, 20 * S)).toBeCloseTo(0.5));

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
