import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Badge } from '../../components/Badge/Badge';
import { Button } from '../../components/Button/Button';
import { ChartCard } from '../../components/ChartCard/ChartCard';
import { DataTable, type Column } from '../../components/DataTable/DataTable';
import { ErrorState } from '../../components/ErrorState/ErrorState';
import { SegmentedControl } from '../../components/SegmentedControl/SegmentedControl';
import { Skeleton } from '../../components/Skeleton/Skeleton';
import { historyChartOption, historyTitle } from '../../components/charts/historyChart';
import { useObservedSeries, useRevisions, useRevisionsPerformance, useRevisionsValues } from '../../data/queries';
import { SCENARIO_LABEL, type Revision, type RevisionValues, type Scenario } from '../../data/types';
import { cssVar } from '../../lib/cssVar';
import { downloadFile, fileName, toCsv } from '../../lib/download';
import { formatMonth, formatPercent, revisionLabel } from '../../lib/format';
import { icons } from '../../lib/icons';
import { useProduct } from '../../lib/product';
import { AppPage } from './AppPage';

const SCENARIOS: Scenario[] = ['low', 'mid', 'high'];
const COMPARE_IN_PROGRESS = 'La vista comparar revisiones está en construcción';
const DOCUMENT_PENDING = 'Documento oficial por cargar';

type Row = { revision: Revision; values?: RevisionValues; mape: number; error12: number | null };

function parseScenario(value: string | null): Scenario {
  return SCENARIOS.includes(value as Scenario) ? (value as Scenario) : 'mid';
}

/** «Jul-2026» para la tabla. */
function codeLabel(code: string): string {
  const m = formatMonth(code);
  return m.charAt(0).toUpperCase() + m.slice(1);
}

/** Histórico de revisiones (T-10): cómo cambiaron las revisiones publicadas y qué tan acertada fue cada una. */
export function RevisionHistory() {
  const [product] = useProduct();
  const [params, setParams] = useSearchParams();
  const scenario = parseScenario(params.get('escenario'));
  const selectedCode = params.get('revision') ?? undefined;
  const [query, setQuery] = useState('');
  const [compare, setCompare] = useState<string[]>([]);

  const observed = useObservedSeries(product.key);
  const revisions = useRevisions(product.key);
  const list = useMemo(() => [...(revisions.data?.data ?? [])].reverse(), [revisions.data]); // más reciente primero
  const ids = list.map((r) => r.id);
  const values = useRevisionsValues(ids);
  const perf = useRevisionsPerformance(ids);
  const isEE = product.key === 'ee';
  const unit = isEE ? 'TWh/año' : 'GBTUD';
  const divisor = isEE ? 1000 : 1;

  const setParam = (key: string, value: string | null) =>
    setParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value) next.set(key, value); else next.delete(key);
      return next;
    }, { replace: true, preventScrollReset: true });

  const rows: Row[] = useMemo(
    () => list.map((revision, i) => ({
      revision,
      values: values.data?.data[i],
      mape: perf.data?.data[i]?.mape12 ?? 0,
      error12: perf.data?.data[i]?.error12 ?? null,
    })),
    [list, values.data, perf.data],
  );

  const option = useMemo(() => {
    if (!observed.data || !values.data) return null;
    const last = Number(observed.data.data.points.at(-1)!.period);
    return historyChartOption({
      product: product.key,
      observed: observed.data.data.points,
      revisions: rows.filter((r) => r.values).map((r) => ({
        code: r.revision.code,
        label: formatMonth(r.revision.code),
        points: r.values!.scenarios[scenario],
        current: r.revision.isCurrent,
      })),
      selected: selectedCode,
      selectedColor: cssVar('--primary', 'currentColor'),
      unit,
      divisor,
      range: [last - 7, last + 5],
    });
  }, [observed.data, values.data, rows, scenario, selectedCode, product.key, unit, divisor]);

  const filtered = rows.filter((r) => {
    const q = query.trim().toLowerCase();
    return !q || formatMonth(r.revision.code).includes(q) || r.revision.code.includes(q) || r.revision.model.toLowerCase().includes(q);
  });

  const revisionCsv = (r: Row) => {
    if (!r.values) return;
    const meta = { context: product.key, version: revisionLabel(r.revision.code), content: 'escenarios', source: 'UPME', cutoff: r.revision.cutoff, illustrative: observed.data?.illustrative };
    const years = r.values.scenarios.mid.map((p) => p.period);
    downloadFile(fileName(meta, 'csv'), toCsv(meta, ['Año', 'Bajo', 'Medio', 'Alto'], years.map((y) => [
      y, ...SCENARIOS.map((s) => r.values!.scenarios[s].find((p) => p.period === y)?.value ?? null),
    ])));
  };
  const allCsv = () => {
    const meta = { context: product.key, version: 'todas', content: 'revisiones publicadas', source: 'UPME', illustrative: observed.data?.illustrative };
    const lines = rows.flatMap((r) => (r.values ? SCENARIOS.flatMap((s) => r.values!.scenarios[s].map((p) => [r.revision.code, r.revision.model, SCENARIO_LABEL[s], p.period, p.value])) : []));
    downloadFile(fileName(meta, 'csv'), toCsv(meta, ['Revisión', 'Modelo', 'Escenario', 'Año', `Valor (${product.unit})`], lines));
  };

  const columns: Column<Row>[] = [
    {
      key: 'comp',
      header: 'Comp.',
      render: (r) => (
        <input
          type="checkbox"
          aria-label={`Comparar ${revisionLabel(r.revision.code)}`}
          checked={compare.includes(r.revision.code)}
          onClick={(e) => e.stopPropagation()}
          onChange={() => setCompare((c) => (c.includes(r.revision.code) ? c.filter((x) => x !== r.revision.code) : [...c, r.revision.code]))}
          className="w-5 h-5 accent-primary"
        />
      ),
    },
    { key: 'code', header: 'Revisión', rowHeader: true, render: (r) => codeLabel(r.revision.code), sortValue: (r) => r.revision.code },
    { key: 'model', header: 'Modelo', render: (r) => <span className="text-mono">{r.revision.model}</span>, sortValue: (r) => r.revision.model },
    { key: 'status', header: 'Estado', render: (r) => (r.revision.isCurrent ? <Badge tone="info">Vigente</Badge> : <Badge>Histórica</Badge>) },
    {
      key: 'horizon',
      header: 'Horizonte',
      render: (r) => (r.values ? `${r.values.scenarios.mid[1]?.period ?? r.values.scenarios.mid[0].period}–${r.values.scenarios.mid.at(-1)!.period}` : '—'),
    },
    { key: 'cutoff', header: 'Corte de datos', numeric: true, render: (r) => formatMonth(r.revision.cutoff), sortValue: (r) => r.revision.cutoff },
    { key: 'error12', header: 'Error 12 meses', numeric: true, render: (r) => (r.error12 === null ? '—' : formatPercent(r.error12, { signed: true })), sortValue: (r) => r.error12 },
    { key: 'mape', header: 'MAPE', numeric: true, render: (r) => (r.revision.isCurrent ? '—' : formatPercent(r.mape)), sortValue: (r) => (r.revision.isCurrent ? null : r.mape) },
    {
      key: 'files',
      header: 'Archivos',
      render: (r) => (
        <span className="inline-flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="sm" disabledReason={DOCUMENT_PENDING}>Documento</Button>
          <Button variant="ghost" size="sm" onClick={() => revisionCsv(r)}>Datos</Button>
        </span>
      ),
    },
  ];

  const isError = observed.isError || revisions.isError || values.isError || perf.isError;
  const firstYear = list.at(-1)?.code.slice(0, 4);

  return (
    <AppPage
      title="Histórico de revisiones"
      subtitle={list.length ? `${product.name} · ${list.length} revisiones publicadas desde ${firstYear} · una cada 6 meses` : 'Cargando revisiones…'}
      actions={
        <>
          <Button icon={icons.download} onClick={allCsv}>Descargar todas</Button>
          <Button variant="primary" disabledReason={COMPARE_IN_PROGRESS}>
            {compare.length ? `Comparar ${compare.length} seleccionada${compare.length === 1 ? '' : 's'}` : 'Comparar seleccionadas'}
          </Button>
        </>
      }
    >
      {isError ? (
        <ErrorState title="No se pudieron cargar las revisiones" description="Intente de nuevo en unos minutos." />
      ) : !option || !observed.data || !perf.data ? (
        <Skeleton height={480} label="Cargando gráfico de revisiones" />
      ) : (
        <ChartCard
          title={historyTitle([...rows].reverse().map((r) => ({ year: r.revision.code.slice(0, 4), error12: r.error12 })))}
          subtitle={`Cada línea es una revisión publicada (escenario ${SCENARIO_LABEL[scenario].toLowerCase()}). Elija una revisión en la tabla para resaltarla; pase el cursor para ver el error de cada año.`}
          option={option}
          table={{
            headers: ['Año', `Real (${unit})`, ...rows.map((r) => `${formatMonth(r.revision.code)} (${unit})`)],
            rows: [...new Set([...observed.data.data.points.map((p) => p.period), ...rows.flatMap((r) => r.values?.scenarios[scenario].map((p) => p.period) ?? [])])]
              .sort()
              .map((y) => [
                y,
                ((v) => (v === undefined ? null : v / divisor))(observed.data!.data.points.find((p) => p.period === y)?.value),
                ...rows.map((r) => {
                  const v = r.values?.scenarios[scenario].find((p) => p.period === y)?.value;
                  return v === undefined ? null : v / divisor;
                }),
              ]),
          }}
          download={{ context: product.key, version: 'todas', content: `historico ${SCENARIO_LABEL[scenario]}`, source: `${observed.data.data.source}, UPME`, cutoff: observed.data.data.cutoff }}
          controls={
            <SegmentedControl
              ariaLabel="Escenario"
              value={scenario}
              onChange={(s) => setParam('escenario', s === 'mid' ? null : s)}
              options={SCENARIOS.map((s) => ({ value: s, label: SCENARIO_LABEL[s] }))}
            />
          }
          decimals={isEE ? 1 : 0}
          illustrative={observed.data.illustrative}
        />
      )}

      <section aria-labelledby="revisiones" className="bg-surface-raised border border-line rounded-md">
        <div className="flex flex-wrap items-center justify-between gap-4 p-6">
          <h2 id="revisiones" className="text-h2">Revisiones publicadas</h2>
          <label className="flex items-center gap-3 text-body text-ink-muted">
            Buscar
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Revisión o versión de modelo"
              className="h-10 w-72 px-3 rounded-md border border-line-strong bg-surface-raised text-ink"
            />
          </label>
        </div>
        {!perf.data || !values.data ? (
          <div className="p-6"><Skeleton height={320} label="Cargando tabla de revisiones" /></div>
        ) : (
          <DataTable
            caption={`Revisiones publicadas de ${product.name.toLowerCase()}`}
            columns={columns}
            rows={filtered}
            rowKey={(r) => r.revision.code}
            highlight={(r) => r.revision.isCurrent}
            selected={(r) => r.revision.code === selectedCode && !r.revision.isCurrent}
            onSelect={(r) => setParam('revision', r.revision.isCurrent || r.revision.code === selectedCode ? null : r.revision.code)}
            empty="Ninguna revisión coincide con la búsqueda."
          />
        )}
      </section>

      <p className="p-4 rounded-md bg-surface-sunken border border-line text-body text-ink-muted">
        Las revisiones publicadas no se pueden editar. Para corregir una se crea una revisión nueva con nota de cambio, que queda en este
        historial (<strong className="text-ink">Crear corrección</strong>, en construcción).
      </p>
    </AppPage>
  );
}
