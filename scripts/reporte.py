#!/usr/bin/env python3
"""Genera un reporte de periodo desde docs/diario (DOC-06).
Uso: python scripts/reporte.py --desde 2026-11-01 --hasta 2026-11-07 [--salida docs/diario/reportes/...md]
"""
import argparse, re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def entries(desde, hasta):
    for p in sorted((ROOT / "docs/diario").rglob("*.md")):
        if "reportes" in p.parts:
            continue
        txt = p.read_text(encoding="utf-8")
        m = re.match(r"---\n(.*?)\n---\n(.*)", txt, re.S)
        if not m:
            continue
        meta = dict(l.split(":", 1) for l in m.group(1).splitlines() if ":" in l)
        meta = {k.strip(): v.strip() for k, v in meta.items()}
        if desde <= meta.get("fecha", "") <= hasta:
            title = re.search(r"## Qué cambió\n+(.+)", m.group(2))
            yield meta, (title.group(1).strip() if title else p.stem), p


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--desde", required=True)
    ap.add_argument("--hasta", required=True)
    ap.add_argument("--salida")
    a = ap.parse_args()
    groups = {"agrega": [], "modifica": [], "elimina": [], "corrige": [], "otro": []}
    for meta, summary, p in entries(a.desde, a.hasta):
        groups.get(meta.get("tipo"), groups["otro"]).append(f"- {summary} · vistas: {meta.get('vistas', '')} · PR #{meta.get('pr', '?')} ([detalle]({p.relative_to(ROOT / 'docs/diario').as_posix()}))")
    names = {"agrega": "Vistas y features agregadas", "modifica": "Modificadas", "elimina": "Eliminadas", "corrige": "Correcciones", "otro": "Otros cambios"}
    body = [f"# Reporte {a.desde} a {a.hasta}\n", "## Resumen\n<!-- 3 líneas: completar o pedir a un asistente -->\n"]
    for k, title in names.items():
        body.append(f"## {title}\n" + ("\n".join(groups[k]) if groups[k] else "- Sin cambios.") + "\n")
    body.append("## Pendientes que avanzaron\n\n## Próximos pasos\n")
    text = "\n".join(body)
    if a.salida:
        Path(a.salida).parent.mkdir(parents=True, exist_ok=True)
        Path(a.salida).write_text(text, encoding="utf-8")
    print(text)


if __name__ == "__main__":
    main()
