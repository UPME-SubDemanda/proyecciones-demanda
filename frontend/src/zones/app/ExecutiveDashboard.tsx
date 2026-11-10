import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AlertItem } from '../../components/AlertItem/AlertItem';
import { Banner } from '../../components/Banner/Banner';
import { Button } from '../../components/Button/Button';
import { ChartCard } from '../../components/ChartCard/ChartCard';
import { EmptyState } from '../../components/EmptyState/EmptyState';
import { ErrorState } from '../../components/ErrorState/ErrorState';
import { KpiCard } from '../../components/KpiCard/KpiCard';
import { SegmentedControl } from '../../components/SegmentedControl/SegmentedControl';
import { Skeleton } from '../../components/Skeleton/Skeleton';
import { projectionChartOption, projectionTable } from '../../components/charts/projectionChart';
import {
  useAlerts, useObservedSeries, useRevisionPerformance, useRevisions, useRevisionValues,
} from '../../data/queries';
import { formatDate, formatMonth, formatNumber, formatPercent, formatProvenance, monthName, revisionLabel } from '../../lib/format';
import { icons } from '../../lib/icons';
import { deviationTitle, outOfThresholdSince, sinceText } from '../../lib/insights';
import { PRODUCTS, useProduct, type ProductKey } from '../../lib/product';
import { eeChartUnit, effectiveResolution, RESOLUTION_OPTIONS, useResolution } from '../../lib/resolution';
import { AppPage } from './AppPage';
import { isBuilt } from './navigation';
import { parseRange, RANGE_LABEL, RANGES, rangeYears, yearToDateEstimate, type RangeKey } from './dashboardData';

const IN_PROGRESS = 'En construcción';

/** Datos de un producto para el tablero: dato real, revisión vigente, sus valores y su desempeño. */
function useProductStatus(product: ProductKey) {
  const observed = useObservedSeries(product);
  const revisions = useRevisions(product);
  const list = revisions.data?.data ?? [];
  const current = list.find((r) => r.isCurrent);
  const values = useRevisionValues(current?.id);
  const perf = useRevisionPerformance(current?.id);
  const isError = observed.isError || revisions.isError || values.isError || perf.isError;
  const ready = !!(observed.data && current && values.data && perf.data);
  return { observed: observed.data, list, current, values: values.data, perf: perf.data, isError, ready };
}

type Status = ReturnType<typeof useProductStatus>;

function ProductKpis({ product, status }: { product: ProductKey; status: Status }) {
  const info = PRODUCTS[product];
  if (status.isError)
    return <ErrorState className="col-span-2" title={`No se pudieron cargar las cifras de ${info.name.toLowerCase()}`} description="Intente de nuevo en unos minutos." />;
  if (!status.ready) return <><Skeleton label={`Cargando ${info.name.toLowerCase()}`} /><Skeleton label="Cargando error" /></>;
  const { observed, current, values, perf } = status;
  const last = observed!.data.points.at(-1)!;
  const year = String(Number(last.period) + 1);
  const projected = values!.data.scenarios.mid.find((p) => p.period === year)?.value ?? 0;
  const { yearToDate, threshold } = perf!.data;
  const outside = Math.abs(yearToDate) > threshold;
  return (
    <>
      <KpiCard
        label={`Demanda ${info.short} ${year} proyectada (esc. medio)`}
        value={projected}
        unit={info.unit}
        change={`${formatPercent(((projected - last.value) / last.value) * 100, { signed: true })} frente a ${last.period}`}
        provenance={formatProvenance({ version: revisionLabel(current!.code), method: current!.model })}
        illustrative={observed!.illustrative}
      />
      <KpiCard
        label={product === 'ee' ? 'Error año corrido' : `Error año corrido ${info.short}`}
        value={yearToDate}
        decimals={1}
        signed
        unit="%"
        change={`${outside ? 'Fuera' : 'Dentro'} de umbral${observed!.illustrative ? '' : ' ilustrativo'} ±${formatNumber(threshold, { decimals: threshold % 1 ? 1 : 0 })} %`}
        changeTone={outside ? 'bad' : 'good'}
        provenance={formatProvenance({ cutoff: observed!.data.cutoff, source: observed!.data.source })}
        illustrative={observed!.illustrative}
      />
    </>
  );
}

/**
 * Tablero ejecutivo (T-09): inicio de la app interna. Responde en la primera pantalla si la proyección
 * vigente de cada producto sigue siendo válida (PRI-01) y qué revisar primero.
 */
export function ExecutiveDashboard() {
  const [product] = useProduct();
  const [params, setParams] = useSearchParams();
  const range = parseRange(params.get('rango'));
  const ee = useProductStatus('ee');
  const gn = useProductStatus('gn');
  const alerts = useAlerts();
  const active = product.key === 'ee' ? ee : gn;
  const isEE = product.key === 'ee';
  // Resolución de la gráfica (issue #40): anual por omisión; mensual solo en energía eléctrica.
  const [resolutionParam, setResolution] = useResolution();
  const resolution = effectiveResolution(product.key, resolutionParam);
  const monthly = resolution === 'M';
  const chartObserved = useObservedSeries(product.key, resolution);
  const chartValues = useRevisionValues(active.current?.id, resolution);

  const setRange = (r: RangeKey) =>
    setParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('rango', r);
      return next;
    }, { replace: true, preventScrollReset: true });

  const input = useMemo(() => {
    if (!active.ready || !chartObserved.data || !chartValues.data) return null;
    const points = active.observed!.data.points;
    const last = points.at(-1)!;
    const year = String(Number(last.period) + 1);
    const projected = active.values!.data.scenarios.mid.find((p) => p.period === year)?.value ?? 0;
    const ytd = active.perf!.data.yearToDate;
    const ytdValue = yearToDateEstimate(projected, ytd);
    const units = isEE ? eeChartUnit(resolution) : { unit: 'GBTUD', divisor: 1, decimals: 0 };
    const unitDivisor = units.divisor;
    const chartPoints = chartObserved.data.data.points;
    return {
      product: product.key,
      observed: chartPoints,
      projection: chartValues.data.data,
      projectionLabel: `Vigente ${formatMonth(active.current!.code)}`,
      past: active.list
        .filter((r) => !r.isCurrent)
        .slice(-2)
        .map((r) => ({ label: formatMonth(r.code), points: [] as typeof points })),
      cutoff: { period: chartPoints.at(-1)!.period, label: `Corte ${formatMonth(active.observed!.data.cutoff)}` },
      unit: units.unit,
      divisor: unitDivisor,
      decimals: units.decimals,
      scenarioLabels: false,
      range: rangeYears(range, Number(last.period)),
      // El punto del año corrido es anual: en mensual ya se ven los meses reales.
      ytdPoint: monthly ? undefined : {
        period: year,
        value: ytdValue,
        label: `${year} año corrido: ${formatNumber(ytdValue / unitDivisor, { decimals: isEE ? 1 : 0 })} (${formatPercent(ytd, { signed: true })})`,
      },
    };
  }, [active, product.key, isEE, range, resolution, monthly, chartObserved.data, chartValues.data]);

  // Valores de las revisiones anteriores para las líneas finas (GRA-01).
  const pastIds = active.list.filter((r) => !r.isCurrent).slice(-2).map((r) => r.id);
  const pastA = useRevisionValues(pastIds[0], resolution);
  const pastB = useRevisionValues(pastIds[1], resolution);
  const option = useMemo(() => {
    if (!input) return null;
    const pastValues = [pastA.data?.data, pastB.data?.data];
    const past = input.past
      .map((p, i) => ({ label: p.label, points: pastValues[i]?.scenarios.mid ?? [] }))
      .filter((p) => p.points.length);
    return projectionChartOption({ ...input, past });
  }, [input, pastA.data, pastB.data]);

  // Banner: la alerta alta más relevante (máximo uno por vista, UX-05).
  const banner = [ee, gn]
    .map((s, i) => ({ s, product: (i === 0 ? 'ee' : 'gn') as ProductKey }))
    .filter(({ s }) => s.ready && Math.abs(s.perf!.data.yearToDate) > s.perf!.data.threshold)
    .map(({ s, product: p }) => ({
      product: p,
      since: outOfThresholdSince(s.perf!.data.monthlyDeviation, s.perf!.data.threshold),
      ytd: s.perf!.data.yearToDate,
      year: s.perf!.data.monthlyDeviation.at(-1)!.period.slice(0, 4),
    }))
    .sort((a, b) => Math.abs(b.ytd) - Math.abs(a.ytd))[0];
  // Las alertas de ejemplo no se cuentan junto a cifras reales (T-37).
  const highAlerts = alerts.data && !alerts.data.illustrative ? alerts.data.data.filter((a) => a.severity === 'high').length : 0;

  const eeObserved = ee.observed?.data;
  const subtitle = eeObserved
    ? `Actualizado ${formatDate(new Date().toISOString().slice(0, 10))} · Datos reales hasta ${monthName(eeObserved.cutoff)} ${eeObserved.cutoff.slice(0, 4)}`
    : 'Cargando datos…';

  return (
    <AppPage
      title="Tablero ejecutivo"
      subtitle={subtitle}
      actions={<Button icon={icons.download} disabledReason={IN_PROGRESS}>Descargar informe</Button>}
    >
      {banner && (
        <Banner
          title={`La proyección vigente de ${PRODUCTS[banner.product].name.toLowerCase()} está fuera de umbral${banner.since ? ` ${sinceText(banner.since)}` : ''}.`}
          action={<Button size="sm" disabledReason="La vista de alertas está en construcción">Ver alertas</Button>}
        >
          {`La demanda real va ${formatPercent(Math.abs(banner.ytd))} ${banner.ytd < 0 ? 'por debajo' : 'por encima'} de lo proyectado en ${banner.year}.`}
          {' El umbral es ilustrativo mientras se define (X-03).'}
          {highAlerts > 0 && ` Hay ${highAlerts} alerta${highAlerts === 1 ? '' : 's'} alta${highAlerts === 1 ? '' : 's'} abierta${highAlerts === 1 ? '' : 's'}.`}
        </Banner>
      )}

      <section aria-label="Cifras principales" className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <ProductKpis product="ee" status={ee} />
        <ProductKpis product="gn" status={gn} />
      </section>

      {active.isError || chartObserved.isError || chartValues.isError ? (
        <ErrorState title="No se pudo cargar el gráfico" description="Intente de nuevo en unos minutos." />
      ) : !input || !option ? (
        <Skeleton height={480} label="Cargando gráfico" />
      ) : (
        <ChartCard
          title={deviationTitle(active.perf!.data.yearToDate, revisionLabel(active.current!.code), true)}
          subtitle={`${product.name}, ${active.observed!.data.region} · ${input.unit} · escenario medio con banda bajo–alto`}
          option={option}
          table={projectionTable(input)}
          download={{
            context: product.key,
            version: revisionLabel(active.current!.code),
            content: 'real vs proyeccion',
            source: `${active.observed!.data.source}, UPME`,
            cutoff: active.observed!.data.cutoff,
          }}
          controls={
            <>
              <SegmentedControl
                ariaLabel="Rango de años"
                value={range}
                onChange={setRange}
                options={RANGES.map((r) => ({ value: r, label: RANGE_LABEL[r] }))}
              />
              {isEE && <SegmentedControl ariaLabel="Resolución" value={resolution} onChange={setResolution} options={RESOLUTION_OPTIONS} />}
            </>
          }
          decimals={input.decimals}
          illustrative={active.observed!.illustrative}
        />
      )}

      <section aria-labelledby="alertas" className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-4">
          <h2 id="alertas" className="text-h2">Alertas abiertas</h2>
          <Button variant="ghost" size="sm" disabledReason="La vista de alertas está en construcción">
            {`Ver todas${alerts.data ? ` (${alerts.data.data.length})` : ''}`}
          </Button>
        </div>
        {alerts.isError ? (
          <ErrorState title="No se pudieron cargar las alertas" description="Intente de nuevo en unos minutos." />
        ) : !alerts.data ? (
          <Skeleton height={96} label="Cargando alertas" />
        ) : alerts.data.data.length === 0 ? (
          <EmptyState title="No hay alertas abiertas" description="Las alertas aparecen cuando el dato real o una variable exógena se salen de lo esperado." />
        ) : (
          <ul className="flex flex-col gap-3">
            {alerts.data.data.map((a) => (
              <li key={a.id}>
                <AlertItem
                  severity={a.severity}
                  product={a.product}
                  title={a.title}
                  meta={`${a.type} · ${formatDate(a.date)}`}
                  action={
                    <Button
                      size="sm"
                      href={`${a.action.target}${a.action.target.includes('?') ? '&' : '?'}producto=${a.product}`}
                      disabledReason={isBuilt(a.action.target) ? undefined : `${a.action.label}: la vista está en construcción`}
                    >
                      {a.action.label}
                    </Button>
                  }
                />
              </li>
            ))}
          </ul>
        )}
        {alerts.data?.illustrative && <p className="text-small text-ink-muted">Alertas de ejemplo: las reglas reales están pendientes (X-03, X-10).</p>}
      </section>
    </AppPage>
  );
}
