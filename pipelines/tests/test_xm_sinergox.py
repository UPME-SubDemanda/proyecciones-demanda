"""Pruebas del cliente de XM SINERGOX sin salir a internet (httpx.MockTransport)."""
from datetime import date

import httpx

from lib.xm_sinergox import fetch_daily, fetch_metric_list, missing_days, month_chunks, parse_daily

PAYLOAD = {"Items": [
    {"Date": "2010-01-01", "DailyEntities": [{"Id": "Sistema", "Value": "115437747.19000"}]},
    {"Date": "2010-01-02", "DailyEntities": [{"Id": "Sistema", "Value": "127695172.79000"}]},
]}


def test_month_chunks_never_exceed_31_days():
    chunks = list(month_chunks(date(2010, 1, 15), date(2010, 3, 2)))
    assert chunks == [(date(2010, 1, 15), date(2010, 1, 31)), (date(2010, 2, 1), date(2010, 2, 28)),
                      (date(2010, 3, 1), date(2010, 3, 2))]


def test_parse_daily_keeps_text_and_code():
    assert parse_daily(PAYLOAD)[0] == {"date": date(2010, 1, 1), "code": "Sistema", "value_text": "115437747.19000"}
    assert parse_daily({}) == []  # vacío no es error


def test_fetch_daily_retries_then_succeeds():
    calls = []

    def handler(request):
        calls.append(request)
        return httpx.Response(503) if len(calls) < 2 else httpx.Response(200, json=PAYLOAD)

    ext = fetch_daily(httpx.Client(transport=httpx.MockTransport(handler)), "DemaSIN", "Sistema",
                      date(2010, 1, 1), date(2010, 1, 2), sleep=lambda s: None)
    assert ext.error is None and ext.retries == 1 and len(ext.rows) == 2 and ext.content_hash


def test_fetch_daily_reports_failure_without_raising():
    ext = fetch_daily(httpx.Client(transport=httpx.MockTransport(lambda r: httpx.Response(500))), "DemaSIN",
                      "Sistema", date(2010, 1, 1), date(2010, 1, 2), sleep=lambda s: None)
    assert ext.rows == [] and ext.http_status == 500 and "HTTPStatusError" in ext.error


def test_missing_days_groups_ranges():
    found = {date(2022, 8, 7), date(2022, 8, 28)}
    assert missing_days(found, date(2022, 8, 7), date(2022, 8, 28)) == [(date(2022, 8, 8), date(2022, 8, 27))]
    assert missing_days(set(), date(2022, 1, 1), date(2022, 1, 2)) == [(date(2022, 1, 1), date(2022, 1, 2))]


def test_client_errors_are_not_retried_except_429():
    calls = []

    def handler(request):
        calls.append(request)
        return httpx.Response(400)

    ext = fetch_daily(httpx.Client(transport=httpx.MockTransport(handler)), "DemaReal", "Sistema",
                      date(2010, 1, 1), date(2010, 1, 31), sleep=lambda s: None)
    assert len(calls) == 1 and ext.http_status == 400 and ext.retries == 0 and ext.error

    calls.clear()
    handler_429 = lambda r: calls.append(r) or httpx.Response(429)
    fetch_daily(httpx.Client(transport=httpx.MockTransport(handler_429)), "DemaSIN", "Sistema",
                date(2010, 1, 1), date(2010, 1, 31), sleep=lambda s: None)
    assert len(calls) == 4  # demasiadas consultas: sí se espera y se reintenta


def test_metric_list_says_how_xm_publishes_each_metric():
    listing = {"Items": [{"Date": "2026-11-10", "ListEntities": [
        {"Id": "Sistema", "Values": {"MetricId": "DemaReal", "Entity": "Sistema", "Type": "HourlyEntities"}},
        {"Id": "Sistema", "Values": {"MetricId": "DemaSIN", "Entity": "Sistema", "Type": "DailyEntities"}}]}]}
    client = httpx.Client(transport=httpx.MockTransport(lambda r: httpx.Response(200, json=listing)))
    assert fetch_metric_list(client) == {("DemaReal", "Sistema"): "HourlyEntities",
                                         ("DemaSIN", "Sistema"): "DailyEntities"}
    down = httpx.Client(transport=httpx.MockTransport(lambda r: httpx.Response(503)))
    assert fetch_metric_list(down) is None  # sin listado no se verifica, pero no se detiene la carga
