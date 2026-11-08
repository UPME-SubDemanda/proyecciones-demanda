#!/usr/bin/env python3
"""Detecta valores de diseño sueltos (TOK-02) en el código de un proyecto.

Uso: python lint_design.py src [otra_carpeta ...]
Excepción justificada: comentario en la misma línea  design-lint-ignore: <motivo>
"""
import re, sys
from pathlib import Path

EXT = {".ts", ".tsx", ".js", ".jsx", ".css", ".scss", ".html"}
SKIP = {"node_modules", ".next", "dist", "build", "estandares", "coverage"}
RULES = [
    (re.compile(r"#[0-9a-fA-F]{3,8}\b"), "Color hexadecimal suelto: use un token (TOK-02)"),
    (re.compile(r"\brgba?\(\s*\d"), "Color rgb() suelto: use un token (TOK-02)"),
    (re.compile(r"font-family\s*:(?!\s*var\()"), "Familia tipográfica suelta: use var(--font-sans) (TOK-02)"),
    (re.compile(r"\b(?:bg|text|border|fill|stroke)-\[#"), "Clase Tailwind con color arbitrario (TOK-02)"),
    (re.compile(r"\b(?:lucide-react|@heroicons|@mui/icons-material|react-icons|@fortawesome)\b"), "Librería de íconos externa: use la de la marca (MAR-06)"),
    (re.compile(r"type\s*:\s*['\"]pie['\"]"), "Gráfico de torta prohibido (GRA-03)"),
    (re.compile(r"from ['\"](?:recharts|chart\.js|plotly|victory|nivo)"), "Librería de gráficos distinta de ECharts (GRA-00)"),
]


def main(paths):
    n = 0
    for root in paths:
        for f in Path(root).rglob("*"):
            if not f.is_file() or f.suffix not in EXT or any(p in SKIP for p in f.parts):
                continue
            for i, line in enumerate(f.read_text(encoding="utf-8", errors="ignore").splitlines(), 1):
                if "design-lint-ignore" in line:
                    continue
                for rx, msg in RULES:
                    if rx.search(line):
                        print(f"{f}:{i}: {msg}\n    {line.strip()[:120]}")
                        n += 1
    print(f"{n} problema(s) de diseño." if n else "Sin problemas de diseño.")
    return 1 if n else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:] or ["src"]))
