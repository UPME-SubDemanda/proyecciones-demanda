"""Pruebas del modelo de datos v2 contra PostgreSQL (PBD-04).

Corren solo si TEST_POSTGRES_URL apunta a una base con las migraciones aplicadas (en la CI, la base de
prueba). Cada prueba trabaja en una transacción que se revierte al final.

    TEST_POSTGRES_URL=postgresql://app:app@localhost:5432/proyecciones_demanda uv run pytest tests/test_db_model.py
"""
import os
from datetime import date, timedelta
from decimal import Decimal

import pytest

psycopg = pytest.importorskip("psycopg")

URL = os.environ.get("TEST_POSTGRES_URL", "").replace("postgresql+psycopg://", "postgresql://")
pytestmark = pytest.mark.skipif(not URL, reason="sin TEST_POSTGRES_URL: pruebas de la base solo con PostgreSQL")


@pytest.fixture()
def cur():
    with psycopg.connect(URL) as conn:
        with conn.cursor() as cursor:
            yield cursor
        conn.rollback()


def observed(cur, version, value, status, loaded_at, period="2026-03-14", variable="xm_demasin", freq="D"):
    cur.execute(
        """INSERT INTO core.observed_values (variable, geography, frequency, period, version, value,
                                              quality_status, loaded_at)
           VALUES (%s, 'ee_sin', %s, %s, %s, %s, %s, %s)""",
        [variable, freq, period, version, value, status, loaded_at],
    )


def one(cur, sql, params=()):
    cur.execute(sql, params)
    return cur.fetchone()


def test_current_is_the_highest_accepted_version(cur):
    observed(cur, 1, 238.90, "accepted", "2026-03-16")
    observed(cur, 2, 180.20, "anomalous", "2026-03-17")
    sql = "SELECT version, value FROM core.observed_current WHERE variable = 'xm_demasin' AND period = '2026-03-14'"
    assert one(cur, sql) == (1, Decimal("238.90"))  # la anómala no reemplaza a la vigente (PDA-02)
    observed(cur, 3, 239.12, "accepted", "2026-11-15")
    assert one(cur, sql) == (3, Decimal("239.12"))


def test_as_of_returns_what_was_known_at_that_date(cur):
    observed(cur, 1, 238.90, "accepted", "2026-03-16")
    observed(cur, 2, 239.12, "accepted", "2026-11-15")
    sql = ("SELECT version, value FROM core.observed_as_of(%s) "
           "WHERE variable = 'xm_demasin' AND period = '2026-03-14'")
    assert one(cur, sql, ["2026-04-14"]) == (1, Decimal("238.90"))  # lo que usó la revisión 2026-07
    assert one(cur, sql, ["2026-11-16"]) == (2, Decimal("239.12"))
    assert one(cur, sql, ["2026-03-01"]) is None


def test_latest_includes_provisional_marked(cur):
    observed(cur, 1, 238.90, "accepted", "2026-03-16")
    observed(cur, 2, 239.00, "provisional", "2026-03-17")
    assert one(cur, "SELECT version, is_provisional FROM core.observed_latest WHERE period = '2026-03-14'") == (2, True)
    assert one(cur, "SELECT version FROM core.observed_current WHERE period = '2026-03-14'") == (1,)


def test_monthly_marks_incomplete_months_and_sums_energy(cur):
    observed(cur, 1, 230, "accepted", "2026-03-02", period="2026-02-01")
    observed(cur, 1, 240, "accepted", "2026-03-02", period="2026-02-02")
    row = one(cur, """SELECT value, days_with_data, days_in_period, is_complete FROM core.observed_monthly
                       WHERE variable = 'xm_demasin' AND period = '2026-02-01'""")
    assert row == (pytest.approx(470), 2, 28, False)  # incompleto: se marca, no se escala


def test_monthly_complete_month(cur):
    start = date(2026, 2, 1)
    for i in range(28):
        observed(cur, 1, 10, "accepted", "2026-03-02", period=(start + timedelta(days=i)).isoformat())
    row = one(cur, "SELECT value, is_complete FROM core.observed_monthly WHERE period = '2026-02-01'")
    assert row == (pytest.approx(280), True)


def test_monthly_peak_power_takes_the_maximum(cur):
    observed(cur, 1, 11000, "accepted", "2026-03-02", period="2026-02-01", variable="xm_demamaxpot")
    observed(cur, 1, 11500, "accepted", "2026-03-02", period="2026-02-02", variable="xm_demamaxpot")
    row = one(cur, "SELECT value FROM core.observed_monthly WHERE variable = 'xm_demamaxpot' AND period = '2026-02-01'")
    assert row == (pytest.approx(11500),)


def revision(cur, document_url="https://www.upme.gov.co/informe.pdf"):
    cur.execute(
        """INSERT INTO core.revisions (product, code, name, published_on, data_cutoff, model, document_url, source)
           VALUES ('ee', '2026-07', 'Rev. Julio 2026', '2026-07-31', '2026-03-31', 'VAR/VEC', %s, 'upme_annex')
           RETURNING id""",
        [document_url],
    )
    return cur.fetchone()[0]


def test_revision_requires_provenance(cur):
    with pytest.raises(psycopg.errors.NotNullViolation):
        revision(cur, document_url=None)  # BD-06: sin documento no hay procedencia


def test_component_values_are_stored_positive(cur):
    rev_id = revision(cur)
    cur.execute("""INSERT INTO core.components (code, product, type, name, geography)
                   VALUES ('gd_upme_caribe', 'ee', 'gd_upme', 'GD UPME Caribe', 'ee_area_caribe')""")
    with pytest.raises(psycopg.errors.CheckViolation):  # PDA-07: la GD va positiva; la resta la pone la composición
        cur.execute("""INSERT INTO core.revision_component_values (revision_id, component, measure, frequency, period, value)
                       VALUES (%s, 'gd_upme_caribe', 'ee_energy', 'M', '2026-04-01', -51.73)""", [rev_id])


def test_gd_series_subtracts_gd(cur):
    cur.execute("SELECT part, sign FROM core.series_composition WHERE series = 'ee_sin_gce_me_gd_upme'")
    assert dict(cur.fetchall()) == {"ee_sin_gce_me": 1, "gd_upme": -1}
