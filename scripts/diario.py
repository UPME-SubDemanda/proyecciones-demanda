#!/usr/bin/env python3
"""Genera docs/diario/index.md: la lista de entradas del diario, de la más reciente a la más antigua (DOC-05).

Lee el encabezado (front matter) de cada entrada en docs/diario/AAAA/. El título es `titulo` si la entrada
lo trae; si no, el nombre del archivo sin la fecha («2026-11-08-portal-inicio» → «Portal inicio»).

Uso:
    python scripts/diario.py          # regenera el índice
    python scripts/diario.py --check  # falla si el índice no está al día
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DIARY = ROOT / "docs/diario"
OUT = DIARY / "index.md"
REPO = "https://github.com/UPME-SubDemanda/proyecciones-demanda"

INTRO = """# Diario de cambios

Una entrada por PR unido a `develop` (DOC-05), en `AAAA/AAAA-MM-DD-<slug>.md`. Reportes de periodo en `reportes/` (DOC-06), generados con `python scripts/reporte.py`.

Lista generada por `scripts/diario.py` desde el encabezado de cada entrada. No editar a mano.
"""


def front(text):
    m = re.match(r"---\n(.*?)\n---", text, re.S)
    data = {}
    if m:
        for line in m.group(1).splitlines():
            if ":" in line:
                k, v = line.split(":", 1)
                data[k.strip()] = v.split("#")[0].strip()
    return data


def items(value):
    """«[a, b]» → «a, b»; vacío → «—»."""
    inner = value.strip().strip("[]").strip()
    return ", ".join(x.strip() for x in inner.split(",") if x.strip()) or "—"


def ref(kind, number):
    """Enlace a un issue o PR de GitHub. «?» = aún no existe («pendiente»); vacío o «ninguno» = no aplica («—»)."""
    if number == "?":
        return "pendiente"
    if not number.isdigit():
        return "—"
    path = "issues" if kind == "issue" else "pull"
    return f"[#{number}]({REPO}/{path}/{number})"


def title_of(path, data):
    if data.get("titulo"):
        return data["titulo"]
    slug = re.sub(r"^\d{4}-\d{2}-\d{2}-", "", path.stem).replace("-", " ")
    return slug[:1].upper() + slug[1:]


def render():
    entries = []
    for path in DIARY.glob("[0-9][0-9][0-9][0-9]/*.md"):
        data = front(path.read_text(encoding="utf-8"))
        entries.append((data.get("fecha", path.stem[:10]), path, data))
    # Más reciente primero; el mismo día, por número de PR (las de PR pendiente son las más nuevas).
    def order(e):
        pr = e[2].get("pr", "")
        return (e[0], int(pr) if pr.isdigit() else 10**9 if pr == "?" else -1)

    entries.sort(key=order, reverse=True)

    rows = [
        "| Fecha | Entrada | Tipo | Vistas | Features | Issue | PR |",
        "| --- | --- | --- | --- | --- | --- | --- |",
    ]
    for fecha, path, data in entries:
        link = path.relative_to(DIARY).as_posix()
        rows.append(
            f"| {fecha} | [{title_of(path, data)}]({link}) | {data.get('tipo', '—')} | {items(data.get('vistas', ''))} "
            f"| {items(data.get('features', ''))} | {ref('issue', data.get('issue', ''))} | {ref('pr', data.get('pr', ''))} |"
        )
    return f"{INTRO}\n## Entradas ({len(entries)})\n\n" + "\n".join(rows) + "\n"


def main(check):
    content = render()
    if check:
        current = OUT.read_text(encoding="utf-8") if OUT.exists() else ""
        if current != content:
            print("docs/diario/index.md no está al día: ejecute python scripts/diario.py")
            return 1
        print("Índice del diario al día.")
        return 0
    OUT.write_text(content, encoding="utf-8")
    print(f"Índice del diario con {content.count(chr(10) + '| 2')} entradas.")
    return 0


if __name__ == "__main__":
    sys.exit(main("--check" in sys.argv))
