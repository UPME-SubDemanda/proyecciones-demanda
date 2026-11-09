import { useMemo } from 'react';
import { ErrorState } from '../../components/ErrorState/ErrorState';
import { KpiCard } from '../../components/KpiCard/KpiCard';
import { Skeleton } from '../../components/Skeleton/Skeleton';
import { EChart } from '../../components/charts/EChart';
import { dailyBarsOption, dailyComparisonOption } from '../../components/charts/kioskCharts';
import { useSystemToday } from '../../data/queries';
import { formatPercent, monthName } from '../../lib/format';
import { icons } from '../../lib/icons';
import { KioskHeader, NoFilters, Panel } from './KioskParts';
import { dailyTitle } from './kioskData';

export function KioskSystemHeader() {
  return <KioskHeader icon={icons.realVsEstimated} tone="gn" title="El sistema hoy" subtitle="Demanda diaria de los últimos 30 días" />;
}

/** Tablero «El sistema hoy» (mockup `modo-pantalla-el-sistema-hoy.png`): demanda diaria reciente de energía y gas. */
export function KioskSystemBoard() {
  const today = useSystemToday();
  const data = today.data?.data;
  const year = data ? Number(data.lastDay.slice(0, 4)) : 0;

  const energyOption = useMemo(
    () => data && dailyComparisonOption({
      current: data.energyDaily,
      previous: data.energyPrevYear,
      currentLabel: String(year),
      previousLabel: `Mismo día ${year - 1}`,
      product: 'ee',
    }),
    [data, year],
  );
  const gasOption = useMemo(() => data && dailyBarsOption({ points: data.gasDaily, unit: 'GBTUD', product: 'gn' }), [data]);

  if (today.isError) return <ErrorState title="No se pudo cargar la demanda diaria" description="Se reintentará en unos minutos." />;
  if (!data || !energyOption || !gasOption) return <Skeleton height={860} label="Cargando demanda diaria" />;

  return (
    <div className="h-full flex flex-col gap-6">
      <NoFilters />

      <div className="grid grid-cols-4 gap-6">
        <KpiCard label="Demanda de energía ayer" value={data.energyYesterday} unit="GWh" provenance={`${formatPercent(data.energyVsLastYear, { signed: true })} frente al mismo día de ${year - 1}`} />
        <KpiCard label="Demanda máxima de potencia ayer" value={data.peakPowerMW} unit="MW" provenance={`A las ${data.peakTime}`} />
        <KpiCard label="Demanda de gas natural ayer" value={data.gasYesterday} unit="GBTUD" provenance={`${formatPercent(data.gasVsMonthAverage, { signed: true })} frente al promedio del mes`} />
        <KpiCard label={`Acumulado ${year} de energía`} value={data.energyYearToDate} unit="GWh" provenance={`Enero a ${monthName(data.lastDay)}`} />
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-3 gap-6">
        <Panel
          className="col-span-2"
          title={dailyTitle(data.energyDaily, data.energyPrevYear, data.lastDay)}
          subtitle={`Demanda diaria del SIN (XM) · los fines de semana bajan cerca de ${formatPercent(data.weekendDrop, { decimals: 0 })}`}
        >
          <EChart option={energyOption} height={430} dark ariaLabel="Demanda diaria de energía frente al mismo día del año anterior" />
        </Panel>

        <div className="flex flex-col gap-6 min-h-0">
          <Panel className="flex-1" title="Gas natural por día" subtitle="Demanda nacional, GBTUD">
            <EChart option={gasOption} height={190} dark ariaLabel="Demanda diaria de gas natural" />
          </Panel>

          <Panel className="flex-1" title="Explore más datos" subtitle="Escanee el código para abrir el portal en su celular">
            <div className="flex items-center gap-6 pt-2">
              {/* Marcador: el código QR y la dirección del portal están por definir (X-11). */}
              <div className="w-40 h-40 shrink-0 rounded-md bg-ink text-surface flex items-center justify-center text-small font-bold text-center p-2">
                [Código QR al portal]
              </div>
              <div>
                <p className="text-h3">[Dirección del portal por definir]</p>
                <p className="text-body text-ink-muted">Proyecciones, datos abiertos, simulador y metodología.</p>
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
