"""API de datos reales de EE (T-37, issue #40) contra PostgreSQL (PBD-04).

Cada prueba corre en una transacción que se revierte al final, con revisiones y datos de 2098 y 2099 para no chocar
con los datos reales de la base de desarrollo. Las respuestas pueden traer también esos datos reales: las pruebas
solo miran lo que crearon.
"""
import os
from datetime import date, timedelta

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.main import app

URL = os.environ.get("TEST_POSTGRES_URL", "")
pytestmark = pytest.mark.skipif(not URL, reason="sin TEST_POSTGRES_URL: pruebas de la base solo con PostgreSQL")

SERIES = "ee_sin_gce_me_gd_upme"  # la serie comparable (PER-01)


@pytest.fixture()
def db():
    engine = create_engine(URL.replace("postgresql://", "postgresql+psycopg://", 1))
    with engine.connect() as conn:
        trans = conn.begin()
        session = Session(bind=conn)
        app.dependency_overrides[get_db] = lambda: session
        try:
            yield session
        finally:
            app.dependency_overrides.pop(get_db, None)
            session.close()
            trans.rollback()
    engine.dispose()


@pytest.fixture()
def api(db):
    return TestClient(app)


def revision(db, code, published_on, first_month, annual=None, monthly=None, series=SERIES):
    """Revisión con valores: medio, IC 68 % = ±5 e IC 95 % = ±10."""
    rev_id = db.execute(text("""
        INSERT INTO core.revisions (product, code, name, published_on, data_cutoff, first_projected_period, model,
                                    document_url, status, source)
        VALUES ('ee', :code, :name, :pub, :cut, :first, 'Modelo de prueba', 'https://www.upme.gov.co', 'published',
                'upme_annex') RETURNING id"""),
        {"code": code, "name": f"Rev. {code}", "pub": published_on, "cut": first_month - timedelta(days=1),
         "first": first_month}).scalar()
    for frequency, values in (("A", annual or {}), ("M", monthly or {})):
        for period, mid in values.items():
            for value_type, delta in [("mid", 0), ("ci68_lower", -5), ("ci68_upper", 5), ("ci95_lower", -10),
                                      ("ci95_upper", 10)]:
                db.execute(text("""
                    INSERT INTO core.revision_values (revision_id, series, measure, geography, frequency, period,
                                                      value_type, value)
                    VALUES (:id, :series, 'ee_energy', 'ee_sin', :freq, :period, :type, :value)"""),
                    {"id": rev_id, "series": series, "freq": frequency, "period": period, "type": value_type,
                     "value": mid + delta})
    return rev_id


def demasin(db, start: date, days: int, value: float):
    for i in range(days):
        db.execute(text("""INSERT INTO core.observed_values (variable, geography, frequency, period, version, value,
                                                             quality_status)
                           VALUES ('xm_demasin', 'ee_sin', 'D', :p, 1, :v, 'accepted')"""),
                   {"p": start + timedelta(days=i), "v": value})


def test_revisions_are_listed_oldest_first_and_the_latest_published_is_current(db, api):
    revision(db, "2098-12", date(2098, 12, 31), date(2098, 10, 1))
    revision(db, "2099-07", date(2099, 7, 31), date(2099, 4, 1))
    mine = [r for r in api.get("/api/v1/ee/revisions").json() if r["code"].startswith("209")]
    assert [(r["code"], r["isCurrent"]) for r in mine] == [("2098-12", False), ("2099-07", True)]
    assert mine[1]["cutoff"] == "2099-03" and mine[1]["publishedOn"] == "2099-07-31"
    assert mine[1]["model"] == "Modelo de prueba"


def test_model_names_are_short_for_the_views():
    from app.api.v1.ee import short_model
    assert short_model("Combinación de pronósticos: VAR 22 % (pesos de 2023)") == "Combinación de pronósticos"
    assert short_model("Por confirmar con el informe de la revisión (X-32): el anexo no lo dice") == "Modelo por confirmar"


def test_values_use_the_comparable_series_with_low_and_high_as_the_68_interval(db, api):
    rev_id = revision(db, "2099-07", date(2099, 7, 31), date(2099, 4, 1), annual={date(2099, 1, 1): 300})
    revision(db, "2099-08", date(2099, 8, 31), date(2099, 4, 1), annual={date(2099, 1, 1): 999}, series="ee_sin")
    body = api.get(f"/api/v1/ee/revisions/{rev_id}/values").json()
    assert body["scenarios"] == {"low": [{"period": "2099", "value": 295}], "mid": [{"period": "2099", "value": 300}],
                                 "high": [{"period": "2099", "value": 305}]}


def test_performance_compares_complete_real_months(db, api):
    april, may = date(2099, 4, 1), date(2099, 5, 1)
    rev_id = revision(db, "2099-07", date(2099, 7, 31), april, monthly={april: 310, may: 320})
    demasin(db, april, 30, 10)  # abril completo: 300 GWh
    demasin(db, may, 20, 10)    # mayo incompleto: no cuenta
    body = api.get(f"/api/v1/ee/revisions/{rev_id}/performance").json()
    assert body["monthlyDeviation"] == [{"period": "2099-04", "value": pytest.approx(-3.23, abs=0.01)}]
    assert body["yearToDate"] == pytest.approx(-3.23, abs=0.01)  # (real − proyectado) / proyectado
    assert body["mape12"] == pytest.approx(3.33, abs=0.01)       # PER-01: (proyectado − real) / real
    assert body["error12"] is None and body["threshold"] == 1.5  # menos de 12 meses; umbral ilustrativo


def test_monthly_values_start_at_the_first_projected_month(db, api):
    april = date(2099, 4, 1)
    rev_id = revision(db, "2099-07", date(2099, 7, 31), april, annual={date(2099, 1, 1): 3600},
                      monthly={april: 300, date(2099, 5, 1): 310})
    body = api.get(f"/api/v1/ee/revisions/{rev_id}/values?frequency=M").json()
    assert body["frequency"] == "M"
    assert body["scenarios"]["mid"] == [{"period": "2099-04", "value": 300}, {"period": "2099-05", "value": 310}]
    assert body["scenarios"]["low"][0] == {"period": "2099-04", "value": 295}
    assert api.get(f"/api/v1/ee/revisions/{rev_id}/values").json()["scenarios"]["mid"] == [
        {"period": "2099", "value": 3600}]  # por omisión, anual


def test_monthly_observed_shows_only_complete_months(db, api):
    demasin(db, date(2099, 1, 1), 31, 1)   # enero completo
    demasin(db, date(2099, 2, 1), 10, 1)   # febrero a medias
    body = api.get("/api/v1/ee/observed?frequency=M").json()
    points = {p["period"]: p["value"] for p in body["points"]}
    assert body["frequency"] == "M" and points["2099-01"] == 31 and "2099-02" not in points
    assert body["cutoff"] == "2099-01"


def test_unknown_frequency_is_rejected(api):
    assert api.get("/api/v1/ee/observed?frequency=X").status_code == 422


def test_observed_shows_only_complete_years(db, api):
    demasin(db, date(2098, 12, 1), 31, 1)  # 2098 solo tiene diciembre
    demasin(db, date(2099, 1, 1), 365, 1)
    points = {p["period"]: p["value"] for p in api.get("/api/v1/ee/observed").json()["points"]}
    assert points["2099"] == 365 and "2098" not in points


def test_system_today_has_the_last_30_days(db, api):
    demasin(db, date(2099, 1, 1), 365, 1)
    body = api.get("/api/v1/ee/system-today").json()
    assert body["lastDay"] == "2099-12-31" and len(body["energyDaily"]) == 30
    assert body["energyYesterday"] == 1 and body["energyYearToDate"] == 365  # sin días a medias: se usa el último


def test_system_today_skips_a_partial_last_day(db, api):
    demasin(db, date(2099, 1, 1), 364, 240)
    demasin(db, date(2099, 12, 31), 1, 0.6)  # XM publica el último día a medias
    body = api.get("/api/v1/ee/system-today").json()
    assert body["lastDay"] == "2099-12-30" and body["energyYesterday"] == 240


def test_unknown_revision_is_404(db, api):
    assert api.get("/api/v1/ee/revisions/999999/values").status_code == 404
