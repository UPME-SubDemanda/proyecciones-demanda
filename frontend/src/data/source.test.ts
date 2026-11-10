import { afterEach, describe, expect, it, vi } from 'vitest';
import { DEMO_REVISION_ID, source } from './source';

/** Simula la API: responde `body` en cualquier ruta, o el estado `status` si no es 200. */
function mockApi(body: unknown, status = 200) {
  const fetchMock = vi.fn(async () => new Response(JSON.stringify(body), { status }));
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

afterEach(() => vi.unstubAllGlobals());

describe('source (T-37: energía eléctrica real, lo demás ilustrativo)', () => {
  it('energía eléctrica sale de la API y no es ilustrativa', async () => {
    const fetchMock = mockApi({ product: 'ee', frequency: 'A', region: 'SIN', unit: 'GWh', source: 'XM', cutoff: '2026-10', points: [] });
    const result = await source.observed('ee');
    expect(fetchMock).toHaveBeenCalledWith('/api/v1/ee/observed?frequency=A');
    expect(result.illustrative).toBe(false);
  });

  it('gas natural sigue con cifras ilustrativas, sin llamar a la API', async () => {
    const fetchMock = mockApi({});
    const result = await source.observed('gn');
    expect(fetchMock).not.toHaveBeenCalled();
    expect(result.illustrative).toBe(true);
  });

  it('las revisiones ilustrativas no van a la API', async () => {
    const fetchMock = mockApi({});
    expect((await source.revisionValues(DEMO_REVISION_ID + 100)).illustrative).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('si la API falla, lanza el error en vez de mostrar cifras de ejemplo', async () => {
    mockApi({ detail: 'error' }, 500);
    await expect(source.revisions('ee')).rejects.toThrow('500');
  });

  it('«El sistema hoy» marca qué partes siguen ilustrativas', async () => {
    mockApi({ lastDay: '2026-11-08', energyDaily: [], energyPrevYear: [], energyYesterday: 240, energyVsLastYear: 1, energyYearToDate: 70000, weekendDrop: 10 });
    const { data, illustrative } = await source.systemToday();
    expect(illustrative).toBe(false);
    expect(data.energyYesterday).toBe(240);
    expect(data.illustrativeParts).toEqual({ energy: false, peak: true, gas: true });
  });
});
