/**
 * Galería de componentes base, SOLO EN DESARROLLO (`/dev/componentes`, no existe en producción).
 * Sirve para revisar los componentes en tema claro y oscuro antes de usarlos en una vista.
 * No es una vista del producto: no lleva página en el inventario.
 */
import { useEffect, useMemo, useState } from 'react';
import { Badge, IllustrativeBadge } from '../components/Badge/Badge';
import { Button } from '../components/Button/Button';
import { ChartCard } from '../components/ChartCard/ChartCard';
import { EmptyState } from '../components/EmptyState/EmptyState';
import { ErrorState } from '../components/ErrorState/ErrorState';
import { KpiCard } from '../components/KpiCard/KpiCard';
import { ProductIcon } from '../components/ProductIcon/ProductIcon';
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
        <h2 className="text-h2">PublicHeader y PublicFooter (portal, siempre tema claro)</h2>
        <div className="border border-line rounded-md overflow-hidden">
          <PublicHeader
            siteName="Proyecciones de demanda de energía"
            items={[{ label: 'Inicio', href: '#', active: true }, { label: 'Proyecciones', href: '#proyecciones' }]}
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
