"""Pruebas de las vistas anchas de core (T-24, migración 0004) contra PostgreSQL (PBD-04).

Las tres consultas que piden las vistas: abanico de una revisión, comparación entre revisiones y proyección
frente a dato real (PER-01). Datos mínimos inventados; cada prueba se revierte al final.
"""
import os
from datetime import date, timedelta
from decimal import Decimal

import pytest

psycopg = pytest.importorskip("psycopg")

URL = os.environ.get("TEST_POSTGRES_URL", "").replace("postgresql+psycopg://", "postgresql://")
pytestmark = pytest.mark.skipif(not URL, reason="sin TEST_POSTGRES_URL: pruebas de la base solo con PostgreSQL")

SERIES = "ee_sin_gce_me_gd_upme"  # la serie comparable (PER-01)


@pytest.fixture()
def cur():
    with psycopg.connect(URL) as conn:
        with conn.cursor() as cursor:
            yield cursor
        conn.rollback()


def revision(cur, code, published_on, first_month, mids, series=SERIES):
    """Revisión con valores mensuales: mids = {periodo: medio}; IC 95 = ±10 y IC 68 = ±5."""
    cur.execute("""INSERT INTO core.revisions (product, code, name, published_on, data_cutoff, first_projected_period,
                                               model, document_url, status, source)
                   VALUES ('ee', %s, %s, %s, %s, %s, 'prueba', 'https://www.upme.gov.co', 'published', 'upme_annex')
                   RETURNING id""",
                [code, f"Rev. {code}", published_on, first_month - timedelta(days=1), first_month])
    rev_id = cur.fetchone()[0]
    for period, mid in mids.items():
        for value_type, delta in [("mid", 0), ("ci95_upper", 10), ("ci95_lower", -10), ("ci68_upper", 5),
                                  ("ci68_lower", -5)]:
            cur.execute("""INSERT INTO core.revision_values (revision_id, series, measure, geography, frequency, period,
                                                             value_type, value)
                           VALUES (%s, %s, 'ee_energy', 'ee_sin', 'M', %s, %s, %s)""",
                        [rev_id, series, period, value_type, mid + delta])
    return rev_id


def demasin_month(cur, month: date, daily: float, days=None):
    """DemaSIN diaria de un mes (todos sus días, o los primeros `days`)."""
    next_month = (month + timedelta(days=32)).replace(day=1)
    n = days or (next_month - month).days
    for i in range(n):
        cur.execute("""INSERT INTO core.observed_values (variable, geography, frequency, period, version, value,
                                                         quality_status)
                       VALUES ('xm_demasin', 'ee_sin', 'D', %s, 1, %s, 'accepted')""", [month + timedelta(days=i), daily])


def test_fan_has_one_row_per_period_with_every_bound(cur):
    rev_id = revision(cur, "2099-07", date(2099, 7, 31), date(2099, 4, 1), {date(2099, 4, 1): 300})
    cur.execute("""SELECT mid, ci95_lower, ci95_upper, ci68_lower, ci68_upper, low, high
                     FROM core.v_revision_wide WHERE revision_id = %s""", [rev_id])
    assert cur.fetchall() == [(300, 290, 310, 295, 305, None, None)]


def test_revisions_are_compared_with_the_previous_one(cur):
    revision(cur, "2098-12", date(2098, 12, 31), date(2098, 10, 1), {date(2099, 4, 1): 280})
    revision(cur, "2099-07", date(2099, 7, 31), date(2099, 4, 1), {date(2099, 4, 1): 294})
    cur.execute("""SELECT revision_code, previous_revision_code, diff_vs_previous, diff_pct_vs_previous
                     FROM core.v_revisions_side_by_side
                    WHERE series = %s AND period = '2099-04-01' AND revision_code LIKE '209%%'
                    ORDER BY published_on""", [SERIES])
    rows = cur.fetchall()
    assert rows[0][:3] == ("2098-12", None, None)
    assert rows[1][:3] == ("2099-07", "2098-12", 14)
    assert rows[1][3] == pytest.approx(Decimal(5))


def test_error_is_projected_minus_real_only_for_complete_months(cur):
    april, may = date(2099, 4, 1), date(2099, 5, 1)
    revision(cur, "2099-07", date(2099, 7, 31), april, {april: 315, may: 320})
    demasin_month(cur, april, 10)          # 30 días × 10 = 300 GWh, mes completo
    demasin_month(cur, may, 10, days=20)   # incompleto: se marca y no da error
    cur.execute("""SELECT period, months_ahead, projected, real, real_is_complete, error, error_pct, inside_ci95,
                          inside_ci68
                     FROM core.v_ee_revision_vs_real WHERE revision_code = '2099-07' ORDER BY period""")
    april_row, may_row = cur.fetchall()
    assert april_row[:6] == (april, 1, 315, 300, True, 15)  # PER-01: error = proyectado − real
    assert april_row[6] == pytest.approx(Decimal(5))
    assert april_row[7:] == (False, False)  # 300 está fuera de [305, 325] y de [310, 320]
    assert may_row[1] == 2 and may_row[4] is False and may_row[5] is None


def test_error_ignores_non_comparable_series_and_months_before_projection(cur):
    march, april = date(2099, 3, 1), date(2099, 4, 1)
    revision(cur, "2099-07", date(2099, 7, 31), april, {march: 300, april: 300})
    revision(cur, "2099-08", date(2099, 8, 31), april, {april: 300}, series="ee_sin")
    demasin_month(cur, march, 10)
    demasin_month(cur, april, 10)
    cur.execute("SELECT revision_code, period FROM core.v_ee_revision_vs_real WHERE revision_code LIKE '2099%'")
    assert cur.fetchall() == [("2099-07", april)]


def test_observed_wide_has_a_column_per_variable(cur):
    demasin_month(cur, date(2099, 4, 1), 10)
    cur.execute("""SELECT xm_demasin, xm_demasin_complete, xm_demareal FROM core.v_observed_wide
                    WHERE geography = 'ee_sin' AND period = '2099-04-01'""")
    assert cur.fetchone() == (300, True, None)
