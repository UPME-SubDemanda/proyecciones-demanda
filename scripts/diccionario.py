"""Genera el diccionario de la base de datos desde los comentarios de PostgreSQL (PBD-03).

Lee los esquemas del proyecto (raw, staging, core, publicacion, auth, operacion) de una base con
las migraciones aplicadas y escribe docs/tecnica/base-de-datos/diccionario.md. Con --check falla si
falta un comentario (diciendo cuál y cómo corregirlo) o si la página no está al día.

Necesita psycopg, que está en el entorno del backend:

    cd backend && DATABASE_URL=postgresql+psycopg://app:app@localhost:5432/proyecciones_demanda \\
        uv run python ../scripts/diccionario.py [--check]

En la CI corre contra la base PostgreSQL de prueba (PBD-04).
"""
import argparse
import os
import sys
from pathlib import Path

import psycopg

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "docs/tecnica/base-de-datos/diccionario.md"
SCHEMAS = ["raw", "staging", "core", "publicacion", "auth", "operacion"]
KINDS = {"r": "tabla", "p": "tabla particionada", "v": "vista", "m": "vista materializada"}
COMMENT_HOW = {
    "schema": "Agrégalo con COMMENT ON SCHEMA en la migración.",
    "tabla": "Agrégalo con comment= en op.create_table o con COMMENT ON TABLE en la migración.",
    "tabla particionada": "Agrégalo con COMMENT ON TABLE en la migración.",
    "partición": "Agrégalo con COMMENT ON TABLE en la migración.",
    "vista": "Agrégalo con COMMENT ON VIEW en la migración.",
    "vista materializada": "Agrégalo con COMMENT ON MATERIALIZED VIEW en la migración.",
    "columna": "Agrégalo con comment= en la columna o con COMMENT ON COLUMN en la migración.",
    "función": "Agrégalo con COMMENT ON FUNCTION en la migración.",
}


OF = {"schema": "del esquema", "tabla": "de la tabla", "tabla particionada": "de la tabla particionada",
      "partición": "de la partición", "vista": "de la vista", "vista materializada": "de la vista materializada",
      "columna": "de la columna", "función": "de la función"}


def connect():
    url = os.environ.get("DATABASE_URL", "")
    if not url.startswith("postgresql"):
        sys.exit("DATABASE_URL debe apuntar a PostgreSQL con las migraciones aplicadas (ver el inicio del script).")
    return psycopg.connect(url.replace("postgresql+psycopg://", "postgresql://"))


def read(conn):
    """Esquemas, relaciones, columnas y funciones con sus comentarios, en orden fijo."""
    data = {}
    with conn.cursor() as cur:
        for schema in SCHEMAS:
            cur.execute("SELECT oid, obj_description(oid, 'pg_namespace') FROM pg_namespace WHERE nspname = %s", [schema])
            row = cur.fetchone()
            if row is None:
                data[schema] = None
                continue
            ns_oid, ns_comment = row
            cur.execute("""
                SELECT c.oid, c.relname, c.relkind, c.relispartition, obj_description(c.oid, 'pg_class'),
                       (SELECT pn.nspname || '.' || pc.relname FROM pg_inherits i
                          JOIN pg_class pc ON pc.oid = i.inhparent JOIN pg_namespace pn ON pn.oid = pc.relnamespace
                         WHERE i.inhrelid = c.oid)
                  FROM pg_class c
                 WHERE c.relnamespace = %s AND c.relkind IN ('r', 'p', 'v', 'm')
                 ORDER BY c.relname""", [ns_oid])
            relations = []
            for oid, name, kind, is_partition, comment, parent in cur.fetchall():
                cur.execute("""
                    SELECT a.attname, format_type(a.atttypid, a.atttypmod), a.attnotnull,
                           col_description(a.attrelid, a.attnum),
                           EXISTS (SELECT 1 FROM pg_index i WHERE i.indrelid = a.attrelid AND i.indisprimary
                                     AND a.attnum = ANY (i.indkey))
                      FROM pg_attribute a
                     WHERE a.attrelid = %s AND a.attnum > 0 AND NOT a.attisdropped
                     ORDER BY a.attnum""", [oid])
                relations.append({
                    "name": name, "kind": "partición" if is_partition else KINDS[kind], "comment": comment,
                    "parent": parent, "columns": cur.fetchall(),
                })
            cur.execute("""
                SELECT p.proname || '(' || pg_get_function_identity_arguments(p.oid) || ')',
                       obj_description(p.oid, 'pg_proc')
                  FROM pg_proc p WHERE p.pronamespace = %s AND p.prokind = 'f' ORDER BY 1""", [ns_oid])
            data[schema] = {"comment": ns_comment, "relations": relations, "functions": cur.fetchall()}
    return data


def missing(data):
    """Objetos sin comentario, con un mensaje que dice cuál y cómo corregirlo (PBD-03)."""
    out = []

    def add(kind, name):
        out.append(f"Falta el comentario {OF[kind]} {name}. {COMMENT_HOW[kind]}")

    for schema, info in data.items():
        if info is None:
            out.append(f"No existe el esquema {schema}: aplique las migraciones (alembic upgrade head).")
            continue
        if not info["comment"]:
            add("schema", schema)
        for rel in info["relations"]:
            full = f"{schema}.{rel['name']}"
            if not rel["comment"]:
                add(rel["kind"], full)
            if rel["kind"] == "partición":  # sus columnas son las de la tabla particionada
                continue
            for col, _type, _notnull, comment, _pk in rel["columns"]:
                if not comment:
                    add("columna", f"{full}.{col}")
        for fn, comment in info["functions"]:
            if not comment:
                add("función", f"{schema}.{fn}")
    return out


def cell(text):
    return (text or "").replace("|", "\\|").replace("\n", " ")


def render(data):
    out = [
        "# Diccionario de la base de datos",
        "",
        "Cada esquema, tabla, vista, función y columna con su comentario en la base (PBD-01).",
        "",
        ("Generado por `scripts/diccionario.py` desde una base con las migraciones aplicadas. No editar a mano: "
         "cambie el comentario en una migración y regenere (PBD-03). Explicación de cada esquema, con contexto y "
         "ejemplos: [Base de datos](index.md)."),
        "",
    ]
    for schema, info in data.items():
        out += [f"## `{schema}`", "", cell(info["comment"]) if info else "", ""]
        if not info:
            continue
        if not info["relations"] and not info["functions"]:
            out += ["Sin tablas todavía.", ""]
        for rel in info["relations"]:
            full = f"{schema}.{rel['name']}"
            out += [f"### `{full}`", "", f"*{rel['kind'].capitalize()}.* {cell(rel['comment'])}", ""]
            if rel["kind"] == "partición":
                out += [f"Columnas: las de `{rel['parent']}`.", ""]
                continue
            out += ["| Columna | Tipo | Obligatoria | Llave | Descripción |", "| --- | --- | --- | --- | --- |"]
            for col, type_, notnull, comment, pk in rel["columns"]:
                out.append(f"| `{col}` | {type_} | {'Sí' if notnull else 'No'} | {'Sí' if pk else ''} | {cell(comment)} |")
            out.append("")
        if info["functions"]:
            out += ["### Funciones", "", "| Función | Descripción |", "| --- | --- |"]
            out += [f"| `{schema}.{fn}` | {cell(comment)} |" for fn, comment in info["functions"]]
            out.append("")
    return "\n".join(out).rstrip() + "\n"


def main(check):
    with connect() as conn:
        data = read(conn)
    problems = missing(data)
    for p in problems:
        print(p)
    content = render(data)
    if check:
        current = OUT.read_text(encoding="utf-8") if OUT.exists() else ""
        if current != content:
            print("docs/tecnica/base-de-datos/diccionario.md no está al día: ejecute scripts/diccionario.py "
                  "contra una base con las migraciones aplicadas.")
            return 1
        if problems:
            return 1
        print("Diccionario al día y todos los objetos tienen comentario.")
        return 0
    OUT.write_text(content, encoding="utf-8")
    print(f"Diccionario generado en {OUT.relative_to(ROOT)}.")
    return 1 if problems else 0


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--check", action="store_true", help="falla si falta un comentario o la página no está al día")
    sys.exit(main(parser.parse_args().check))
