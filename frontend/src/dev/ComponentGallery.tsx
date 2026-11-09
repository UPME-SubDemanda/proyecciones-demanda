/**
 * Galería de componentes base, SOLO EN DESARROLLO (`/dev/componentes`, no existe en producción).
 * Sirve para revisar los componentes en tema claro y oscuro antes de usarlos en una vista.
 * No es una vista del producto: no lleva página en el inventario.
 */
import { useEffect, useMemo, useState } from 'react';
import { AlertItem } from '../components/AlertItem/AlertItem';
import { Badge, IllustrativeBadge } from '../components/Badge/Badge';
import { Banner } from '../components/Banner/Banner';
import { Button } from '../components/Button/Button';
import { ChartCard } from '../components/ChartCard/ChartCard';
import { EmptyState } from '../components/EmptyState/EmptyState';
import { ErrorState } from '../components/ErrorState/ErrorState';
import { KpiCard } from '../components/KpiCard/KpiCard';
import { Chip } from '../components/Chip/Chip';
import { DataTable } from '../components/DataTable/DataTable';
import { ProductIcon } from '../components/ProductIcon/ProductIcon';
import { RangeSlider } from '../components/RangeSlider/RangeSlider';
import { SideNav } from '../components/SideNav/SideNav';
import { UserMenu } from '../components/UserMenu/UserMenu';
import { VersionSelect } from '../components/VersionSelect/VersionSelect';
import { PublicFooter } from '../components/PublicFooter/PublicFooter';
import { PublicHeader } from '../components/PublicHeader/PublicHeader';
import { SegmentedControl } from '../components/SegmentedControl/SegmentedControl';
import { Skeleton } from '../components/Skeleton/Skeleton';
import { projectionChartOption, projectionTable } from '../components/charts/projectionChart';
import { useObservedSeries, useRevisions, useRevisionValues } from '../data/queries';
import { formatMonth, formatProvenance, revisionLabel } from '../lib/format';
import { icons } from '../lib/icons';
import { PRODUCT_KEYS, PRODUCTS, useProduct } from '../lib/product';

export function ComponentGallery() {
  const [dark, setDark] = useState(false);
  const [version, setVersion] = useState('2026-07');
  const [range, setRange] = useState<[number, number]>([2015, 2035]);
  const [chips, setChips] = useState(['low', 'mid', 'high']);
  const [product, setProduct] = useProduct();
  const observed = useObservedSeries(product.key);
  const revisions = useRevisions(product.key);
  const current = revisions.data?.data.find((r) => r.isCurrent);
  const values = useRevisionValues(current?.id);

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    return () => { delete document.documentElement.dataset.theme; };
  }, [dark]);

  const isEE = product.key === 'ee';
  const chartInput = useMemo(() => {
    if (!observed.data || !values.data || !current) return null;
    return {
      product: product.key,
      observed: observed.data.data.points,
      projection: values.data.data,
      projectionLabel: `Vigente ${revisionLabel(current.code).replace('Revisión ', '')}`,
      cutoff: { period: observed.data.data.points.at(-1)!.period, label: `Corte ${formatMonth(observed.data.data.cutoff)}` },
      unit: isEE ? 'TWh/año' : 'GBTUD',
      divisor: isEE ? 1000 : 1,
      dark,
      scenarioLabels: true,
    };
  }, [observed.data, values.data, current, product.key, isEE, dark]);
  const option = useMemo(() => (chartInput ? projectionChartOption(chartInput) : null), [chartInput]);
  const illustrative = observed.data?.illustrative ?? true;

  return (
    <main className="max-w-[1280px] mx-auto p-6 flex flex-col gap-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-h1">Galería de componentes</h1>
          <p className="text-small text-ink-muted">Solo en desarrollo · T-05 (#8) · <IllustrativeBadge /></p>
        </div>
        <div className="flex gap-2 items-center">
          <SegmentedControl
            ariaLabel="Producto"
            value={product.key}
            onChange={setProduct}
            options={PRODUCT_KEYS.map((k) => ({ value: k, label: PRODUCTS[k].name, icon: icons[k] }))}
          />
          <SegmentedControl
            ariaLabel="Tema"
            value={dark ? 'dark' : 'light'}
            onChange={(v) => setDark(v === 'dark')}
            options={[{ value: 'light', label: 'Claro' }, { value: 'dark', label: 'Oscuro' }]}
          />
        </div>
      </header>

      <section className="flex flex-col gap-3">
        <h2 className="text-h2">Button</h2>
        <div className="flex flex-wrap gap-3">
          <Button variant="primary">Abrir revisión extraordinaria</Button>
          <Button icon={icons.download}>Descargar informe</Button>
          <Button variant="ghost">Ver alertas</Button>
          <Button variant="danger">Retirar modelo</Button>
          <Button size="sm">Datos</Button>
          <Button size="touch">Descargar datos (táctil, 44 px)</Button>
          <Button disabledReason="Necesita el rol modeler">Ejecutar proyección</Button>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-h2">Badge y ProductIcon</h2>
        <div className="flex flex-wrap gap-3 items-center">
          <Badge tone="success">Publicada</Badge>
          <Badge tone="info">En revisión</Badge>
          <Badge tone="warning">Borrador</Badge>
          <Badge tone="critical">Fuera de umbral</Badge>
          <Badge>Retirado</Badge>
          <Badge tone="ee">EE</Badge>
          <Badge tone="gn">GN</Badge>
          <IllustrativeBadge />
          <ProductIcon product="ee" />
          <ProductIcon product="gn" size={60} />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-h2">KpiCard</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <KpiCard
            label={`Demanda ${product.short} 2026 proyectada (esc. medio)`}
            value={isEE ? 85600 : 1042}
            unit={product.unit}
            change="+2,9 % frente a 2025"
            provenance={current ? formatProvenance({ version: revisionLabel(current.code), method: current.model }) : undefined}
            illustrative={illustrative}
          />
          <KpiCard label="Error año corrido" value={-1.8} decimals={1} signed unit="%" change="Fuera de umbral ±1,5 %" changeTone="bad"
            provenance={formatProvenance({ cutoff: '2026-09', source: 'XM' })} illustrative={illustrative} />
          <KpiCard label="Error año corrido GN" value={0.6} decimals={1} signed unit="%" change="Dentro de umbral ±2 %" changeTone="good"
            provenance={formatProvenance({ cutoff: '2026-09', source: 'GMG' })} illustrative={illustrative} />
          <KpiCard leading={<ProductIcon product={product.key} decorative />} label={`${product.name} 2026`} value={isEE ? 85600 : 1042}
            unit={product.unit} change="+2,9 % frente a 2025" illustrative={illustrative} />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-h2">ChartCard · real vs. proyección</h2>
        {option && chartInput && current ? (
          <ChartCard
            title={isEE ? 'La demanda real va por debajo de la proyección vigente' : 'La demanda de gas sigue cerca de la proyección vigente'}
            subtitle={`${product.name} · ${chartInput.unit} · ${revisionLabel(current.code)} · escenario medio con banda bajo–alto`}
            option={option}
            table={projectionTable(chartInput)}
            download={{ context: product.key, version: revisionLabel(current.code), content: 'real vs proyeccion', source: `${observed.data!.data.source}, UPME`, cutoff: observed.data!.data.cutoff }}
            illustrative={illustrative}
            dark={dark}
            decimals={isEE ? 1 : 0}
          />
        ) : (
          <Skeleton height={420} label="Cargando gráfico" />
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-h2">DataTable</h2>
        <div className="bg-surface-raised border border-line rounded-md">
          <DataTable
            caption="Revisiones de ejemplo"
            rowKey={(r) => r.code}
            highlight={(r) => r.current}
            rows={[
              { code: 'Jul-2026', model: 'EE-LP v3.2.0', mape: null as number | null, current: true },
              { code: 'Ene-2026', model: 'EE-LP v3.1.1', mape: 1.4, current: false },
              { code: 'Jul-2023', model: 'EE-LP v2.4.0', mape: 2.3, current: false },
            ]}
            columns={[
              { key: 'code', header: 'Revisión', rowHeader: true, render: (r) => r.code, sortValue: (r) => r.code },
              { key: 'model', header: 'Modelo', render: (r) => <span className="text-mono">{r.model}</span> },
              { key: 'mape', header: 'MAPE', numeric: true, render: (r) => (r.mape === null ? '—' : `${r.mape.toLocaleString('es-CO')} %`), sortValue: (r) => r.mape },
            ]}
          />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-h2">Banner y AlertItem</h2>
        <Banner
          title="La proyección vigente de energía eléctrica está fuera de umbral desde julio"
          action={<Button size="sm">Ver alertas</Button>}
        >
          La demanda real va 1,8 % por debajo de lo proyectado en 2026.
        </Banner>
        <AlertItem severity="high" product="ee" title="PIB observado 1,8 % vs. supuesto 3,0 % (escenario medio)" meta="Exógena vs. supuesto · 14 oct 2026" action={<Button size="sm">Ver variable</Button>} />
        <AlertItem severity="medium" product="gn" title="Probabilidad de El Niño 62 % para el próximo trimestre" meta="Evento climático · 10 oct 2026" action={<Button size="sm" disabledReason="En construcción">Ver monitor</Button>} />
        <AlertItem severity="low" product="ee" title="Nueva serie de PIB publicada por el DANE" meta="Fuente actualizada · 2 oct 2026" />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-h2">Filtros: VersionSelect, RangeSlider y Chip</h2>
        <div className="flex flex-wrap items-center gap-8">
          <VersionSelect
            label="Proyección"
            value={version}
            onChange={setVersion}
            options={[
              { value: '2026-07', label: 'Revisión jul-2026', current: true },
              { value: '2026-01', label: 'Revisión ene-2026' },
            ]}
          />
          <RangeSlider label="Rango" min={2010} max={2040} value={range} onChange={setRange} />
          <div className="flex gap-2">
            {[['low', 'Bajo'], ['mid', 'Medio'], ['high', 'Alto']].map(([k, label]) => (
              <Chip key={k} active={chips.includes(k)} onToggle={() => setChips((c) => (c.includes(k) ? c.filter((x) => x !== k) : [...c, k]))}>
                {label}
              </Chip>
            ))}
          </div>
        </div>
        <p className="text-small text-ink-muted">
          KioskShell ocupa toda la pantalla: se ve en <a className="text-primary underline" href="/pantalla">/pantalla</a>.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-h2">SideNav y UserMenu (app interna)</h2>
        <div className="flex flex-wrap items-start gap-8">
          <div className="h-[420px] border border-line rounded-md overflow-hidden">
            <SideNav
              appName="Proyecciones de demanda"
              activePath="/app"
              groups={[
                { items: [{ label: 'Inicio', path: '/app', icon: 'home' }] },
                { label: 'Proyecciones', items: [{ label: 'Histórico de revisiones', path: '/app/proyecciones/historico', icon: 'history' }] },
                { label: 'Operación', items: [{ label: 'Alertas', path: '/app/alertas', icon: 'alerts', count: 3 }] },
              ]}
            />
          </div>
          <UserMenu name="Subdirección de Demanda" email="demanda@upme.gov.co" roles={['viewer', 'modeler']} onLogout={() => {}} />
        </div>
        <p className="text-small text-ink-muted">
          AppShell (menú lateral + encabezado) ocupa toda la pantalla: se ve en <a className="text-primary underline" href="/app">/app</a> con sesión.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-h2">PublicHeader y PublicFooter (portal, siempre tema claro)</h2>
        <div className="border border-line rounded-md overflow-hidden">
          <PublicHeader
            siteName="Proyecciones de demanda de energía"
            items={[{ label: 'Inicio', href: '#', active: true }, { label: 'Proyecciones', href: '#proyecciones' }]}
            action={{ label: 'Ingresar', href: '#ingresar', icon: 'user' }}
          />
          <PublicFooter />
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <EmptyState title="No hay revisiones de gas natural" description="Cargue la primera revisión publicada desde Operación › Cargas de datos." />
        <ErrorState title="No se pudo cargar el dato real" description="El servicio de XM no respondió. Intente de nuevo en unos minutos." detail="GET /api/v1/series/ee → 503" />
        <Skeleton label="Cargando indicadores" />
      </section>
    </main>
  );
}
