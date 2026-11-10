"""Pruebas del flujo ingest-observed-demand sin base ni internet: la carga de cada variable se simula."""
import logging
from datetime import date, timedelta

import pytest

from flows import xm_observed
from flows.xm_observed import DAILY_VARIABLES, VariableResult


@pytest.fixture()
def calls(monkeypatch):
    """Simula la carga (xm_expoener falla) y el listado de XM (xm_demareal solo existe por hora)."""
    seen = []

    def fake_load(variable, start, end):
        seen.append((variable, start, end))
        status = "failed" if variable == "xm_expoener" else "ok"
        return VariableResult(variable, len(seen), status, f"{variable} simulada")

    monkeypatch.setattr(xm_observed, "load_variable", fake_load)
    monkeypatch.setattr(xm_observed, "check_daily",
                        lambda variables: {v: "XM solo la publica como HourlyEntities" for v in variables
                                           if v == "xm_demareal"})
    monkeypatch.setattr(xm_observed, "get_run_logger", lambda: logging.getLogger("prueba"))
    return seen


def test_defaults_load_the_daily_measures_from_2010_to_yesterday(calls):
    xm_observed.ingest_observed_demand.fn()
    assert [c[0] for c in calls] == DAILY_VARIABLES == ["xm_demasin", "xm_demamaxpot"]
    assert {c[1:] for c in calls} == {(date(2010, 1, 1), date.today() - timedelta(days=1))}


def test_a_failed_variable_does_not_stop_the_others_and_is_named(calls):
    with pytest.raises(RuntimeError, match="Fallaron 1 de 2 variables: xm_expoener"):
        xm_observed.ingest_observed_demand.fn(["xm_expoener", "xm_demasin"])
    assert [c[0] for c in calls] == ["xm_expoener", "xm_demasin"]


def test_a_variable_xm_does_not_publish_daily_is_rejected_without_loading(calls):
    with pytest.raises(RuntimeError, match="Fallaron 1 de 2 variables: xm_demareal"):
        xm_observed.ingest_observed_demand.fn(["xm_demareal", "xm_demasin"])
    assert [c[0] for c in calls] == ["xm_demasin"]  # xm_demareal no llegó a cargarse


def test_returns_one_result_per_variable_with_its_load_run(calls):
    results = xm_observed.ingest_observed_demand.fn(["xm_demasin"], date(2026, 1, 1), date(2026, 1, 31))
    assert results == [{"variable": "xm_demasin", "load_run_id": 1, "status": "ok", "message": "xm_demasin simulada"}]
    assert calls == [("xm_demasin", date(2026, 1, 1), date(2026, 1, 31))]
