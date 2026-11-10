"""Cliente de la API SINERGOX de XM (T-24, base de T-28). Ficha: docs/tecnica/base-de-datos/fuentes/xm/ficha-sinergox.md.

POST a https://servapibi.xm.com.co/daily o /hourly con a lo sumo 31 días por petición: el rango se parte
por meses calendario. Los valores llegan como texto en la unidad de XM (kWh, kW); aquí no se convierten:
eso es de staging (PDA-01).
"""
from __future__ import annotations

import hashlib
import json
import time
from dataclasses import dataclass
from datetime import date, timedelta

import httpx

BASE_URL = "https://servapibi.xm.com.co"
RETRY_WAITS = (1, 2, 4)  # segundos entre reintentos (ficha, sección 3)


@dataclass
class Extraction:
    """Una petición a XM: qué se pidió, qué respondió y su huella (operacion.extractions)."""
    request: dict
    http_status: int | None
    rows: list[dict]
    content_hash: str | None
    error: str | None
    retries: int


def month_chunks(start: date, end: date):
    """Parte [start, end] en tramos de un mes calendario (nunca más de 31 días)."""
    current = start
    while current <= end:
        next_month = (current.replace(day=1) + timedelta(days=32)).replace(day=1)
        chunk_end = min(end, next_month - timedelta(days=1))
        yield current, chunk_end
        current = chunk_end + timedelta(days=1)


def parse_daily(payload: dict) -> list[dict]:
    """Respuesta de /daily → filas {date, code, value_text}. Una respuesta sin Items es vacía, no un error."""
    rows = []
    for item in payload.get("Items") or []:
        for entity in item.get("DailyEntities") or []:
            code = entity.get("Id") or entity.get("Code") or entity.get("Name") or entity.get("Values_code")
            rows.append({"date": date.fromisoformat(item["Date"][:10]), "code": code, "value_text": entity.get("Value")})
    return rows


def fetch_daily(client: httpx.Client, metric: str, entity: str, start: date, end: date, sleep=time.sleep) -> Extraction:
    """Pide un tramo diario con reintentos. Nunca lanza: el error queda en la extracción."""
    request = {"MetricId": metric, "Entity": entity, "StartDate": start.isoformat(), "EndDate": end.isoformat(),
               "Filter": []}
    status, error = None, None
    for attempt in range(len(RETRY_WAITS) + 1):
        try:
            response = client.post(f"{BASE_URL}/daily", json=request, timeout=60)
            status = response.status_code
            response.raise_for_status()
            content = response.content
            payload = json.loads(content) if content.strip() else {}
            return Extraction(request, status, parse_daily(payload), hashlib.sha256(content).hexdigest(), None, attempt)
        except (httpx.HTTPError, ValueError) as exc:
            error = f"{type(exc).__name__}: {exc}"
            if attempt < len(RETRY_WAITS):
                sleep(RETRY_WAITS[attempt])
    return Extraction(request, status, [], None, error, len(RETRY_WAITS))


def missing_days(found: set[date], start: date, end: date) -> list[tuple[date, date]]:
    """Tramos de días sin dato entre start y end, para informarlos en la bitácora."""
    gaps, gap_start = [], None
    day = start
    while day <= end:
        if day not in found and gap_start is None:
            gap_start = day
        if day in found and gap_start is not None:
            gaps.append((gap_start, day - timedelta(days=1)))
            gap_start = None
        day += timedelta(days=1)
    if gap_start is not None:
        gaps.append((gap_start, end))
    return gaps
