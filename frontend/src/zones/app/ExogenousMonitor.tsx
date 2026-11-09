import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Badge } from '../../components/Badge/Badge';
import { Button } from '../../components/Button/Button';
import { ChartCard } from '../../components/ChartCard/ChartCard';
import { DataTable, type Column } from '../../components/DataTable/DataTable';
import { EmptyState } from '../../components/EmptyState/EmptyState';
import { ErrorState } from '../../components/ErrorState/ErrorState';
import { KpiCard } from '../../components/KpiCard/KpiCard';
import { SegmentedControl } from '../../components/SegmentedControl/SegmentedControl';
import { Skeleton } from '../../components/Skeleton/Skeleton';
import { Sparkline } from '../../components/Sparkline/Sparkline';
import { correlationChartOption, importanceChartOption } from '../../components/charts/exogenousCharts';
import { useExogenousMonitor } from '../../data/queries';
import { SCENARIO_LABEL, type ExogenousMonitorVariable, type Scenario } from '../../data/types';
import { cssVar } from '../../lib/cssVar';
import { downloadFile, fileName, toCsv } from '../../lib/download';
import { formatMonth, formatNumber, formatPercent, formatProvenance, revisionLabel } from '../../lib/format';
import { icons } from '../../lib/icons';
import { useProduct } from '../../lib/product';
import { AppPage } from './AppPage';
import {
  STATUS_LABEL, STATUS_TONE, correlationTitle, defaultVariable, deviation, formatDeviation, formatVariableValue,
  monitorSummary, monitorTitle, sourceLine, statusRank, variableStatus,
} from './exogenousData';

const SCENARIOS: Scenario[] = ['low', 'mid', 'high'];
const THRESHOLDS_PENDING = 'Configurar umbrales está en construcción: los umbrales están por definir (X-03)';

function parseScenario(value: string | null): Scenario {
  return SCENARIOS.includes(value as Scenario) ? (value as Scenario) : 'mid';
}

/** Monitor de variables exógenas (T-11): supuestos de la revisión vigente frente a lo observado. */
export function ExogenousMonitor() {
  const [product] = useProduct();
  const [params, setParams] = useSearchParams();
  const scenario = parseScenario(params.get('escenario'));
  const monitor = useExogenousMonitor(product.key);
  const data = monitor.data?.data;
  const illustrative = monitor.data?.illustrative;
  const variables = useMemo(() => data?.variables ?? [], [data]);

  const setParam = (key: string, value: string | null) =>
    setParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value) next.set(key, value); else next.delete(key);
      return next;
    }, { replace: true, preventScrollReset: true });

  const selected = variables.find((v) => v.code === params.get('variable')) ?? defaultVariable(variables, scenario);
  const summary = monitorSummary(variables, scenario);

  const correlationOption = useMemo(() => (selected
    ? correlationChartOption({
        product: product.key,
        rolling: selected.rolling,
        breakFrom: selected.breakFrom,
        colors: {
          line: cssVar('--primary', 'currentColor'),
          event: cssVar('--surface-sunken', 'transparent'),
          eventLabel: cssVar('--warning', 'currentColor'),
        },
      })
    : null), [selected, product.key]);

  const importanceOption = useMemo(
    () => (data?.importance ? importanceChartOption(data.importance, cssVar('--primary', 'currentColor')) : null),
    [data],
  );

  const tableCsv = () => {
    if (!data) return;
    const meta = { context: product.key, version: revisionLabel(data.revisionCode), content: `exogenas ${SCENARIO_LABEL[scenario]}`, source: 'UPME', cutoff: data.cutoff, illustrative };
    downloadFile(fileName(meta, 'csv'), toCsv(meta,
      ['Variable', 'Fuente', 'Frecuencia', 'Unidad', 'Supuesto', 'Observado', 'Desvío', 'Unidad del desvío', 'Impacto en demanda (%)', 'Correlación', 'Estado'],
      variables.map((v) => [
        v.name, v.source, v.frequency, v.unit, v.assumption[scenario], v.observed, deviation(v, scenario), v.deviationUnit,
        v.impact[scenario], v.correlation, STATUS_LABEL[variableStatus(v, scenario)],
      ])));
  };

  const columns: Column<ExogenousMonitorVariable>[] = [
    {
      key: 'name',
      header: 'Variable',
      rowHeader: true,
      render: (v) => (
        <span className="flex flex-col w-44 whitespace-normal">
          <span className="font-bold text-ink">{v.name}</span>
          <span className="text-small text-ink-muted">{sourceLine(v)}</span>
        </span>
      ),
      sortValue: (v) => v.name,
    },
    {
      key: 'trend',
      header: 'Tendencia',
      render: (v) => (
        <Sparkline
          width={96}
          observed={v.trend.observed}
          reference={v.trend.assumption[scenario]}
          ariaLabel={`${v.name}: observado de ${formatVariableValue(v, v.trend.observed[0].value)} a ${formatVariableValue(v, v.observed)} frente a un supuesto de ${formatVariableValue(v, v.assumption[scenario])}`}
        />
      ),
    },
    { key: 'assumption', header: 'Supuesto', numeric: true, render: (v) => formatVariableValue(v, v.assumption[scenario]) },
    { key: 'observed', header: 'Observado', numeric: true, render: (v) => formatVariableValue(v, v.observed) },
    { key: 'deviation', header: 'Desvío', numeric: true, render: (v) => formatDeviation(v, scenario) },
    {
      key: 'impact',
      header: 'Impacto en demanda',
      numeric: true,
      render: (v) => formatPercent(v.impact[scenario], { signed: true }),
      sortValue: (v) => v.impact[scenario],
    },
    { key: 'correlation', header: 'Correlación', numeric: true, render: (v) => formatNumber(v.correlation, { decimals: 2 }), sortValue: (v) => v.correlation },
    {
      key: 'status',
      header: 'Estado',
      render: (v) => {
        const s = variableStatus(v, scenario);
        return <Badge tone={STATUS_TONE[s]}>{STATUS_LABEL[s]}</Badge>;
      },
      sortValue: (v) => statusRank(variableStatus(v, scenario)),
    },
  ];

  const subtitle = data
    ? `Supuestos de la revisión vigente (${formatMonth(data.revisionCode)}, escenario ${SCENARIO_LABEL[scenario].toLowerCase()}) frente a lo observado · ${data.period} año corrido`
    : 'Cargando variables…';
  const provenance = data ? formatProvenance({ version: revisionLabel(data.revisionCode), method: data.model, cutoff: data.cutoff }) : undefined;

  return (
    <AppPage
      title="Monitor de variables exógenas"
      subtitle={subtitle}
      actions={
        <>
          <Button disabledReason={THRESHOLDS_PENDING}>Configurar umbrales</Button>
          <Button icon={icons.download} onClick={tableCsv}>Descargar</Button>
        </>
      }
    >
      {monitor.isError ? (
        <ErrorState title="No se pudieron cargar las variables exógenas" description="Intente de nuevo en unos minutos." />
      ) : !data ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {[0, 1, 2, 3].map((i) => <Skeleton key={i} height={140} label="Cargando indicador" />)}
          </div>
          <Skeleton height={480} label="Cargando tabla de variables" />
        </>
      ) : variables.length === 0 ? (
        <EmptyState title="No hay variables monitoreadas" description={`La revisión vigente de ${product.name.toLowerCase()} no tiene supuestos de variables exógenas cargados.`} />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <KpiCard label="Variables monitoreadas" value={summary.total} unit="" provenance={provenance} illustrative={illustrative} />
            <KpiCard label="Fuera de rango" value={summary.out} unit="" valueTone={summary.out > 0 ? 'bad' : 'neutral'}
              change={`Umbrales ilustrativos (X-03) · escenario ${SCENARIO_LABEL[scenario].toLowerCase()}`} illustrative={illustrative} />
            <KpiCard label="En vigilancia" value={summary.watch} unit="" valueTone={summary.watch > 0 ? 'warning' : 'neutral'}
              change={`Escenario ${SCENARIO_LABEL[scenario].toLowerCase()}`} illustrative={illustrative} />
            <KpiCard label={`Impacto estimado en demanda ${data.period}`} value={summary.impact} decimals={1} signed unit="%"
              change="Suma de efectos por elasticidad" illustrative={illustrative} />
          </div>

          <section aria-labelledby="variables" className="bg-surface-raised border border-line rounded-md">
            <div className="flex flex-wrap items-start justify-between gap-4 p-6">
              <div className="flex flex-col gap-1">
                <h2 id="variables" className="text-h2">{monitorTitle(variables, scenario)}</h2>
                <p className="text-small text-ink-muted">Línea sólida: observado · punteada: supuesto de la revisión. Elija una variable para ver su relación con la demanda.</p>
              </div>
              <SegmentedControl
                ariaLabel="Escenario"
                value={scenario}
                onChange={(s) => setParam('escenario', s === 'mid' ? null : s)}
                options={SCENARIOS.map((s) => ({ value: s, label: SCENARIO_LABEL[s] }))}
              />
            </div>
            <DataTable
              caption={`Variables exógenas de ${product.name.toLowerCase()}`}
              columns={columns}
              rows={variables}
              rowKey={(v) => v.code}
              selected={(v) => v.code === selected?.code}
              onSelect={(v) => setParam('variable', v.code)}
            />
            {illustrative && (
              <p className="px-6 py-4 border-t border-line text-small text-ink-muted">
                Cifras ilustrativas. El estado usa umbrales de ejemplo hasta definirlos (X-03); impacto y correlación llegarán calculados con cada revisión.
              </p>
            )}
          </section>

          {selected && correlationOption && (
            <ChartCard
              title={correlationTitle(selected)}
              subtitle={`${selected.name} frente a la demanda de ${product.name.toLowerCase()} · correlación móvil de 24 meses, con intervalo de confianza del 95 %. Reporte vivo: se recalcula con cada dato nuevo.`}
              option={correlationOption}
              table={{
                headers: ['Mes', 'Correlación', 'Límite inferior (95 %)', 'Límite superior (95 %)'],
                rows: selected.rolling.map((p) => [p.period, p.value, p.low, p.high]),
              }}
              download={{ context: product.key, version: revisionLabel(data.revisionCode), content: `correlacion ${selected.code}`, source: `${selected.source}, ${data.demandSource}`, cutoff: data.cutoff }}
              decimals={2}
              illustrative={illustrative}
            />
          )}

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {importanceOption && data.importance ? (
              <ChartCard
                title={((top) => `${top.name} es la variable que más pesa en el modelo (${formatPercent(top.share, { decimals: 0 })})`)([...data.importance].sort((a, b) => b.share - a.share)[0])}
                subtitle={`Importancia relativa de cada variable (SHAP), en % · ${data.model}`}
                option={importanceOption}
                table={{ headers: ['Variable', 'Importancia (%)'], rows: [...data.importance].sort((a, b) => b.share - a.share).map((i) => [i.name, i.share]) }}
                download={{ context: product.key, version: data.model, content: 'importancia de variables', source: 'UPME', cutoff: data.cutoff }}
                decimals={0}
                height={300}
                illustrative={illustrative}
              />
            ) : (
              <EmptyState title="Importancia no disponible para este modelo" description={`El modelo ${data.model} no tiene importancia de variables calculada.`} />
            )}
          </div>
        </>
      )}
    </AppPage>
  );
}
