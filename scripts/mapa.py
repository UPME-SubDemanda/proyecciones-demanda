#!/usr/bin/env python3
"""Escribe la sección «Mapa del repositorio» del README a partir de repo-map.toml.

Carpetas que deben estar descritas: todas las versionadas de primer y segundo nivel, y las de tercer nivel
dentro de las rutas de `expandir`. Solo cuentan las carpetas con archivos versionados (git ls-files).

Uso:
    python scripts/mapa.py          # regenera el mapa en el README (falla si falta una descripción)
    python scripts/mapa.py --check  # falla si el mapa no está al día, falta una descripción o sobra una
"""
import subprocess
import sys
import tomllib
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CONFIG = ROOT / "repo-map.toml"
README = ROOT / "README.md"
START = "<!-- mapa:inicio (generado por scripts/mapa.py desde repo-map.toml; no editar a mano) -->"
END = "<!-- mapa:fin -->"


def tracked_files() -> list[str]:
    out = subprocess.run(["git", "ls-files"], cwd=ROOT, capture_output=True, text=True, check=True).stdout
    return [line for line in out.splitlines() if line]


def required_dirs(files: list[str], expand: list[str]) -> set[str]:
    dirs: set[str] = set()
    for f in files:
        parts = f.split("/")[:-1]
        for depth in range(1, min(len(parts), 2) + 1):
            dirs.add("/".join(parts[:depth]))
        for base in expand:
            prefix = base + "/"
            if f.startswith(prefix) and len(parts) > base.count("/") + 1:
                dirs.add("/".join(parts[: base.count("/") + 2]))
    return dirs


def problems(config: dict, files: list[str]) -> list[str]:
    described = set(config.get("carpetas", {}))
    required = required_dirs(files, config.get("expandir", []))
    existing_dirs = {"/".join(f.split("/")[:i]) for f in files for i in range(1, f.count("/") + 1)}
    out = [f"Carpeta sin descripción en repo-map.toml: {d}" for d in sorted(required - described)]
    out += [f"repo-map.toml describe una carpeta que no existe: {d}" for d in sorted(described - existing_dirs)]
    out += [f"repo-map.toml describe un archivo que no existe: {a}" for a in sorted(config.get("archivos", {})) if a not in files]
    for d, entry in config.get("carpetas", {}).items():
        for key in ("breve", "va_aqui"):
            if not entry.get(key):
                out.append(f"repo-map.toml: a «{d}» le falta «{key}»")
    return out


def render(config: dict) -> str:
    folders = config["carpetas"]
    # Árbol: cada carpeta con su descripción breve, en orden alfabético y con sangría por nivel.
    width = max(len("  " * d.count("/") + d.split("/")[-1] + "/") for d in folders) + 2
    tree = []
    for d in sorted(folders, key=lambda p: p.split("/")):
        name = "  " * d.count("/") + d.split("/")[-1] + "/"
        tree.append(f"{name.ljust(width)}# {folders[d]['breve']}")
    lines = [
        START,
        "",
        "```text",
        *tree,
        "```",
        "",
        "| Carpeta | Qué debe ir aquí |",
        "| --- | --- |",
        *[f"| `{d}/` | {folders[d]['va_aqui']} |" for d in sorted(folders, key=lambda p: p.split("/"))],
        "",
        "**Archivos principales**",
        "",
        "| Archivo | Para qué sirve |",
        "| --- | --- |",
        *[f"| `{a}` | {text} |" for a, text in config.get("archivos", {}).items()],
        "",
        END,
    ]
    return "\n".join(lines)


def updated_readme(config: dict) -> str:
    text = README.read_text(encoding="utf-8")
    if START not in text or END not in text:
        raise SystemExit(f"README.md no tiene las marcas del mapa:\n{START}\n{END}")
    before, rest = text.split(START, 1)
    _, after = rest.split(END, 1)
    return before + render(config) + after


def main(check: bool) -> int:
    config = tomllib.loads(CONFIG.read_text(encoding="utf-8"))
    issues = problems(config, tracked_files())
    if issues:
        print("Mapa del repositorio incompleto (repo-map.toml):\n  " + "\n  ".join(issues))
        print("Describa cada carpeta nueva en repo-map.toml (breve y va_aqui) y quite las que ya no existen.")
        return 1
    content = updated_readme(config)
    if check:
        if README.read_text(encoding="utf-8") != content:
            print("El mapa del README no está al día: ejecute python scripts/mapa.py")
            return 1
        print("Mapa del repositorio al día.")
        return 0
    README.write_text(content, encoding="utf-8")
    print("Mapa del repositorio actualizado en README.md.")
    return 0


if __name__ == "__main__":
    sys.exit(main("--check" in sys.argv))
