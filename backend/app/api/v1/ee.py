"""Datos reales de energía eléctrica para las vistas (T-37, issue #40). Provisional: no es el contrato público (T-33).

Solo lectura sobre las vistas de core (docs/tecnica/base-de-datos/vistas.md). No pide ingreso: son datos publicables,
revisiones publicadas por la UPME y datos de XM, que también muestran el portal y el modo pantalla.

Decisiones provisionales del issue #40 (docs/pendientes.md, T-37):
- serie: solo la comparable (core.series.is_comparable, PER-01: SIN+GCE+ME+GD_UPME), energía, SIN;
- «escenario bajo» y «alto» son los límites del intervalo de confianza del 68 %;
- dato real: la variable oficial para el error (core.variables.is_official_for_error, PER-01: DemaSIN);
- indicadores: los que ya usan las vistas, calculados sobre core.v_ee_revision_vs_real; umbral ilustrativo (X-03).
"""
from __future__ import annotations

from datetime import date, timedelta
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.db.session import get_db

router = APIRouter(prefix="/ee", tags=["energía eléctrica"])
DB = Annotated[Session, Depends(get_db)]

PRODUCT = "ee"
REGION = "SIN"
UNIT = "GWh"
SOURCE = "XM"
THRESHOLD = 1.5  # ± % aceptable: ilustrativo hasta X-03
DAILY_DAYS = 30
PARTIAL_DAY = 0.5  # un día por debajo de la mitad de la mediana de la semana anterior es un día que XM aún no completa

# Serie comparable y variable oficial del error: las marcas viven en los catálogos (PER-01), no en el código.
SERIES = "(SELECT code FROM core.series WHERE is_comparable AND product = 'ee' LIMIT 1)"
REAL = ("(SELECT code FROM core.variables WHERE product = 'ee' AND measure = 'ee_energy' "
        "AND is_official_for_error LIMIT 1)")


class Schema(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)


class Point(Schema):
    period: str
    value: float


class ObservedSeries(Schema):
    product: str
    frequency: str
    region: str
    unit: str
    source: str
    cutoff: str
    points: list[Point]


class Revision(Schema):
    id: int
    product: str
    code: str
    published_on: str
    cutoff: str
    model: str
    status: str
    is_current: bool


class Scenarios(Schema):
    low: list[Point]
    mid: list[Point]
    high: list[Point]


class RevisionValues(Schema):
    revision_id: int
    frequency: str
    region: str
    unit: str
    scenarios: Scenarios


class RevisionPerformance(Schema):
    revision_id: int
    monthly_deviation: list[Point]
    year_to_date: float
    threshold: float
    mape12: float
    error12: float | None


class SystemTodayEnergy(Schema):
    last_day: str
    energy_daily: list[Point]
    energy_prev_year: list[Point]
    energy_yesterday: float
    energy_vs_last_year: float
    energy_year_to_date: float
    weekend_drop: float


def short_model(text_: str) -> str:
    """Nombre corto del modelo para las vistas: lo que va antes de «:» o «(». El texto completo, con la página del
    informe (PFU-03), está en core.revisions.model y en docs/tecnica/modelos/."""
    if text_.lower().startswith("por confirmar"):
        return "Modelo por confirmar"
    return text_.split(":")[0].split("(")[0].strip()


def month(d: date) -> str:
    return d.isoformat()[:7]


@router.get("/observed", response_model=ObservedSeries, response_model_by_alias=True)
def observed(db: DB) -> ObservedSeries:
    """Dato real anual: solo años completos (el año en curso no se muestra como un año entero)."""
    rows = db.execute(text(f"""
        SELECT extract(year FROM period)::int AS year, sum(value) AS value, bool_and(is_complete) AND count(*) = 12
          FROM core.observed_monthly
         WHERE variable = {REAL} AND geography = 'ee_sin' AND source_frequency = 'D'
         GROUP BY 1 ORDER BY 1""")).all()
    cutoff = db.execute(text(f"""
        SELECT max(period) FROM core.observed_monthly
         WHERE variable = {REAL} AND geography = 'ee_sin' AND source_frequency = 'D' AND is_complete""")).scalar()
    points = [Point(period=str(y), value=round(float(v), 1)) for y, v, complete in rows if complete]
    return ObservedSeries(product=PRODUCT, frequency="A", region=REGION, unit=UNIT, source=SOURCE,
                          cutoff=month(cutoff) if cutoff else "", points=points)


@router.get("/revisions", response_model=list[Revision], response_model_by_alias=True)
def revisions(db: DB) -> list[Revision]:
    """Revisiones publicadas, de la más antigua a la vigente (la última publicada)."""
    rows = db.execute(text("""
        SELECT id, code, published_on, data_cutoff, model, status FROM core.revisions
         WHERE product = 'ee' AND status IN ('published', 'superseded')
         ORDER BY published_on, code""")).all()
    current = max((r for r in rows if r.status == "published"), key=lambda r: (r.published_on, r.code), default=None)
    return [Revision(id=r.id, product=PRODUCT, code=r.code, published_on=r.published_on.isoformat(),
                     cutoff=month(r.data_cutoff), model=short_model(r.model), status=r.status,
                     is_current=current is not None and r.id == current.id) for r in rows]


def _revision_or_404(db: Session, revision_id: int) -> None:
    found = db.execute(text("""SELECT 1 FROM core.revisions WHERE id = :id AND product = 'ee'
                                  AND status IN ('published', 'superseded')"""), {"id": revision_id}).first()
    if not found:
        raise HTTPException(404, f"No hay una revisión publicada de energía eléctrica con id {revision_id}.")


@router.get("/revisions/{revision_id}/values", response_model=RevisionValues, response_model_by_alias=True)
def revision_values(revision_id: int, db: DB) -> RevisionValues:
    """Valores anuales de la serie comparable: medio, y bajo y alto = límites del IC 68 % (provisional)."""
    _revision_or_404(db, revision_id)
    rows = db.execute(text(f"""
        SELECT extract(year FROM period)::int AS year, mid, ci68_lower, ci68_upper FROM core.v_revision_wide
         WHERE revision_id = :id AND series = {SERIES} AND measure = 'ee_energy' AND geography = 'ee_sin'
           AND frequency = 'A' AND mid IS NOT NULL
         ORDER BY period"""), {"id": revision_id}).all()

    def series(i: int) -> list[Point]:
        return [Point(period=str(r[0]), value=round(float(r[i] if r[i] is not None else r[1]), 1)) for r in rows]

    return RevisionValues(revision_id=revision_id, frequency="A", region=REGION, unit=UNIT,
                          scenarios=Scenarios(low=series(2), mid=series(1), high=series(3)))


@router.get("/revisions/{revision_id}/performance", response_model=RevisionPerformance,
            response_model_by_alias=True)
def revision_performance(revision_id: int, db: DB) -> RevisionPerformance:
    """Desempeño frente al dato real, en meses reales completos (core.v_ee_revision_vs_real). Provisional (X-25).

    - desviación mensual y año corrido: (real − proyectado) / proyectado, en % (como las vistas: negativo = la
      demanda real va por debajo);
    - mape12 y error12: error de PER-01, (proyectado − real) / real, en los primeros 12 meses proyectados
      (positivo = sobreestimó). error12 es nulo si aún no hay 12 meses; mape12 usa los que haya.
    """
    _revision_or_404(db, revision_id)
    rows = db.execute(text("""
        SELECT period, months_ahead, projected, real, error_pct FROM core.v_ee_revision_vs_real
         WHERE revision_id = :id AND real_is_complete ORDER BY period"""), {"id": revision_id}).all()
    deviation = [Point(period=month(r.period), value=round(float((r.real - r.projected) / r.projected * 100), 2))
                 for r in rows[-12:]]
    current_year = rows[-1].period.year if rows else None
    ytd = [r for r in rows if r.period.year == current_year]
    year_to_date = (float((sum(r.real for r in ytd) - sum(r.projected for r in ytd)) / sum(r.projected for r in ytd)
                          * 100) if ytd else 0.0)
    first12 = [float(r.error_pct) for r in rows if r.months_ahead <= 12]
    return RevisionPerformance(
        revision_id=revision_id, monthly_deviation=deviation, year_to_date=round(year_to_date, 2),
        threshold=THRESHOLD,
        mape12=round(sum(abs(e) for e in first12) / len(first12), 2) if first12 else 0.0,
        error12=round(sum(first12) / 12, 2) if len(first12) == 12 else None,
    )


def last_complete_day(days: list[tuple[date, float]]) -> date:
    """Último día que no parece incompleto. XM publica el último día a medias (el 2026-11-10 entregó 0,6 GWh para el
    día anterior) y lo completa después. Mientras no existan las reglas de anomalía (T-29, X-24), se omiten al final
    los días por debajo de la mitad de la mediana de los 7 anteriores."""
    end = len(days)
    while end > 7:
        previous = sorted(v for _, v in days[end - 8:end - 1])
        if days[end - 1][1] >= PARTIAL_DAY * previous[len(previous) // 2]:
            break
        end -= 1
    return days[end - 1][0]


@router.get("/system-today", response_model=SystemTodayEnergy, response_model_by_alias=True)
def system_today(db: DB) -> SystemTodayEnergy:
    """Demanda diaria reciente del SIN (`DemaSIN`): últimos 30 días frente al mismo día de la semana del año anterior.

    Solo energía: la potencia máxima de ayer y el gas siguen ilustrativos en la vista (supuesto 5 del issue #40).
    """
    recent = db.execute(text(f"""SELECT period::date, value FROM core.observed_current
                                   WHERE variable = {REAL} AND geography = 'ee_sin' AND frequency = 'D'
                                   ORDER BY period DESC LIMIT 14""")).all()
    if not recent:
        raise HTTPException(404, "No hay datos diarios de energía cargados.")
    last = last_complete_day([(d, float(v)) for d, v in reversed(recent)])
    start = last - timedelta(days=DAILY_DAYS - 1)
    values = dict(db.execute(text(f"""
        SELECT period::date, value FROM core.observed_current
         WHERE variable = {REAL} AND geography = 'ee_sin' AND frequency = 'D'
           AND (period::date BETWEEN :start AND :last
                OR period::date BETWEEN :start - 364 AND :last - 364
                OR period::date BETWEEN make_date(extract(year FROM :last)::int, 1, 1) AND :last)"""),
        {"start": start, "last": last}).all())
    days = [start + timedelta(days=i) for i in range(DAILY_DAYS)]
    current = [Point(period=d.isoformat(), value=round(float(values[d]), 2)) for d in days if d in values]
    # Mismo día de la semana del año anterior (364 días antes), con la fecha de este año para alinear el gráfico.
    previous = [Point(period=d.isoformat(), value=round(float(values[d - timedelta(days=364)]), 2))
                for d in days if d - timedelta(days=364) in values]
    yesterday, before = values.get(last), values.get(last - timedelta(days=364))
    weekend = [float(values[d]) for d in days if d in values and d.weekday() >= 5]
    weekday = [float(values[d]) for d in days if d in values and d.weekday() < 5]
    drop = (1 - (sum(weekend) / len(weekend)) / (sum(weekday) / len(weekday))) * 100 if weekend and weekday else 0
    ytd = sum(float(v) for d, v in values.items() if d.year == last.year and d <= last)
    return SystemTodayEnergy(
        last_day=last.isoformat(), energy_daily=current, energy_prev_year=previous,
        energy_yesterday=round(float(yesterday), 1),
        energy_vs_last_year=round((float(yesterday) - float(before)) / float(before) * 100, 1) if before else 0.0,
        energy_year_to_date=round(ytd, 0), weekend_drop=round(drop, 0),
    )
