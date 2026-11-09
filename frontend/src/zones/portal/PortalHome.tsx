import { useEffect, useMemo } from 'react';
import { Badge } from '../../components/Badge/Badge';
import { ChartCard } from '../../components/ChartCard/ChartCard';
import { ErrorState } from '../../components/ErrorState/ErrorState';
import { KpiCard } from '../../components/KpiCard/KpiCard';
import { ProductIcon } from '../../components/ProductIcon/ProductIcon';
import { PublicFooter } from '../../components/PublicFooter/PublicFooter';
import { PublicHeader } from '../../components/PublicHeader/PublicHeader';
import { SegmentedControl } from '../../components/SegmentedControl/SegmentedControl';
import { Skeleton } from '../../components/Skeleton/Skeleton';
import { projectionChartOption, projectionTable } from '../../components/charts/projectionChart';
import { useAccuracy, useObservedSeries, useRevisions, useRevisionValues } from '../../data/queries';
import { formatPercent, formatProvenance, revisionLabel } from '../../lib/format';
import { icons } from '../../lib/icons';
import { PRODUCT_KEYS, PRODUCTS, useProduct, type ProductKey } from '../../lib/product';
import { PHONE, useMediaQuery } from '../../lib/useMediaQuery';
import { change, growthTitle, lastObserved, valueAt } from './portalData';

const SITE_NAME = 'Proyecciones de demanda de energía';
const KIOSK_URL = '/pantalla';
/** Menú superior: solo las vistas que existen; se agregan a medida que salen (T-06). */
const NAV = [{ label: 'Inicio', href: '/', active: true }];

/** Secciones del portal que aún no existen: se muestran como «Próximamente», sin enlace. */
const UPCOMING = [
  { title: 'Datos abiertos', text: 'Descargue todas las series y revisiones en CSV o Excel, con diccionario de datos.' },
  { title: 'Simulador', text: 'Cambie el crecimiento del PIB o la temperatura y vea cómo cambiaría la demanda.' },
  { title: 'Metodología', text: 'Cómo construimos cada proyección, qué modelos usamos y sus límites.' },
  { title: 'API', text: 'Conecte sus sistemas a las proyecciones oficiales con nuestra API.' },
];

/** Año que se destaca en las tarjetas: el primero proyectado. */
function projectedYear(lastObservedPeriod: string): string {
  return String(Number(lastObservedPeriod) + 1);
}

/** Tarjeta de la demanda proyectada del año para un producto. */
function ProductKpi({ product }: { product: ProductKey }) {
  const info = PRODUCTS[product];
  const observed = useObservedSeries(product);
  const revisions = useRevisions(product);
  const current = revisions.data?.data.find((r) => r.isCurrent);
  const values = useRevisionValues(current?.id);

  if (observed.isError || revisions.isError || values.isError)
    return <ErrorState title={`No se pudo cargar ${info.name.toLowerCase()}`} description="Intente de nuevo en unos minutos." />;
  if (!observed.data || !values.data || !current) return <Skeleton label={`Cargando ${info.name.toLowerCase()}`} />;

  const last = lastObserved(observed.data.data.points);
  const year = projectedYear(last.period);
  const value = valueAt(values.data.data.scenarios.mid, year) ?? 0;
  return (
    <KpiCard
      leading={<ProductIcon product={product} size={48} decorative />}
      label={`${info.name} ${year}`}
      value={value}
      unit={info.unit}
      change={`${formatPercent(change(last.value, value), { signed: true })} frente a ${last.period}`}
      provenance={formatProvenance({ version: revisionLabel(current.code), method: 'escenario medio' })}
      illustrative={observed.data.illustrative}
    />
  );
}

function AccuracyKpi() {
  const accuracy = useAccuracy();
  if (accuracy.isError) return <ErrorState title="No se pudo cargar el acierto" description="Intente de nuevo en unos minutos." />;
  if (!accuracy.data) return <Skeleton label="Cargando acierto de las proyecciones" />;
  const { value, meanAbsError, horizonMonths } = accuracy.data.data;
  const Icon = icons.realVsEstimated;
  return (
    <KpiCard
      leading={
        <span className="inline-flex items-center justify-center w-12 h-12 rounded-pill bg-primary-soft text-primary" aria-hidden="true">
          <Icon width={28} height={28} />
        </span>
      }
      label="Acierto de nuestras proyecciones"
      value={value}
      decimals={1}
      unit="%"
      change={`Error medio de ${formatPercent(meanAbsError)} a ${horizonMonths} meses`}
      provenance="Revisiones publicadas frente al dato real"
      illustrative={accuracy.data.illustrative}
    />
  );
}

function ProjectionSection() {
  const [product, setProduct] = useProduct();
  const observed = useObservedSeries(product.key);
  const revisions = useRevisions(product.key);
  const current = revisions.data?.data.find((r) => r.isCurrent);
  const values = useRevisionValues(current?.id);
  const isEE = product.key === 'ee';
  const phone = useMediaQuery(PHONE);

  const input = useMemo(() => {
    if (!observed.data || !values.data) return null;
    return {
      product: product.key,
      observed: observed.data.data.points,
      projection: values.data.data,
      projectionLabel: 'Medio',
      unit: isEE ? 'TWh/año' : 'GBTUD',
      divisor: isEE ? 1000 : 1,
      scenarioLabels: true,
      compact: phone,
    };
  }, [observed.data, values.data, product.key, isEE, phone]);
  const option = useMemo(() => (input ? projectionChartOption(input) : null), [input]);

  if (observed.isError || revisions.isError || values.isError)
    return <ErrorState title="No se pudo cargar la proyección" description="Intente de nuevo en unos minutos." />;
  if (!input || !option || !current || !observed.data) return <Skeleton height={480} label="Cargando gráfico de la proyección" />;

  const region = observed.data.data.region === 'SIN' ? 'Sistema Interconectado Nacional' : 'Total nacional';
  return (
    <ChartCard
      title={growthTitle(product.key, input.observed, input.projection)}
      subtitle={`${region} · ${revisionLabel(current.code)} · escenarios bajo, medio y alto`}
      option={option}
      table={projectionTable(input)}
      download={{
        context: product.key,
        version: revisionLabel(current.code),
        content: 'proyeccion',
        source: `UPME con datos de ${observed.data.data.source}`,
        cutoff: observed.data.data.cutoff,
      }}
      controls={
        <>
          <SegmentedControl
            ariaLabel="Producto del gráfico"
            size="touch"
            value={product.key}
            onChange={setProduct}
            options={PRODUCT_KEYS.map((k) => ({ value: k, label: PRODUCTS[k].name }))}
          />
          {/* Acceso discreto al modo pantalla; en teléfonos no se muestra (T-07, #15). */}
          <a href={KIOSK_URL} className="hidden lg:inline-flex items-center h-11 px-2 text-body font-bold text-primary hover:underline">
            Ver en modo pantalla →
          </a>
        </>
      }
      actionSize="touch"
      height={phone ? 300 : 360}
      decimals={isEE ? 1 : 0}
      illustrative={observed.data.illustrative}
    />
  );
}

/** Inicio del portal público (T-06). Zona portal: siempre tema claro (LAY-01). */
export function PortalHome() {
  useEffect(() => {
    document.title = `Inicio · ${SITE_NAME} · UPME`; // título único por vista (A11-08)
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <a href="#contenido" className="sr-only focus:not-sr-only focus:p-4">Saltar al contenido</a>
      {/* «Ingresar» lleva a la app interna; sin sesión pasa por /ingresar (T-08, #17). */}
      <PublicHeader siteName={SITE_NAME} items={NAV} action={{ label: 'Ingresar', href: '/app', icon: 'user' }} />

      <main id="contenido" className="flex-1 w-full max-w-[1200px] mx-auto px-6 py-12 flex flex-col gap-12">
        <section className="flex flex-col gap-4 max-w-[760px]">
          <span className="block w-16 h-1 rounded-pill bg-brand" aria-hidden="true" />
          <h1 className="text-display">¿Cuánta energía y gas usará Colombia?</h1>
          <p className="text-body text-ink-muted">
            Proyecciones oficiales de la Unidad de Planeación Minero Energética (UPME), actualizadas cada seis meses
            y comparadas con lo que realmente pasó.
          </p>
        </section>

        <section aria-label="Cifras principales" className="grid gap-4 md:grid-cols-3">
          <ProductKpi product="ee" />
          <ProductKpi product="gn" />
          <AccuracyKpi />
        </section>

        <ProjectionSection />

        <section aria-labelledby="proximamente" className="flex flex-col gap-4">
          <h2 id="proximamente" className="text-h2">Más información</h2>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {UPCOMING.map((item) => (
              <li key={item.title} className="flex flex-col gap-2 p-6 bg-surface-raised border border-line rounded-md">
                <h3 className="text-h3">{item.title}</h3>
                <p className="text-small text-ink-muted flex-1">{item.text}</p>
                <Badge className="self-start">Próximamente</Badge>
              </li>
            ))}
          </ul>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
