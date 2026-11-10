import { useMemo, useState } from 'react';
import { roles } from '../../estandares/echarts-theme.js';
import { Chip } from '../../components/Chip/Chip';
import { ErrorState } from '../../components/ErrorState/ErrorState';
import { KpiCard } from '../../components/KpiCard/KpiCard';
import { RangeSlider } from '../../components/RangeSlider/RangeSlider';
import { Skeleton } from '../../components/Skeleton/Skeleton';
import { EChart } from '../../components/charts/EChart';
import { revisionsFanOption } from '../../components/charts/kioskCharts';
import { useObservedSeries, useRevisions, useRevisionsPerformance, useRevisionsValues } from '../../data/queries';
import { formatMonth, formatPercent, revisionLabel } from '../../lib/format';
import { eeChartUnit, RESOLUTION_OPTIONS, type Resolution } from '../../lib/resolution';
import { SegmentedControl } from '../../components/SegmentedControl/SegmentedControl';
import { icons } from '../../lib/icons';
import { HorizontalBars, KioskHeader, Panel } from './KioskParts';
import { fanTitle, defaultCompared } from './kioskData';

const PRODUCT = 'ee' as const;
const DIVISOR = 1000; // KPIs y barras: TWh
const COMPARE_YEAR = '2030';
const DEFAULT_RANGE: [number, number] = [2015, 2035];

export function KioskCompareHeader() {
  return <KioskHeader icon={icons.history} tone="ee" title="Comparar proyecciones" subtitle="Energía eléctrica · revisiones publicadas" />;
}

/**
 * Tablero «Comparar proyecciones» (mockup `modo-pantalla-comparar-proyecciones.png`):
 * cómo han cambiado las revisiones publicadas de energía eléctrica y qué tan acertada fue cada una.
 */
export function KioskCompareBoard() {
  const observed = useObservedSeries(PRODUCT);
  const revisions = useRevisions(PRODUCT);
  // De la más reciente a la más antigua: la paleta chart.series va en ese orden (GRA-06).
  const list = useMemo(() => [...(revisions.data?.data ?? [])].reverse(), [revisions.data]);
  const ids = list.map((r) => r.id);
  const values = useRevisionsValues(ids);
  const perf = useRevisionsPerformance(ids);
  // Resolución del abanico (issue #40): anual por omisión o mensual; se reinicia con el tablero (TV-04).
  const [resolution, setResolution] = useState<Resolution>('A');
  const chartObserved = useObservedSeries(PRODUCT, resolution);
  const chartValues = useRevisionsValues(ids, resolution);
  const chart = eeChartUnit(resolution);
  const [range, setRange] = useState<[number, number]>(DEFAULT_RANGE);
  const [shown, setShown] = useState<string[] | null>(null);
  const compared = shown ?? defaultCompared(list.map((r) => r.code));
  const palette = roles.dark.series;

  const option = useMemo(() => {
    if (!chartObserved.data || !chartValues.data) return null;
    return revisionsFanOption({
      observed: chartObserved.data.data.points,
      revisions: list
        .map((r, i) => ({ r, i }))
        .filter(({ r }) => compared.includes(r.code))
        .map(({ r, i }) => ({ label: revisionLabel(r.code), points: chartValues.data!.data[i].scenarios.mid, color: palette[i % palette.length], current: r.isCurrent })),
      range,
      divisor: chart.divisor,
      unit: chart.unit,
    });
  }, [chartObserved.data, chartValues.data, list, compared, range, palette, chart.divisor, chart.unit]);

  if (observed.isError || revisions.isError || values.isError || perf.isError || chartObserved.isError || chartValues.isError)
    return <ErrorState title="No se pudieron cargar las revisiones" description="Se reintentará en unos minutos." />;
  if (!option || !values.data || !perf.data || !list.length) return <Skeleton height={860} label="Cargando comparación de revisiones" />;

  const mape = list.map((r, i) => ({ r, i, mape: perf.data!.data[i].mape12 }));
  const best = [...mape].sort((a, b) => a.mape - b.mape)[0];
  const at2030 = (i: number) => (values.data!.data[i].scenarios.mid.find((p) => p.period === COMPARE_YEAR)?.value ?? 0) / DIVISOR;
  const newest = 0;
  const oldest = list.length - 1;
  const change2030 = at2030(newest) - at2030(oldest);
  const toggle = (code: string) =>
    setShown((prev) => {
      const base = prev ?? compared;
      return base.includes(code) ? base.filter((c) => c !== code) : [...base, code];
    });

  return (
    <div className="h-full flex flex-col gap-6">
      <div className="flex items-center gap-10 flex-wrap">
        <RangeSlider label="Rango" min={2010} max={2040} value={range} onChange={setRange} />
        <SegmentedControl ariaLabel="Resolución" size="touch" value={resolution} onChange={setResolution} options={RESOLUTION_OPTIONS} />
      </div>

      <div className="grid grid-cols-4 gap-6">
        <KpiCard label="Revisiones publicadas" value={list.length} unit="" provenance={`Desde ${formatMonth(list[oldest].code).replace('-', ' de ')}`} />
        <KpiCard
          label="Revisión más acertada"
          value={0}
          valueText={formatMonth(best.r.code)}
          valueTone="good"
          unit=""
          provenance={`MAPE ${formatPercent(best.mape)} a 12 meses`}
        />
        <KpiCard
          label={`Cambio de la proyección ${COMPARE_YEAR}`}
          value={change2030}
          decimals={1}
          signed
          unit="TWh"
          provenance={`Entre ${formatMonth(list[oldest].code)} y ${formatMonth(list[newest].code)}`}
        />
        <KpiCard label="Revisiones en pantalla" value={compared.length} unit="" provenance="Elija cuáles comparar abajo" />
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-3 gap-6">
        <Panel
          className="col-span-2"
          title={fanTitle(change2030, formatMonth(list[oldest].code).split('-')[1])}
          subtitle="Escenario medio de cada revisión publicada; toque una revisión a la derecha para mostrarla u ocultarla"
        >
          <EChart option={option} height={430} dark ariaLabel="Escenario medio de cada revisión publicada frente al dato real" />
        </Panel>

        <div className="flex flex-col gap-6 min-h-0">
          <Panel className="flex-1" title="Qué revisiones comparar" subtitle="Toque para mostrar u ocultar">
            <div className="flex flex-wrap gap-3 pt-2" role="group" aria-label="Revisiones en el gráfico">
              {list.map((r, i) => (
                <Chip key={r.code} size="touch" active={compared.includes(r.code)} onToggle={() => toggle(r.code)}>
                  <span className="w-3 h-3 rounded-pill mr-2" style={{ background: palette[i % palette.length] }} aria-hidden="true" />
                  {formatMonth(r.code)}
                </Chip>
              ))}
            </div>
          </Panel>

          <Panel className="flex-1" title="Exactitud de cada revisión" subtitle="Error medio a 12 meses (MAPE); menos es mejor">
            <HorizontalBars
              rows={[...mape].sort((a, b) => a.mape - b.mape).map(({ r, i, mape: m }) => ({
                key: r.code,
                label: revisionLabel(r.code),
                ratio: m,
                value: formatPercent(m),
                color: palette[i % palette.length],
              }))}
            />
          </Panel>
        </div>
      </div>
    </div>
  );
}
