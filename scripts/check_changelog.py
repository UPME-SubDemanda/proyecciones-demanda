#!/usr/bin/env python3
"""FLU-10: falla si el PR no modifica CHANGELOG.md. Uso: python scripts/check_changelog.py origin/develop"""
import subprocess, sys

base = sys.argv[1] if len(sys.argv) > 1 else "origin/develop"
changed = subprocess.run(["git", "diff", "--name-only", f"{base}...HEAD"], capture_output=True, text=True).stdout.split()
if "CHANGELOG.md" not in changed:
    print("Falta una entrada en CHANGELOG.md (FLU-10, DOC-04). Agregue la línea bajo [Sin publicar].")
    sys.exit(1)
diario = [f for f in changed if f.startswith("docs/diario/")]
if not diario:
    print("Aviso: el PR no agrega entrada en docs/diario/ (DOC-05).")
print("Changelog verificado.")
