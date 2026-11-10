"""Cargas de un anexo de revisión de EE (T-24; la usa el flujo load-published-revisions de T-27, issue #42) y de una
variable diaria de XM SINERGOX (T-24; la usa el flujo ingest-observed-demand de T-28).

Siguen el recorrido raw → staging → core (PDA-01) y dejan bitácora (PDA-05). Las anomalías, los avisos y la
programación son de T-29.
"""
from __future__ import annotations

import hashlib
from dataclasses import dataclass
from datetime import date, timedelta
from pathlib import Path

import httpx
from psycopg.types.json import Jsonb

from lib import store, upme_annex, xm_sinergox
from lib.upme_annex import Message


@dataclass
class RevisionMeta:
    """Datos de la revisión que el anexo no trae (revisiones_ee.toml)."""
    code: str
    name: str
    file: str
    published_on: date
    document_url: str
    model: str
    source_consulted_on: date | None = None
    notes: str | None = None
    annex_url: str | None = None      # de donde se descarga el anexo en el despliegue (issue #42)
    annex_sha256: str | None = None   # la huella del anexo validado: otra huella no se carga


REVISIONS_FLOW = "load-published-revisions"


def load_annex(conn, path: Path, meta: RevisionMeta, flow: str = "trial-load-upme-annex") -> int:
    """Carga un anexo de EE como revisión publicada. Devuelve el id de la carga."""
    run_id = store.start_run(conn, flow, "upme_annex", "file")
    messages: list[Message] = []
    content = path.read_bytes()
    sha = hashlib.sha256(content).hexdigest()
    with conn.cursor() as cur:
        cur.execute("SELECT id FROM raw.files WHERE sha256 = %s", [sha])
        if cur.fetchone():
            msg = Message("info", "file_already_loaded", f"El archivo {path.name} ya estaba cargado; no se repite.",
                          {"file": path.name})
            store.add_messages(conn, run_id, [msg])
            store.finish_run(conn, run_id, "ok", msg.message, n_unchanged=1)
            return run_id
        cur.execute("SELECT 1 FROM core.revisions WHERE product = 'ee' AND code = %s", [meta.code])
        if cur.fetchone():
            msg = Message("error", "revision_exists",
                          f"La revisión ee {meta.code} ya existe y no se modifica; una corrección lleva otro código (P-0003).",
                          {"revision": meta.code})
            store.add_messages(conn, run_id, [msg])
            store.finish_run(conn, run_id, "failed", msg.message, n_errors=1)
            return run_id

    annex = upme_annex.read_annex(path)
    messages += annex.messages
    try:
        with conn.cursor() as cur:
            file_id = _save_raw_file(cur, run_id, path, content, sha, meta.code, annex)
            if annex.has_errors:
                raise _Stop()
            _save_staging(cur, run_id, meta.code, annex)
            revision_id = _promote_revision(cur, run_id, meta, annex, file_id)
        counts = {"n_new": len(annex.series_values) + len(annex.component_values)}
        summary = (f"Revisión ee {meta.code} cargada (id {revision_id}): {len(annex.series_values)} valores de series, "
                   f"{len(annex.component_values)} de {len(annex.components)} componentes, horizonte "
                   f"{annex.first_projected_period} a {annex.horizon_end}.")
    except _Stop:
        counts = {"n_new": 0}
        summary = f"El anexo {path.name} tiene errores; se guardó en raw y no pasó a core."
    except Exception as exc:  # la carga queda registrada como fallida antes de propagar el error
        conn.rollback()
        msg = Message("error", "load_failed", f"La carga de {path.name} falló: {type(exc).__name__}: {exc}",
                      {"file": path.name})
        store.add_messages(conn, run_id, [msg])
        store.finish_run(conn, run_id, "failed", msg.message, n_errors=1)
        raise
    levels = store.counts_by_level(messages)
    summary += f" Mensajes: {levels['error']} errores, {levels['warning']} advertencias, {levels['info']} informativos."
    store.add_messages(conn, run_id, messages)
    store.finish_run(conn, run_id, store.status_for(messages), summary, n_errors=levels["error"], **counts)
    return run_id


def annex_loaded(conn, sha256: str) -> bool:
    """Si un anexo con esa huella ya está en raw.files (cargado antes, a mano o por el flujo)."""
    with conn.cursor() as cur:
        cur.execute("SELECT 1 FROM raw.files WHERE source = 'upme_annex' AND sha256 = %s", [sha256])
        return cur.fetchone() is not None


class AnnexDownloadError(Exception):
    """El anexo no se pudo descargar o no es el que se validó. `code` va a operacion.load_messages."""

    def __init__(self, code: str, message: str):
        super().__init__(message)
        self.code = code


def download_annex(client: httpx.Client, meta: RevisionMeta, attempts: int = 3) -> bytes:
    """Descarga el anexo de `meta.annex_url` y verifica que su huella sea `meta.annex_sha256`.

    Reintenta los errores de red y los 5xx; un 4xx o una huella distinta no se reintentan. Una huella distinta
    puede ser otro archivo con otras cifras, y decidir si es una corrección es de una persona (P-0003).
    """
    if not meta.annex_url or not meta.annex_sha256:
        raise AnnexDownloadError("annex_url_missing",
                                 f"La revisión {meta.code} no tiene annex_url y annex_sha256 en revisiones_ee.toml.")
    for attempt in range(1, attempts + 1):
        try:
            response = client.get(meta.annex_url, follow_redirects=True, timeout=120)
        except httpx.HTTPError as exc:
            if attempt == attempts:
                raise AnnexDownloadError("annex_download_failed",
                                         f"No se pudo descargar el anexo de {meta.code}: {type(exc).__name__}: {exc}") from exc
            continue
        if response.status_code >= 500 and attempt < attempts:
            continue
        if response.status_code != 200:
            raise AnnexDownloadError("annex_download_failed",
                                     f"El sitio de la UPME respondió {response.status_code} al descargar el anexo de "
                                     f"{meta.code} ({meta.annex_url}).")
        sha = hashlib.sha256(response.content).hexdigest()
        if sha != meta.annex_sha256:
            raise AnnexDownloadError("annex_hash_mismatch",
                                     f"El anexo descargado de {meta.code} tiene la huella {sha} y no la validada "
                                     f"({meta.annex_sha256}): no se carga. Puede ser otro archivo con otras cifras; "
                                     "decidir si es una corrección es de una persona (P-0003).")
        return response.content
    raise AssertionError("inalcanzable")


def record_failure(conn, flow: str, meta: RevisionMeta, error: AnnexDownloadError) -> int:
    """Deja en la bitácora una carga fallida antes de leer el anexo (descarga o huella)."""
    run_id = store.start_run(conn, flow, "upme_annex", "file")
    msg = Message("error", error.code, str(error), {"revision": meta.code, "url": meta.annex_url})
    store.add_messages(conn, run_id, [msg])
    store.finish_run(conn, run_id, "failed", msg.message, n_errors=1)
    return run_id


class _Stop(Exception):
    """El anexo tiene errores: se guarda en raw y no pasa a staging ni a core."""


def _save_raw_file(cur, run_id, path, content, sha, revision_code, annex) -> int:
    cur.execute("""INSERT INTO raw.files (source, file_name, sha256, size_bytes, content, revision_code, load_run_id)
                   VALUES ('upme_annex', %s, %s, %s, %s, %s, %s) RETURNING id""",
                [path.name, sha, len(content), content, revision_code, run_id])
    file_id = cur.fetchone()[0]
    with cur.copy("COPY raw.file_cells (file_id, sheet, row_index, col_index, header_path, value_text, value_num) "
                  "FROM STDIN") as copy:
        for c in annex.cells:
            copy.write_row((file_id, c.sheet, c.row, c.col, annex.header_paths.get((c.sheet, c.row, c.col)),
                            c.value_text, c.value_num))
    return file_id


def _save_staging(cur, run_id, code, annex):
    with cur.copy("COPY staging.revision_values (load_run_id, product, revision_code, series, measure, geography, "
                  "frequency, period, value_type, value, basis) FROM STDIN") as copy:
        for v in annex.series_values:
            copy.write_row((run_id, "ee", code, v.series, v.measure, "ee_sin", v.frequency, v.period, v.value_type,
                            v.value, v.basis))
    cur.executemany("""INSERT INTO core.components (code, product, type, name, geography)
                       VALUES (%s, 'ee', %s, %s, %s) ON CONFLICT (code) DO NOTHING""",
                    [(c.code, c.type, c.published_name, c.geography) for c in annex.components.values()])
    cur.executemany("""INSERT INTO staging.revision_components (load_run_id, product, revision_code, component,
                                                                published_name, geography)
                       VALUES (%s, 'ee', %s, %s, %s, %s)""",
                    [(run_id, code, c.code, c.published_name, c.geography) for c in annex.components.values()])
    with cur.copy("COPY staging.revision_component_values (load_run_id, product, revision_code, component, measure, "
                  "frequency, period, value) FROM STDIN") as copy:
        for v in annex.component_values:
            copy.write_row((run_id, "ee", code, v.component, v.measure, v.frequency, v.period, v.value))


def _promote_revision(cur, run_id, meta, annex, file_id) -> int:
    data_cutoff = annex.first_projected_period - timedelta(days=1)  # el mes anterior al primero proyectado
    cur.execute("""INSERT INTO core.revisions (product, code, name, published_on, data_cutoff, source_consulted_on,
                                               first_projected_period, horizon_end, model, document_url, annex_file_id,
                                               status, notes, source)
                   VALUES ('ee', %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 'published', %s, 'upme_annex') RETURNING id""",
                [meta.code, meta.name, meta.published_on, data_cutoff, meta.source_consulted_on,
                 annex.first_projected_period, annex.horizon_end, meta.model, meta.document_url, file_id, meta.notes])
    revision_id = cur.fetchone()[0]
    cur.execute("""INSERT INTO core.revision_values (revision_id, series, measure, geography, frequency, period,
                                                     value_type, value, basis)
                   SELECT %s, series, measure, geography, frequency, period, value_type, value, basis
                     FROM staging.revision_values WHERE load_run_id = %s""", [revision_id, run_id])
    cur.execute("""INSERT INTO core.revision_component_values (revision_id, component, measure, frequency, period, value)
                   SELECT %s, component, measure, frequency, period, value
                     FROM staging.revision_component_values WHERE load_run_id = %s""", [revision_id, run_id])
    cur.execute("""INSERT INTO core.revision_components (revision_id, component, published_name, geography)
                   SELECT %s, component, published_name, geography
                     FROM staging.revision_components WHERE load_run_id = %s""", [revision_id, run_id])
    aliases = [("revision", meta.code, meta.file, "Nombre del anexo")]
    aliases += [("series", series, title, "Título en el anexo") for title, series in annex.series_aliases.items()]
    cur.executemany("""INSERT INTO core.aliases (entity, code, alias, revision_id, note) VALUES (%s, %s, %s, %s, %s)
                       ON CONFLICT ON CONSTRAINT uq_aliases DO NOTHING""",
                    [(e, c, a, revision_id, n) for e, c, a, n in aliases])
    return revision_id


XM_FLOW = "ingest-observed-demand"


def xm_variable(conn, variable: str) -> tuple[str, str]:
    """Métrica y entidad de XM de una variable de core.variables. Falla con un mensaje claro si no es de XM."""
    with conn.cursor() as cur:
        cur.execute("SELECT source_metric, source_entity FROM core.variables WHERE code = %s AND source = 'xm_sinergox'",
                    [variable])
        row = cur.fetchone()
    if row is None:
        raise ValueError(f"La variable {variable} no está en core.variables con fuente xm_sinergox.")
    return row


def load_xm_daily(conn, variable: str, start: date, end: date, client: httpx.Client | None = None,
                  flow: str = XM_FLOW, load_type: str = "backfill") -> int:
    """Carga una variable diaria de SINERGOX entre start y end. Guarda solo lo nuevo o lo que cambió (PBD-05).

    Devuelve el id de la carga (operacion.load_runs). Todo entra como accepted: las anomalías son de T-29 (X-24).
    """
    if start > end:
        raise ValueError(f"El rango está al revés: desde {start} hasta {end}.")
    metric, entity = xm_variable(conn, variable)
    run_id = store.start_run(conn, flow, "xm_sinergox", load_type, start, end)
    messages: list[Message] = []
    client = client or httpx.Client()
    extraction_ids, found, retries = [], set(), 0
    for chunk_start, chunk_end in xm_sinergox.month_chunks(start, end):
        ext = xm_sinergox.fetch_daily(client, metric, entity, chunk_start, chunk_end)
        retries += ext.retries
        with conn.cursor() as cur:
            cur.execute("""INSERT INTO operacion.extractions (load_run_id, source, request, http_status, row_count,
                                                              content_hash, error)
                           VALUES (%s, 'xm_sinergox', %s, %s, %s, %s, %s) RETURNING id""",
                        [run_id, Jsonb(ext.request), ext.http_status, len(ext.rows), ext.content_hash, ext.error])
            ext_id = cur.fetchone()[0]
            extraction_ids.append(ext_id)
            cur.executemany("""INSERT INTO raw.xm_sinergox_values (extraction_id, metric, entity, code, date, value_text)
                               VALUES (%s, %s, %s, %s, %s, %s)""",
                            [(ext_id, metric, entity, r["code"], r["date"], r["value_text"]) for r in ext.rows])
        conn.commit()
        if ext.error:
            messages.append(Message("error", "extraction_failed",
                                    f"XM no respondió para {metric} del {chunk_start} al {chunk_end}: {ext.error}",
                                    {"metric": metric, "start": str(chunk_start), "end": str(chunk_end)}))
        found |= {r["date"] for r in ext.rows}

    with conn.cursor() as cur:
        # staging: texto → número y unidad de XM → unidad de la variable (PDA-01)
        cur.execute("""INSERT INTO staging.observed_values (load_run_id, variable, geography, frequency, period, value,
                                                            quality_status, extraction_id)
                       SELECT %s, v.code, 'ee_sin', 'D', r.date, r.value_text::numeric * v.factor, 'accepted',
                              r.extraction_id
                         FROM raw.xm_sinergox_values r
                         JOIN core.variables v ON v.code = %s
                        WHERE r.extraction_id = ANY(%s) AND r.value_text IS NOT NULL
                        ORDER BY r.date""", [run_id, variable, extraction_ids])
        counts = _promote_observed(cur, run_id)
        cur.execute("""INSERT INTO operacion.source_status (source, last_success_at, last_period, days_stale, updated_at)
                       SELECT 'xm_sinergox', now(), max(period)::date, current_date - max(period)::date, now()
                         FROM core.observed_values WHERE variable = %s
                       ON CONFLICT (source) DO UPDATE SET last_success_at = EXCLUDED.last_success_at,
                             last_period = EXCLUDED.last_period, days_stale = EXCLUDED.days_stale, updated_at = now()""",
                    [variable])
    for gap_start, gap_end in xm_sinergox.missing_days(found, start, end):
        days = (gap_end - gap_start).days + 1
        messages.append(Message("warning", "days_missing",
                                f"{metric}: faltan {days} día(s) del {gap_start} al {gap_end}.",
                                {"metric": metric, "start": str(gap_start), "end": str(gap_end), "days": days}))
    levels = store.counts_by_level(messages)
    summary = (f"{metric} del {start} al {end}: {len(found)} días recibidos; {counts['n_new']} nuevos, "
               f"{counts['n_changed']} cambiados y {counts['n_unchanged']} sin cambio. "
               f"{levels['warning']} advertencias y {levels['error']} errores.")
    store.add_messages(conn, run_id, messages)
    store.finish_run(conn, run_id, store.status_for(messages), summary, n_queried=(end - start).days + 1,
                     n_errors=levels["error"], retries=retries, **counts)
    return run_id


def _promote_observed(cur, run_id) -> dict[str, int]:
    """Pasa de staging a core solo lo nuevo o lo que cambió: una versión nueva por cambio, con su registro (PBD-05)."""
    cur.execute("""
        WITH s AS (
            SELECT s.*, l.version AS last_version, l.value AS last_value
              FROM staging.observed_values s
              LEFT JOIN LATERAL (
                   SELECT version, value FROM core.observed_values o
                    WHERE o.variable = s.variable AND o.geography = s.geography AND o.frequency = s.frequency
                      AND o.period = s.period
                    ORDER BY version DESC LIMIT 1) l ON true
             WHERE s.load_run_id = %(run)s
        ), changed AS (
            INSERT INTO core.observed_changes (variable, geography, frequency, period, old_version, new_version,
                                               old_value, new_value, diff, diff_pct, load_run_id)
            SELECT variable, geography, frequency, period, last_version, last_version + 1, last_value, value,
                   value - last_value, CASE WHEN last_value <> 0 THEN (value - last_value) / last_value * 100 END, %(run)s
              FROM s WHERE last_version IS NOT NULL AND value <> last_value
        ), inserted AS (
            INSERT INTO core.observed_values (variable, geography, frequency, period, version, value, source_version,
                                              quality_status, load_run_id, extraction_id)
            SELECT variable, geography, frequency, period, COALESCE(last_version, 0) + 1, value, source_version,
                   quality_status, %(run)s, extraction_id
              FROM s WHERE last_version IS NULL OR value <> last_value
            RETURNING version
        )
        SELECT count(*) FILTER (WHERE version = 1), count(*) FILTER (WHERE version > 1),
               (SELECT count(*) FROM s) - count(*)
          FROM inserted""", {"run": run_id})
    n_new, n_changed, n_unchanged = cur.fetchone()
    return {"n_new": n_new, "n_changed": n_changed, "n_unchanged": n_unchanged}
