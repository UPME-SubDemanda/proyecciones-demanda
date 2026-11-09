import { describe, expect, it } from 'vitest';
import { demoExogenousMonitor } from '../../demo/fixtures';
import type { ExogenousMonitorVariable } from '../../data/types';
import {
  correlationTitle, defaultVariable, deviation, formatDeviation, formatVariableValue, monitorSummary, monitorTitle, sourceLine, variableStatus,
} from './exogenousData';

const ee = demoExogenousMonitor('ee').variables;
const byCode = (code: string) => ee.find((v) => v.code === code)!;

describe('monitor de exógenas', () => {
  it('desvío: observado menos supuesto del escenario', () => {
    expect(deviation(byCode('gdp'), 'mid')).toBe(-1.2);
    expect(deviation(byCode('gdp'), 'low')).toBe(-0.4);
    expect(deviation(byCode('solar'), 'mid')).toBe(90);
  });

  it('estado según los umbrales de vigilancia y fuera de rango', () => {
    expect(variableStatus(byCode('gdp'), 'mid')).toBe('out');
    expect(variableStatus(byCode('oni'), 'mid')).toBe('watch');
    expect(variableStatus(byCode('population'), 'mid')).toBe('ok');
    expect(variableStatus(byCode('gdp'), 'low')).toBe('ok'); // el escenario cambia el estado
  });

  it('cifras del mockup en el escenario medio: 14 variables, 1 fuera de rango, 3 en vigilancia, −0,3 %', () => {
    expect(monitorSummary(ee, 'mid')).toEqual({ total: 14, out: 1, watch: 3, impact: -0.3 });
  });

  it('formatos con unidad, signo y espacio que no se parte', () => {
    expect(formatVariableValue(byCode('gdp'), 3)).toBe('3,0 %');
    expect(formatVariableValue(byCode('oni'), 0.6)).toBe('+0,6');
    expect(formatVariableValue(byCode('solar'), 420)).toBe('420 MW');
    expect(formatDeviation(byCode('gdp'), 'mid')).toBe('−1,2 pp');
    expect(formatDeviation(byCode('population'), 'mid')).toBe('0,0 pp');
  });

  it('título con hallazgo: una, varias o ninguna variable fuera de rango (GRA-02)', () => {
    expect(monitorTitle(ee, 'mid')).toBe('PIB total es la única variable fuera de rango (−0,7 % en la demanda)');
    expect(monitorTitle(demoExogenousMonitor('gn').variables, 'mid')).toMatch(/^2 variables fuera de rango; la de mayor efecto es Generación térmica a gas/);
    const calm = ee.map((v) => ({ ...v, observed: v.assumption.mid }));
    expect(monitorTitle(calm, 'mid')).toBe('Todas las variables se comportan como supuso la revisión');
  });

  it('variable por defecto: la fuera de rango de mayor impacto', () => {
    expect(defaultVariable(ee, 'mid')?.code).toBe('gdp');
    expect(defaultVariable([], 'mid')).toBeUndefined();
  });

  it('título de la correlación: con quiebre dice si se debilita o se fortalece', () => {
    expect(correlationTitle(byCode('gdp'))).toBe('La relación entre PIB total y la demanda se debilita desde 2025');
    const thermal = demoExogenousMonitor('gn').variables.find((v) => v.code === 'thermal')!;
    expect(correlationTitle(thermal)).toMatch(/se fortalece desde 2025$/);
    expect(correlationTitle(byCode('population'))).toMatch(/se mantiene estable \(0,9\d\)$/);
    const empty: ExogenousMonitorVariable = { ...byCode('gdp'), rolling: [] };
    expect(correlationTitle(empty)).toBe('Relación entre PIB total y la demanda');
  });
});
