"""Flujo load-published-revisions: carga las revisiones publicadas de EE desde el sitio de la UPME (T-27, issue #42).

Lee `revisiones_ee.toml`, y para cada revisión que no esté cargada descarga el anexo de `annex_url`, verifica que su
huella sea `annex_sha256` y lo carga con el lector de anexos (raw → staging → core, PDA-01, con bitácora PDA-05).
Lo que ya está cargado se omite sin descargarlo, así que se puede correr cuantas veces se quiera: el contenedor
prefect-worker lo corre al arrancar (`start.sh`), y así un servidor nuevo o actualizado queda con todas las
revisiones del archivo. Una revisión nueva solo necesita su entrada en el TOML.

Si una revisión falla (sin internet, URL caída, huella distinta), las demás siguen y el flujo termina en error al
final, con el detalle de cuál falló. La normalización entre versiones de anexo sigue pendiente en T-27.
Documentación: docs/tecnica/flujos.md.

A mano, dentro del contenedor prefect-worker:
    python -m flows.upme_revisions                 # todas las que falten
    python -m flows.upme_revisions --solo 2026-07  # una revisión
"""
from __future__ import annotations

import argparse
import sys
import tempfile
import time
import tomllib
from dataclasses import asdict, dataclass
from pathlib import Path

import httpx
import psycopg
from prefect import flow, get_run_logger, task

from lib import loads, store

MANIFEST = Path(__file__).resolve().parent.parent / "revisiones_ee.toml"


@dataclass
class RevisionResult:
    code: str
    load_run_id: int | None
    status: str
    message: str


def read_manifest(path: Path = MANIFEST) -> list[loads.RevisionMeta]:
    """Las revisiones de EE del archivo, en su orden."""
    return [loads.RevisionMeta(**entry) for entry in tomllib.loads(path.read_text(encoding="utf-8"))["revision"]]


def run_status(conn, run_id: int) -> tuple[str, str]:
    with conn.cursor() as cur:
        cur.execute("SELECT status, message FROM operacion.load_runs WHERE id = %s", [run_id])
        return cur.fetchone()


@task(name="pending-revisions")
def pending_revisions(revisions: list[loads.RevisionMeta]) -> list[loads.RevisionMeta]:
    """Las revisiones cuyo anexo no está en raw.files. Sin huella en el TOML, se intenta (y falla con su motivo)."""
    with store.connect() as conn:
        return [r for r in revisions if not (r.annex_sha256 and loads.annex_loaded(conn, r.annex_sha256))]


@task(name="load-upme-revision", task_run_name="{meta.code}")
def load_revision(meta: loads.RevisionMeta) -> RevisionResult:
    """Descarga, verifica y carga un anexo, en su propia conexión."""
    with store.connect() as conn:
        try:
            with httpx.Client() as client:
                content = loads.download_annex(client, meta)
        except loads.AnnexDownloadError as exc:
            run_id = loads.record_failure(conn, loads.REVISIONS_FLOW, meta, exc)
            return RevisionResult(meta.code, run_id, "failed", str(exc))
        with tempfile.TemporaryDirectory() as folder:
            path = Path(folder) / meta.file  # el nombre original queda en raw.files y en core.aliases
            path.write_bytes(content)
            run_id = loads.load_annex(conn, path, meta, flow=loads.REVISIONS_FLOW)
        status, message = run_status(conn, run_id)
    return RevisionResult(meta.code, run_id, status, message)


def record_nothing_to_do(total: int) -> RevisionResult:
    """Todas estaban cargadas: deja una sola fila en la bitácora (PDA-05), sin descargar nada."""
    message = f"Las {total} revisiones de revisiones_ee.toml ya estaban cargadas; no se descargó nada."
    with store.connect() as conn:
        run_id = store.start_run(conn, loads.REVISIONS_FLOW, "upme_annex", "file")
        store.finish_run(conn, run_id, "ok", message, n_unchanged=total)
    return RevisionResult("todas", run_id, "ok", message)


@flow(name=loads.REVISIONS_FLOW, log_prints=True)
def load_published_revisions(solo: list[str] | None = None) -> list[dict]:
    """Carga las revisiones de revisiones_ee.toml que falten. solo: códigos de revisión (por ejemplo 2026-07)."""
    logger = get_run_logger()
    revisions = [r for r in read_manifest() if not solo or r.code in solo]
    unknown = sorted(set(solo or []) - {r.code for r in revisions})
    if unknown:
        raise ValueError(f"No están en revisiones_ee.toml: {', '.join(unknown)}.")
    pending = pending_revisions(revisions)
    if not pending:
        result = record_nothing_to_do(len(revisions))
        logger.info("[carga %s] %s", result.load_run_id, result.message)
        return [asdict(result)]
    logger.info("Faltan %s de %s revisiones: %s.", len(pending), len(revisions), ", ".join(r.code for r in pending))
    results = []
    for meta in pending:
        result = load_revision(meta)
        log = logger.error if result.status == "failed" else logger.info
        log("%s [carga %s] %s: %s", result.code, result.load_run_id, result.status, result.message)
        results.append(result)
    failed = [r.code for r in results if r.status == "failed"]
    if failed:
        raise RuntimeError(f"Fallaron {len(failed)} de {len(results)} revisiones: {', '.join(failed)}. El motivo de "
                           "cada una está en los mensajes de este flujo y en operacion.load_messages.")
    return [asdict(r) for r in results]


def wait_for_schema(seconds: int) -> bool:
    """Espera a que la API haya migrado la base (core.revisions existe). En un servidor nuevo, el worker puede
    arrancar antes de que terminen las migraciones."""
    deadline = time.monotonic() + seconds
    while True:
        try:
            with store.connect() as conn, conn.cursor() as cur:
                cur.execute("SELECT to_regclass('core.revisions') IS NOT NULL")
                if cur.fetchone()[0]:
                    return True
        except psycopg.OperationalError as exc:
            print(f"La base todavía no responde ({type(exc).__name__}); se vuelve a intentar en 5 s.")
        if time.monotonic() >= deadline:
            return False
        time.sleep(5)


def main() -> int:
    parser = argparse.ArgumentParser(description="Carga las revisiones de EE que falten (flujo load-published-revisions).")
    parser.add_argument("--solo", nargs="*", default=None, help="códigos de revisión (por ejemplo 2026-07)")
    parser.add_argument("--esperar-base", type=int, default=0, metavar="SEGUNDOS",
                        help="espera hasta que la base esté migrada (lo usa start.sh al arrancar el worker)")
    args = parser.parse_args()
    if args.esperar_base and not wait_for_schema(args.esperar_base):
        print(f"La base no estuvo migrada en {args.esperar_base} s (core.revisions no existe): no se cargan revisiones.")
        return 1
    load_published_revisions(args.solo)
    return 0


if __name__ == "__main__":
    sys.exit(main())
