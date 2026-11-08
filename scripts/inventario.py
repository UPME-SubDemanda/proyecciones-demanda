#!/usr/bin/env python3
"""Genera docs/usuario/inventario/index.md desde el front matter de cada página (DOC-02).

Uso:
    python scripts/inventario.py          # regenera la tabla
    python scripts/inventario.py --check  # falla si hay rutas del frontend sin página o campos faltantes
"""
import re, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
INV = ROOT / "docs/usuario/inventario"
ROUTES = ROOT / "frontend/src/routes.config.tsx"
REQUIRED = ["id", "titulo", "zona", "ruta", "roles", "estado", "diseno", "actualizado"]


def front(p):
    m = re.match(r"---\n(.*?)\n---", p.read_text(encoding="utf-8"), re.S)
    data = {}
    if m:
        for line in m.group(1).splitlines():
            if ":" in line:
                k, v = line.split(":", 1)
                data[k.strip()] = v.split("#")[0].strip()
    return data


def main(check):
    pages = [p for p in sorted(INV.glob("*.md")) if p.name != "index.md"]
    rows, errors = [], []
    for p in pages:
        d = front(p)
        errors += [f"{p.name}: falta '{k}'" for k in REQUIRED if not d.get(k)]
        rows.append(f"| [{d.get('titulo', p.stem)}]({p.name}) | {d.get('zona', '')} | `{d.get('ruta', '')}` | {d.get('roles', '')} | {d.get('estado', '')} | {d.get('actualizado', '')} |")
    documented = {front(p).get("ruta") for p in pages}
    if ROUTES.exists():
        routes = set(re.findall(r"\{\s*path:\s*['\"]([^'\"]+)['\"]", ROUTES.read_text(encoding="utf-8")))
        errors += [f"Ruta sin página de inventario: {r}" for r in sorted(routes - documented)]
    out = ("# Inventario de vistas y features\n\nGenerado por `scripts/inventario.py`. No editar a mano.\n\n"
           "| Vista / feature | Zona | Ruta | Roles | Estado | Actualizado |\n| --- | --- | --- | --- | --- | --- |\n" + "\n".join(rows) + "\n")
    if check:
        if errors:
            print("Inventario incompleto (DOC-01, DOC-02):\n  " + "\n  ".join(errors))
            return 1
        print("Inventario completo.")
        return 0
    (INV / "index.md").write_text(out, encoding="utf-8")
    print(f"{len(rows)} vistas en el inventario.")
    return 0


if __name__ == "__main__":
    sys.exit(main("--check" in sys.argv))
