"""Carga de prueba de T-24: los anexos de las revisiones de EE y una variable diaria de XM.

No es el pipeline (eso es T-27 a T-29): se corre a mano contra la base local. Ver docs/tecnica/flujos.md.

    # Anexos: la carpeta donde están los archivos de revisiones_ee.toml (no entran al repositorio)
    python carga_prueba.py anexos /anexos
    # DemaSIN diaria desde 2010 (decisión del 2026-11-10, X-26)
    python carga_prueba.py xm --variable xm_demasin --desde 2010-01-01

Con Docker: docker compose run --rm -v "$HOME/Downloads:/anexos:ro" -v ./pipelines:/opt/pipelines \\
    prefect-worker python carga_prueba.py anexos /anexos
"""
import argparse
import sys
import tomllib
from datetime import date, timedelta
from pathlib import Path

from lib import loads, store

MANIFEST = Path(__file__).with_name("revisiones_ee.toml")


def show_run(conn, run_id):
    with conn.cursor() as cur:
        cur.execute("SELECT status, message FROM operacion.load_runs WHERE id = %s", [run_id])
        status, message = cur.fetchone()
        print(f"[carga {run_id}] {status}: {message}")
        cur.execute("""SELECT level, message FROM operacion.load_messages
                        WHERE load_run_id = %s AND level <> 'info' ORDER BY id""", [run_id])
        for level, text in cur.fetchall():
            print(f"    {level}: {text}")
    return status


def run_annexes(folder: Path, only: list[str]) -> int:
    revisions = tomllib.loads(MANIFEST.read_text(encoding="utf-8"))["revision"]
    failed = 0
    with store.connect() as conn:
        for entry in revisions:
            if only and entry["code"] not in only:
                continue
            path = folder / entry["file"]
            if not path.exists():
                print(f"No está el archivo {path}; se omite la revisión {entry['code']}.")
                failed += 1
                continue
            meta = loads.RevisionMeta(**entry)
            failed += show_run(conn, loads.load_annex(conn, path, meta)) == "failed"
    return 1 if failed else 0


def run_xm(variable: str, start: date, end: date) -> int:
    with store.connect() as conn:
        return 1 if show_run(conn, loads.load_xm_daily(conn, variable, start, end)) == "failed" else 0


def main():
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    sub = parser.add_subparsers(dest="cmd", required=True)
    a = sub.add_parser("anexos", help="carga los anexos de revisiones_ee.toml que estén en la carpeta")
    a.add_argument("carpeta", type=Path)
    a.add_argument("--solo", nargs="*", default=[], help="códigos de revisión (por ejemplo 2026-07)")
    x = sub.add_parser("xm", help="carga una variable diaria de XM SINERGOX")
    x.add_argument("--variable", default="xm_demasin")
    x.add_argument("--desde", type=date.fromisoformat, default=date(2010, 1, 1))
    x.add_argument("--hasta", type=date.fromisoformat, default=date.today() - timedelta(days=1))
    args = parser.parse_args()
    if args.cmd == "anexos":
        return run_annexes(args.carpeta, args.solo)
    return run_xm(args.variable, args.desde, args.hasta)


if __name__ == "__main__":
    sys.exit(main())
