"""Escritura en la base para las cargas: bitácora (operacion), raw, staging y paso a core (T-24, base de T-27 y T-28).

Recorrido raw → staging → core (PDA-01). Cada carga deja su fila en operacion.load_runs y sus mensajes en
operacion.load_messages (PDA-05), aunque falle o no encuentre nada.
"""
from __future__ import annotations

import os
from datetime import date

import psycopg
from psycopg.types.json import Jsonb


def connect(url: str | None = None) -> psycopg.Connection:
    url = url or os.environ.get("DATABASE_URL", "")
    if not url.startswith("postgresql"):
        raise SystemExit("DATABASE_URL debe apuntar a la base PostgreSQL del proyecto.")
    return psycopg.connect(url.replace("postgresql+psycopg://", "postgresql://"))


def start_run(conn, flow: str, source: str, load_type: str, range_start: date | None = None,
              range_end: date | None = None, app_version: str | None = None) -> int:
    """Abre la fila de la carga y la confirma enseguida, para que quede aunque la carga falle."""
    with conn.cursor() as cur:
        cur.execute("""INSERT INTO operacion.load_runs (flow, source, load_type, range_start, range_end, app_version)
                       VALUES (%s, %s, %s, %s, %s, %s) RETURNING id""",
                    [flow, source, load_type, range_start, range_end, app_version])
        run_id = cur.fetchone()[0]
    conn.commit()
    return run_id


def add_messages(conn, run_id: int, messages) -> None:
    """Guarda mensajes con atributos level, code, message y context (PDA-05)."""
    with conn.cursor() as cur:
        cur.executemany("""INSERT INTO operacion.load_messages (load_run_id, level, code, message, context)
                           VALUES (%s, %s, %s, %s, %s)""",
                        [(run_id, m.level, m.code, m.message, Jsonb(m.context)) for m in messages])


def finish_run(conn, run_id: int, status: str, message: str, **counts) -> None:
    """Cierra la carga con su estado, sus conteos (n_new, n_changed…) y un resumen legible."""
    sets = ", ".join(f"{k} = %s" for k in counts)
    with conn.cursor() as cur:
        cur.execute(f"""UPDATE operacion.load_runs
                           SET status = %s, message = %s, finished_at = now(){', ' + sets if sets else ''}
                         WHERE id = %s""", [status, message, *counts.values(), run_id])
    conn.commit()


def status_for(messages) -> str:
    levels = {m.level for m in messages}
    return "failed" if "error" in levels else "ok_with_warnings" if "warning" in levels else "ok"


def counts_by_level(messages) -> dict[str, int]:
    out = {"error": 0, "warning": 0, "info": 0}
    for m in messages:
        out[m.level] += 1
    return out
