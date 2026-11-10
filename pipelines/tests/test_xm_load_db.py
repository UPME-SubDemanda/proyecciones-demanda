"""Carga diaria de XM de punta a punta contra PostgreSQL (PBD-04), con XM simulado (httpx.MockTransport).

Corre en el job `base-de-datos` de la CI y contra la base de desarrollo si hay TEST_POSTGRES_URL. Usa periodos de
2099 para no chocar con datos reales, y al final borra lo que cargó y deja operacion.source_status como estaba.
"""
import json
import os
from datetime import date, timedelta

import httpx
import pytest

from lib import loads

psycopg = pytest.importorskip("psycopg")
URL = os.environ.get("TEST_POSTGRES_URL", "").replace("postgresql+psycopg://", "postgresql://")
pytestmark = pytest.mark.skipif(not URL, reason="sin TEST_POSTGRES_URL: pruebas de la base solo con PostgreSQL")

VARIABLE = "xm_demareal"
JAN = (date(2099, 1, 1), date(2099, 1, 31))


def xm(values: dict[date, str] | None = None, status: int = 200) -> httpx.Client:
    """XM simulado: responde los días pedidos que estén en `values` (texto en kWh), o `status` si no es 200."""
    def handler(request):
        if status != 200:
            return httpx.Response(status)
        body = json.loads(request.content)
        start, end = date.fromisoformat(body["StartDate"]), date.fromisoformat(body["EndDate"])
        items = [{"Date": d.isoformat(), "DailyEntities": [{"Id": "Sistema", "Value": v}]}
                 for d, v in sorted((values or {}).items()) if start <= d <= end]
        return httpx.Response(200, json={"Items": items})
    return httpx.Client(transport=httpx.MockTransport(handler))


def january(kwh: str = "200000000") -> dict[date, str]:
    return {JAN[0] + timedelta(days=i): kwh for i in range(31)}


@pytest.fixture()
def conn(monkeypatch):
    monkeypatch.setattr("lib.xm_sinergox.time.sleep", lambda s: None)  # sin esperas entre reintentos
    with psycopg.connect(URL) as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT * FROM operacion.source_status WHERE source = 'xm_sinergox'")
            saved = cur.fetchone()
            cur.execute("SELECT coalesce(max(id), 0) FROM operacion.load_runs")
            first_new_run = cur.fetchone()[0] + 1
        yield conn
        conn.rollback()
        with conn.cursor() as cur:
            runs = "(SELECT id FROM operacion.load_runs WHERE id >= %(r)s AND flow = 'test-xm')"
            for sql in (f"DELETE FROM core.observed_changes WHERE load_run_id IN {runs}",
                        f"DELETE FROM core.observed_values WHERE load_run_id IN {runs}",
                        f"""DELETE FROM raw.xm_sinergox_values WHERE extraction_id IN
                               (SELECT id FROM operacion.extractions WHERE load_run_id IN {runs})""",
                        "DELETE FROM operacion.load_runs WHERE id >= %(r)s AND flow = 'test-xm'",
                        "DELETE FROM operacion.source_status WHERE source = 'xm_sinergox'"):
                cur.execute(sql, {"r": first_new_run})
            if saved:
                cur.execute(f"INSERT INTO operacion.source_status VALUES ({', '.join(['%s'] * len(saved))})", saved)
        conn.commit()


def run(conn, client, start=JAN[0], end=JAN[1]):
    run_id = loads.load_xm_daily(conn, VARIABLE, start, end, client=client, flow="test-xm")
    with conn.cursor() as cur:
        cur.execute("""SELECT status, n_new, n_changed, n_unchanged FROM operacion.load_runs WHERE id = %s""", [run_id])
        status, *counts = cur.fetchone()
        cur.execute("SELECT level, code FROM operacion.load_messages WHERE load_run_id = %s ORDER BY id", [run_id])
        return status, counts, cur.fetchall()


def monthly(conn):
    with conn.cursor() as cur:
        cur.execute("""SELECT xm_demareal, xm_demareal_complete FROM core.v_observed_wide
                        WHERE geography = 'ee_sin' AND period = '2099-01-01'""")
        return cur.fetchone()


def test_backfill_converts_units_and_shows_in_the_monthly_view(conn):
    assert run(conn, xm(january())) == ("ok", [31, 0, 0], [])
    assert monthly(conn) == (6200, True)  # 31 días × 200 GWh (kWh × 0,000001)


def test_running_again_creates_no_versions_unless_xm_changed(conn):
    run(conn, xm(january()))
    assert run(conn, xm(january()))[:2] == ("ok", [0, 0, 31])
    changed = january() | {date(2099, 1, 15): "210000000"}
    assert run(conn, xm(changed))[:2] == ("ok", [0, 1, 30])
    with conn.cursor() as cur:
        cur.execute("""SELECT old_value, new_value FROM core.observed_changes
                        WHERE variable = %s AND period = '2099-01-15'""", [VARIABLE])
        assert cur.fetchall() == [(200, 210)]
    assert monthly(conn) == (6210, True)


def test_missing_days_are_a_warning_and_the_month_stays_incomplete(conn):
    values = {d: v for d, v in january().items() if not date(2099, 1, 8) <= d <= date(2099, 1, 27)}
    status, counts, messages = run(conn, xm(values))
    assert (status, counts, messages) == ("ok_with_warnings", [11, 0, 0], [("warning", "days_missing")])
    assert monthly(conn) == (2200, False)


def test_xm_down_fails_the_run_and_keeps_what_was_loaded(conn):
    run(conn, xm(january()))
    status, counts, messages = run(conn, xm(status=503))
    assert status == "failed" and counts == [0, 0, 0] and ("error", "extraction_failed") in messages
    assert monthly(conn) == (6200, True)


def test_unknown_variable_is_rejected_before_opening_a_run(conn):
    with pytest.raises(ValueError, match="xm_no_existe"):
        loads.load_xm_daily(conn, "xm_no_existe", *JAN, client=xm(), flow="test-xm")
