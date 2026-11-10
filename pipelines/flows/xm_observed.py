"""Flujo ingest-observed-demand: carga histórica de las medidas diarias de XM SINERGOX (T-28, issue #38).

Antes de cargar, verifica en el listado de métricas de XM que cada variable se publique por día: una que solo
existe por hora (DemaReal, DemaCome, ExpoEner) se rechaza de entrada, con su motivo; esas son de T-36.
Cada variable es una tarea y deja su propia carga en la bitácora (operacion.load_runs, PDA-05). Guarda solo lo
nuevo o lo que cambió (PBD-05), así que volver a correr un rango es seguro. Si una variable falla, las demás
siguen y el flujo termina en error al final, con el detalle de cuál falló.

La carga diaria automática, la conciliación, las anomalías y los avisos son de T-29 (X-24).
Documentación: docs/tecnica/flujos.md. Ficha de la fuente: docs/tecnica/base-de-datos/fuentes/xm/ficha-sinergox.md.

A mano, dentro del contenedor prefect-worker:
    python -m flows.xm_observed --desde 2010-01-01 --variables xm_demamaxpot
"""
from __future__ import annotations

import argparse
from dataclasses import asdict, dataclass
from datetime import date, timedelta

import httpx
from prefect import flow, get_run_logger, task

from lib import loads, store, xm_sinergox

# Las medidas que XM publica por día (X-26, decidido el 2026-11-10). DemaReal, DemaCome y ExpoEner solo existen
# por hora en SINERGOX: van en T-36.
DAILY_VARIABLES = ["xm_demasin", "xm_demamaxpot"]
DEFAULT_START = date(2010, 1, 1)


@dataclass
class VariableResult:
    variable: str
    load_run_id: int | None
    status: str
    message: str


def yesterday() -> date:
    return date.today() - timedelta(days=1)


@task(name="check-xm-daily")
def check_daily(variables: list[str]) -> dict[str, str]:
    """Variables que no se pueden cargar por día, con su motivo. Si XM no entrega el listado, no se verifica."""
    problems, wanted = {}, {}
    with store.connect() as conn:
        for variable in variables:
            try:
                wanted[variable] = loads.xm_variable(conn, variable)
            except ValueError as exc:
                problems[variable] = str(exc)
    with httpx.Client() as client:
        published = xm_sinergox.fetch_metric_list(client)
    if published is None:
        get_run_logger().warning("XM no entregó el listado de métricas: se carga sin verificar la frecuencia.")
        return problems
    for variable, (metric, entity) in wanted.items():
        kind = published.get((metric, entity))
        if kind != "DailyEntities":
            where = f"solo la publica como {kind}" if kind else "no la publica"
            problems[variable] = f"XM {where} para {metric} / {entity}: este flujo solo carga datos diarios."
    return problems


@task(name="load-xm-variable", task_run_name="{variable}")
def load_variable(variable: str, start: date, end: date) -> VariableResult:
    """Carga una variable en su propia conexión y devuelve el estado que quedó en la bitácora."""
    with store.connect() as conn:
        try:
            run_id = loads.load_xm_daily(conn, variable, start, end)
        except ValueError as exc:  # variable desconocida o rango inválido: no se abre carga
            return VariableResult(variable, None, "failed", str(exc))
        with conn.cursor() as cur:
            cur.execute("SELECT status, message FROM operacion.load_runs WHERE id = %s", [run_id])
            status, message = cur.fetchone()
    return VariableResult(variable, run_id, status, message)


@flow(name=loads.XM_FLOW, log_prints=True)
def ingest_observed_demand(variables: list[str] | None = None, desde: date = DEFAULT_START,
                           hasta: date | None = None) -> list[dict]:
    """Carga las medidas diarias de XM entre `desde` y `hasta` (por omisión, ayer).

    variables: códigos de core.variables; por omisión, las medidas diarias de X-26 (DAILY_VARIABLES).
    """
    logger = get_run_logger()
    variables = variables or DAILY_VARIABLES
    hasta = hasta or yesterday()
    problems = check_daily(variables)
    results = []
    for variable in variables:
        if variable in problems:
            result = VariableResult(variable, None, "failed", problems[variable])
        else:
            result = load_variable(variable, desde, hasta)
        log = logger.error if result.status == "failed" else logger.info
        log("%s [carga %s] %s: %s", variable, result.load_run_id, result.status, result.message)
        results.append(result)
    failed = [r.variable for r in results if r.status == "failed"]
    if failed:
        raise RuntimeError(f"Fallaron {len(failed)} de {len(results)} variables: {', '.join(failed)}. "
                           "El motivo de cada una está en los mensajes de este flujo y en operacion.load_messages.")
    return [asdict(r) for r in results]


def main() -> None:
    parser = argparse.ArgumentParser(description="Carga histórica diaria de XM (flujo ingest-observed-demand).")
    parser.add_argument("--variables", nargs="*", default=None, help=f"por omisión: {' '.join(DAILY_VARIABLES)}")
    parser.add_argument("--desde", type=date.fromisoformat, default=DEFAULT_START)
    parser.add_argument("--hasta", type=date.fromisoformat, default=None, help="por omisión: ayer")
    args = parser.parse_args()
    ingest_observed_demand(args.variables, args.desde, args.hasta)


if __name__ == "__main__":
    main()
