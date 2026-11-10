import { useMemo, useState, type ReactNode } from 'react';
import { Chip } from '../../components/Chip/Chip';
import { ErrorState } from '../../components/ErrorState/ErrorState';
import { KpiCard } from '../../components/KpiCard/KpiCard';
import { ProductIcon } from '../../components/ProductIcon/ProductIcon';
import { RangeSlider } from '../../components/RangeSlider/RangeSlider';
import { Skeleton } from '../../components/Skeleton/Skeleton';
import { VersionSelect } from '../../components/VersionSelect/VersionSelect';
import { EChart } from '../../components/charts/EChart';
import { deviationChartOption } from '../../components/charts/kioskCharts';
import { projectionChartOption, projectionTable } from '../../components/charts/projectionChart';
import { useObservedSeries, useRevisionPerformance, useRevisions, useRevisionValues } from '../../data/queries';
import { SCENARIO_LABEL, type Scenario } from '../../data/types';
import { cn } from '../../lib/cn';
import { formatMonth, formatNumber, formatPercent, formatValue, revisionLabel } from '../../lib/format';
import { PRODUCTS, type ProductKey } from '../../lib/product';
import {
  DEFAULT_RESOLUTION, eeChartUnit, publicationLabel, publicationPeriod, publicationWindow, RESOLUTION_OPTIONS, type Resolution,
} from '../../lib/resolution';
import { SegmentedControl } from '../../components/SegmentedControl/SegmentedControl';
import { averageGrowth, deviationTitle } from './kioskData';

const SCENARIOS: Scenario[] = ['low', 'mid', 'high'];
const DEFAULT_RANGE: [number, number] = [2015, 2035];
const COMPARE_YEAR = '2030';

/** Unidades del gráfico: energía eléctrica en TWh/año (o GWh/mes en mensual); gas natural en GBTUD. */
function chartUnit(product: ProductKey, resolution: Resolution = 'A') {
  return product === 'ee' ? eeChartUnit(resolution) : { unit: 'GBTUD', short: 'GBTUD', divisor: 1, decimals: 0 };
}

/** Encabezado del tablero: ícono del producto y título (TV-05). */
export function KioskBoardHeader({ product }: { product: ProductKey }) {
  return (
    <div className="flex items-center gap-6">
      <ProductIcon product={product} size={60} decorative />
      <div>
        <h1 className="text-h1">{PRODUCTS[product].name}</h1>
        <p className="text-body text-ink-muted">
          {product === 'ee' ? 'Proyección de demanda del SIN' : 'Proyección de demanda nacional'}
        </p>
      </div>
    </div>
  );
}

function Panel({ title, subtitle, children, className, action }: { title: string; subtitle: string; children: ReactNode; className?: string; action?: ReactNode }) {
  return (
    <section className={cn('flex flex-col gap-2 p-6 bg-surface-raised border border-line rounded-md min-h-0', className)}>
      <div className="flex items-start justify-between gap-6">
        <div className="flex flex-col gap-2">
          <h2 className="text-h2">{title}</h2>
          <p className="text-small text-ink-muted">{subtitle}</p>
        </div>
        {action}
      </div>
      <div className="flex-1 min-h-0">{children}</div>
    </section>
  );
}

/**
 * Tablero de un producto (TV-05): filtros · 4 KPIs · gráfico principal + 2 secundarios.
 * Los filtros viven aquí: el KioskShell vuelve a montarlo para reiniciarlos (TV-04).
 */
export function KioskProductBoard({ product }: { product: ProductKey }) {
  const info = PRODUCTS[product];
  const { short, divisor, decimals } = chartUnit(product);
  // Resolución del gráfico principal (issue #40): mensual por omisión en energía eléctrica; gas natural, anual.
  // Es un filtro del tablero: se reinicia con él (TV-04).
  const [resolution, setResolutionState] = useState<Resolution>(DEFAULT_RESOLUTION);
  const chartRes = product === 'ee' ? resolution : 'A';
  const chart = chartUnit(product, chartRes);
  const observed = useObservedSeries(product);
  const chartObserved = useObservedSeries(product, chartRes);
  const revisions = useRevisions(product);
  const list = revisions.data?.data ?? [];
  const current = list.find((r) => r.isCurrent);
  const [code, setCodeState] = useState<string>();
  const selected = list.find((r) => r.code === (code ?? current?.code));
  const values = useRevisionValues(selected?.id);
  const chartValues = useRevisionValues(selected?.id, chartRes);
  const perf = useRevisionPerformance(selected?.id);
  // Rango elegido con el control; sin elegir, en mensual se ve alrededor de la revisión (issue #40).
  const [rangeChoice, setRange] = useState<[number, number] | null>(null);
  const setResolution = (r: Resolution) => { setResolutionState(r); setRange(null); };
  const setCode = (c: string) => { setCodeState(c); setRange(null); };
  const lastPeriod = chartObserved.data?.data.points.at(-1)?.period;
  const range: [number, number] = rangeChoice
    ?? (chartRes === 'M' && selected && lastPeriod ? publicationWindow(selected.publishedOn, lastPeriod) : DEFAULT_RANGE);
  const [scenarios, setScenarios] = useState<Scenario[]>(SCENARIOS);

  const input = useMemo(() => {
    if (!chartObserved.data || !chartValues.data || !selected) return null;
    const last = chartObserved.data.data.points.at(-1)!;
    return {
      product,
      observed: chartObserved.data.data.points,
      projection: chartValues.data.data,
      projectionLabel: 'Proyección media',
      cutoff: { period: last.period, label: `Corte ${formatMonth(chartObserved.data.data.cutoff)}` },
      unit: chart.unit,
      divisor: chart.divisor,
      dark: true,
      kiosk: true,
      scenarios,
      range,
      publication: { period: publicationPeriod(selected.publishedOn, chartRes), label: publicationLabel(selected.publishedOn) },
    };
  }, [chartObserved.data, chartValues.data, selected, product, chart.unit, chart.divisor, scenarios, range, chartRes]);
  const mainOption = useMemo(() => (input ? projectionChartOption(input) : null), [input]);
  const deviationOption = useMemo(
    () => (perf.data ? deviationChartOption({ product, points: perf.data.data.monthlyDeviation, threshold: perf.data.data.threshold }) : null),
    [perf.data, product],
  );

  if (observed.isError || revisions.isError || values.isError || perf.isError || chartObserved.isError || chartValues.isError)
    return <ErrorState title={`No se pudieron cargar los datos de ${info.name.toLowerCase()}`} description="Se reintentará en unos minutos." />;
  if (!input || !mainOption || !deviationOption || !selected || !perf.data || !values.data || !observed.data)
    return <Skeleton height={860} label={`Cargando tablero de ${info.name.toLowerCase()}`} />;

  const name = revisionLabel(selected.code);
  const { mid, low, high } = values.data.data.scenarios;
  const firstYear = mid[1]?.period ?? mid[0].period; // el primer año proyectado
  const at = (period: string, points = mid) => points.find((p) => p.period === period)?.value ?? 0;
  const lastYear = mid.at(-1)!.period;
  const growth = averageGrowth(at(firstYear), at(lastYear), Number(lastYear) - Number(firstYear));
  const { yearToDate, threshold, mape12 } = perf.data.data;
  const outside = Math.abs(yearToDate) > threshold;
  const compare = [
    { sc: 'low' as const, v: at(COMPARE_YEAR, low) / divisor },
    { sc: 'mid' as const, v: at(COMPARE_YEAR, mid) / divisor },
    { sc: 'high' as const, v: at(COMPARE_YEAR, high) / divisor },
  ];
  const maxCompare = Math.max(...compare.map((c) => c.v));
  const fill = product === 'ee' ? 'bg-ee-fill' : 'bg-gn-fill';
  const soft = product === 'ee' ? 'bg-ee-soft' : 'bg-gn-soft';
  const toggle = (sc: Scenario) =>
    setScenarios((prev) => (prev.includes(sc) ? prev.filter((x) => x !== sc) : SCENARIOS.filter((x) => x === sc || prev.includes(x))));

  return (
    <div className="h-full flex flex-col gap-6">
      <div className="flex items-center gap-10 flex-wrap">
        <VersionSelect
          label="Proyección"
          size="touch"
          value={selected.code}
          onChange={setCode}
          options={[...list].reverse().map((r) => ({ value: r.code, label: `${revisionLabel(r.code)} · ${r.model}`, current: r.isCurrent }))}
        />
        <RangeSlider label="Rango" min={2010} max={2040} value={range} onChange={setRange} />
        <div className="flex items-center gap-3" role="group" aria-label="Escenarios">
          <span className="text-body text-ink-muted">Escenarios</span>
          {SCENARIOS.map((sc) => (
            <Chip key={sc} size="touch" active={scenarios.includes(sc)} onToggle={() => toggle(sc)}>{SCENARIO_LABEL[sc]}</Chip>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6">
        <KpiCard label={`Demanda proyectada ${firstYear}`} value={at(firstYear)} unit={info.unit} provenance={`Escenario medio · ${name.toLowerCase()}`} />
        <KpiCard
          label="Real vs. proyectado, año corrido"
          value={yearToDate}
          decimals={1}
          signed
          unit="%"
          change={`${outside ? 'Fuera' : 'Dentro'} del umbral${perf.data.illustrative ? '' : ' ilustrativo'} de ±${formatNumber(threshold, { decimals: 1 })} %`}
          changeTone={outside ? 'bad' : 'good'}
          provenance={`Datos a ${formatMonth(observed.data.data.cutoff)}`}
        />
        <KpiCard
          label={`Crecimiento promedio ${firstYear}–${lastYear}`}
          value={growth}
          decimals={1}
          unit="% anual"
          provenance={`${formatValue(at(lastYear) / divisor, short, { decimals })} en ${lastYear}`}
        />
        <KpiCard label="Error medio de la revisión" value={mape12} decimals={1} unit="%" provenance={`MAPE a 12 meses · ${selected.model}`} />
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-3 gap-6">
        <Panel
          className="col-span-2"
          title={deviationTitle(yearToDate, name, selected.isCurrent)}
          subtitle={`${observed.data.data.region === 'SIN' ? 'Sistema Interconectado Nacional' : 'Total nacional'} · escenarios de la ${name.toLowerCase()} · ${chart.unit}`}
          action={product === 'ee' && (
            <SegmentedControl ariaLabel="Resolución" size="touch" value={resolution} onChange={setResolution} options={RESOLUTION_OPTIONS} />
          )}
        >
          <EChart option={mainOption} height={420} dark ariaLabel={deviationTitle(yearToDate, name, selected.isCurrent)} />
          <table className="sr-only">
            <caption>Datos del gráfico principal</caption>
            <tbody>
              {projectionTable(input).rows.map((r) => (
                <tr key={String(r[0])}>{r.map((c, i) => <td key={i}>{c ?? '—'}</td>)}</tr>
              ))}
            </tbody>
          </table>
        </Panel>

        <div className="flex flex-col gap-6 min-h-0">
          <Panel className="flex-1" title="Desviación mensual" subtitle="Real frente a proyectado, últimos 12 meses (%)">
            <EChart option={deviationOption} height={190} dark ariaLabel="Desviación mensual, real frente a proyectado" />
            <table className="sr-only">
              <caption>Desviación mensual</caption>
              <tbody>
                {perf.data.data.monthlyDeviation.map((p) => (
                  <tr key={p.period}><td>{formatMonth(p.period)}</td><td>{formatPercent(p.value, { signed: true })}</td></tr>
                ))}
              </tbody>
            </table>
          </Panel>

          <Panel className="flex-1" title={`Demanda en ${COMPARE_YEAR} por escenario`} subtitle={`${short} · ${name.toLowerCase()}`}>
            <ul className="flex flex-col gap-4 pt-2">
              {compare.map(({ sc, v }) => (
                <li key={sc} className="grid grid-cols-[96px_1fr_140px] items-center gap-4">
                  <span className="text-body">{SCENARIO_LABEL[sc]}</span>
                  <span className="h-5 rounded-sm bg-surface-sunken overflow-hidden" aria-hidden="true">
                    <span className={cn('block h-full rounded-sm', sc === 'mid' ? fill : soft)} style={{ width: `${(v / maxCompare) * 100}%` }} />
                  </span>
                  <span className="text-h3 text-right tabular">{formatValue(v, short, { decimals })}</span>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>
    </div>
  );
}
