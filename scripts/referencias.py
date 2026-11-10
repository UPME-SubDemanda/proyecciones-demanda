#!/usr/bin/env python3
"""Genera docs/tecnica/referencias.md: qué significa cada ID que se cita en el proyecto.

Fuentes:
    reglas/*.md          reglas del estándar (FLU-07, DOC-04, PRI-01…)
    docs/pendientes.md   pasos del plan de trabajo (T-xx) y pendientes de decisión (X-xx)
    docs/decisiones/     decisiones del proyecto (P-0001…)
Los IDs citados que no se definen en ninguna fuente (por ejemplo, pendientes de
upme-estandares como P-06) se listan aparte.

Uso:
    python scripts/referencias.py          # regenera la página
    python scripts/referencias.py --check  # falla si la página no está al día
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
RULES = ROOT / "reglas"
PROJECT_RULES = ROOT / "docs/tecnica/reglas-proyecto.md"  # reglas propias del proyecto (PFL-02)
PENDING = ROOT / "docs/pendientes.md"
ADRS = ROOT / "docs/decisiones"
OUT = ROOT / "docs/tecnica/referencias.md"
REPO_URL = "https://github.com/UPME-SubDemanda/proyecciones-demanda/blob/develop"

RULE_ID = r"(?:UPME-)?[A-Z][A-Z0-9]{1,3}-\d{2}"
# **FLU-07 (DEBE)** texto…   o   **PRI-01 · Título.** texto…
RULE_DEF = re.compile(rf"^\*\*({RULE_ID})(?: \(([^)]+)\))?(?: · ([^*]+?))?\*\*\s*(.*)$")
# IDs citados en cualquier texto, para detectar los que no se definen aquí.
CITED = re.compile(r"(?<![\w-])(?:(?:UPME-)?[A-Z][A-Z0-9]{1,3}-\d{2}|[TXP]-\d{2}|P-\d{4}|ADR-\d{4})(?![\w-])")


def slug(ref_id):
    return ref_id.lower()


def heading_anchor(text):
    """Ancla de un encabezado como la genera la extensión toc de Python-Markdown."""
    text = re.sub(r"[^\w\s-]", "", text.lower()).strip()
    return re.sub(r"[-\s]+", "-", text)


def mkdocs_anchor(text):
    """Ancla como la genera MkDocs (toc de Python-Markdown): además quita las tildes. Se usa en los
    enlaces internos del sitio; los enlaces a GitHub usan heading_anchor, que las conserva."""
    import unicodedata
    plain = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode("ascii")
    return heading_anchor(plain)


def is_fence(line):
    return line.lstrip().startswith("```")


def take_block(lines, i):
    """Líneas desde i hasta la siguiente línea en blanco fuera de un bloque de código."""
    out, fence = [], False
    while i < len(lines) and (fence or lines[i].strip()):
        if is_fence(lines[i]):
            fence = not fence
        out.append(lines[i].rstrip())
        i += 1
    return out, i


def parse_rules():
    """Devuelve {familia: (nombre de la sección, archivo, [entradas])} en orden de aparición.

    Lee las reglas del estándar (`reglas/`) y las propias del proyecto (`docs/tecnica/reglas-proyecto.md`).
    """
    families, seen = {}, {}
    sources = [*sorted(RULES.glob("*.md"))]
    if PROJECT_RULES.exists():
        sources.append(PROJECT_RULES)
    for path in sources:
        rel = path.relative_to(ROOT).as_posix()
        if path == PROJECT_RULES:  # misma carpeta que la página de referencias: enlace interno
            base_url, anchor = path.name, mkdocs_anchor
        else:
            base_url, anchor = f"{REPO_URL}/{rel}", heading_anchor
        lines = path.read_text(encoding="utf-8").splitlines()
        section = subsection = ""
        in_fence = False
        i = 0
        while i < len(lines):
            line = lines[i]
            if is_fence(line):
                in_fence = not in_fence
                i += 1
                continue
            if in_fence:  # los «##» dentro de un bloque de código no son títulos
                i += 1
                continue
            if line.startswith("## "):
                section, subsection = line[3:].strip(), ""
            elif line.startswith("### "):
                subsection = line[4:].strip()
            m = RULE_DEF.match(line)
            if not m:
                i += 1
                continue
            ref_id, level, title, text = m.groups()
            rest, i = take_block(lines, i + 1)
            block = [text.strip(), *rest]
            # Si el texto anuncia una lista, tabla o ejemplo («…:»), se incluye el bloque siguiente.
            if block[-1].rstrip().endswith(":") and i + 1 < len(lines):
                extra, i = take_block(lines, i + 1)
                block += extra
            body = "\n".join(block).strip()
            if title:
                body = f"**{title.strip().rstrip('.')}.** {body}".strip()
            family = ref_id.rsplit("-", 1)[0]
            # En la marca, la familia es el subtítulo («Logos (UPME-LOG)»).
            heading = subsection if f"({family})" in subsection else section
            entry = {
                "id": ref_id,
                "level": (level or "").strip(),
                "body": body,
                "source": f"{path.name} · {heading}",
                "url": f"{base_url}#{anchor(heading)}",
            }
            if ref_id in seen:  # mismo ID en dos lugares (resumen y detalle): se unen
                prev = seen[ref_id]
                prev["body"] += "\n\n" + entry["body"]
                prev["source"] += f"; {entry['source']}"
                continue
            seen[ref_id] = entry
            families.setdefault(family, (heading, rel, []))[2].append(entry)
    return families


def table_rows(text, header_start):
    """Filas de las tablas cuyo encabezado empieza por header_start."""
    rows, in_table, cols = [], False, []
    for line in text.splitlines():
        if line.startswith(header_start):
            in_table, cols = True, [c.strip() for c in line.strip("|").split("|")]
            continue
        if in_table:
            if not line.startswith("|"):
                in_table = False
                continue
            cells = [c.strip() for c in line.strip("|").split("|")]
            if set(cells[0]) <= {"-", " "}:
                continue
            rows.append(dict(zip(cols, cells)))
    return rows


def from_docs_root(text):
    """Los enlaces relativos de docs/pendientes.md se escriben desde docs/; la página de
    referencias está en docs/tecnica/, así que se les antepone «../»."""
    return re.sub(r"\]\((?!https?:|#|\.\./)([^)]+)\)", r"](../\1)", text)


def parse_pending():
    text = from_docs_root(PENDING.read_text(encoding="utf-8"))
    steps = table_rows(text, "| ID | Paso |")
    decisions = table_rows(text, "| ID | Tema |")
    return steps, decisions


def parse_adrs():
    adrs = []
    for path in sorted(ADRS.glob("[0-9]*.md")):
        text = path.read_text(encoding="utf-8")
        m = re.search(r"^# ADR (P-\d{4}) · (.+)$", text, re.M)
        if not m:
            continue
        status = re.search(r"\*\*Estado:\*\* ([^·\n]+)", text)
        adrs.append({"id": m.group(1), "title": m.group(2).strip(), "file": path.name,
                     "status": status.group(1).strip() if status else ""})
    return adrs


def context(line, ref_id, width=160):
    """Fragmento de la línea alrededor del ID, sin marcas de Markdown que rompan la tabla."""
    text = re.sub(r"[*`|]", "", line).strip(" -#>")
    pos = text.find(ref_id)
    start = max(0, pos - width // 2)
    snippet = text[start:start + width].strip()
    return ("…" if start > 0 else "") + snippet + ("…" if start + width < len(text) else "")


def cited_ids():
    found = {}
    files = [*RULES.glob("*.md"), ROOT / "AGENTS.md", ROOT / "CHANGELOG.md",
             *(p for p in (ROOT / "docs").rglob("*.md") if p != OUT)]
    for path in files:
        for line in path.read_text(encoding="utf-8").splitlines():
            for ref_id in CITED.findall(line):
                item = found.setdefault(ref_id, {"files": set(), "context": ""})
                item["files"].add(str(path.relative_to(ROOT)))
                if not item["context"]:
                    item["context"] = context(line, ref_id)
    return found


def render():
    families = parse_rules()
    steps, decisions = parse_pending()
    adrs = parse_adrs()
    defined = {e["id"] for _, _, entries in families.values() for e in entries}
    defined |= {r["ID"] for r in steps} | {r["ID"] for r in decisions} | {a["id"] for a in adrs}
    external = {k: v for k, v in cited_ids().items() if k not in defined}

    out = [
        "---",
        "hide: [toc]",
        "---",
        "",
        "# Referencias",
        "",
        "Qué significa cada ID que se cita en el proyecto. Escriba el ID en el buscador (por ejemplo `DOC-04` o `T-05`) o use el índice.",
        "",
        "Generado por `scripts/referencias.py` desde `reglas/`, `docs/tecnica/reglas-proyecto.md`, `docs/pendientes.md` y `docs/decisiones/`. No editar a mano: cambie la fuente y regenere.",
        "",
        "## Índice",
        "",
        "| Familia | Sección | Fuente | IDs |",
        "| --- | --- | --- | --- |",
    ]
    for family, (section, fname, entries) in families.items():
        out.append(f"| [{family}](#{slug(family)}) | {section} | `{fname}` | {len(entries)} |")
    out += [
        f"| [T](#t) | Plan de trabajo | `docs/pendientes.md` | {len(steps)} |",
        f"| [X](#x) | Pendientes de decisión | `docs/pendientes.md` | {len(decisions)} |",
        f"| [P-0000](#p-0000) | Decisiones del proyecto (ADR) | `docs/decisiones/` | {len(adrs)} |",
        f"| [Externos](#externos) | Citados pero definidos fuera de este repositorio | `upme-estandares` | {len(external)} |",
        "",
    ]

    for family, (section, fname, entries) in families.items():
        out += [f"## {family} · {section} {{#{slug(family)}}}", ""]
        for e in entries:
            level = f" · {e['level']}" if e["level"] else ""
            out += [f"### {e['id']}{level} {{#{slug(e['id'])}}}", "", e["body"], "",
                    f"Fuente: [{e['source']}]({e['url']})", ""]

    out += ["## T · Plan de trabajo {#t}", ""]
    for r in steps:
        out += [f"### {r['ID']} · {r.get('Estado', '')} {{#{slug(r['ID'])}}}", "", r.get("Paso", ""), "",
                f"Etapa: {r.get('Etapa', '')} · Depende de: {r.get('Depende de', '')} · "
                f"Issue: {r.get('Issue', '')} · PR: {r.get('PR', '')}", "",
                "Fuente: [Plan de trabajo](../pendientes.md#plan-de-trabajo)", ""]

    out += ["## X · Pendientes de decisión {#x}", ""]
    for r in decisions:
        out += [f"### {r['ID']} · {r.get('Tema', '')} {{#{slug(r['ID'])}}}", "", r.get("Qué falta", ""), "",
                f"Responsable: {r.get('Responsable', '')} · Estado: {r.get('Estado', '')}", "",
                "Fuente: [Pendientes de decisión](../pendientes.md#pendientes-de-decision)", ""]

    out += ["## P-0000 · Decisiones del proyecto (ADR) {#p-0000}", ""]
    for a in adrs:
        out += [f"### {a['id']} · {a['title']} {{#{slug(a['id'])}}}", "", f"Estado: {a['status']}", "",
                f"Fuente: [{a['file']}](../decisiones/{a['file']})", ""]

    out += ["## Externos {#externos}", "",
            "IDs citados en este repositorio que se definen en `upme-estandares` (por ejemplo, sus pendientes P-xx y sus ADR) "
            "o que no se encontraron en ninguna fuente. Si uno de estos debería existir aquí, es un error de la cita o de la fuente.", "",
            "| ID | Contexto (primera cita) | Citado en |", "| --- | --- | --- |"]
    for ref_id in sorted(external):
        files = sorted(external[ref_id]["files"])
        where = ", ".join(f"`{p}`" for p in files[:3])
        more = len(files) - 3
        out.append(f"| {ref_id} | {external[ref_id]['context']} | {where}{f' y {more} más' if more > 0 else ''} |")
    out.append("")
    return "\n".join(out)


def main(check):
    content = render()
    if check:
        current = OUT.read_text(encoding="utf-8") if OUT.exists() else ""
        if current != content:
            print("docs/tecnica/referencias.md no está al día: ejecute python scripts/referencias.py")
            return 1
        print("Referencias al día.")
        return 0
    OUT.write_text(content, encoding="utf-8")
    print(f"Referencias generadas en {OUT.relative_to(ROOT)}.")
    return 0


if __name__ == "__main__":
    sys.exit(main("--check" in sys.argv))
