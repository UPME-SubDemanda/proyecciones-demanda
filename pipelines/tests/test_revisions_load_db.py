"""Carga de una revisión desde el sitio de la UPME de punta a punta contra PostgreSQL (issue #42), con la descarga
simulada (httpx.MockTransport) y un anexo pequeño con la forma real (el de test_upme_annex.py).

Corre en el job `base-de-datos` de la CI y contra la base de desarrollo si hay TEST_POSTGRES_URL. Usa la revisión
2099-01 para no chocar con las reales, y al final borra lo que cargó.
"""
import hashlib
import os
from dataclasses import replace

import httpx
import pytest

from flows import upme_revisions
from lib import loads
from tests.test_revisions_flow import meta
from tests.test_upme_annex import old_format  # noqa: F401 - fixture del anexo de prueba

psycopg = pytest.importorskip("psycopg")
URL = os.environ.get("TEST_POSTGRES_URL", "").replace("postgresql+psycopg://", "postgresql://")
pytestmark = pytest.mark.skipif(not URL, reason="sin TEST_POSTGRES_URL: pruebas de la base solo con PostgreSQL")

CODE = "2099-01"


@pytest.fixture()
def db(monkeypatch):
    monkeypatch.setenv("DATABASE_URL", URL)
    with psycopg.connect(URL) as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT coalesce(max(id), 0) + 1 FROM operacion.load_runs")
            first_new_run = cur.fetchone()[0]
            cur.execute("SELECT code FROM core.components")
            components = [r[0] for r in cur.fetchall()]
        yield conn
        conn.rollback()
        with conn.cursor() as cur:
            runs = "(SELECT id FROM operacion.load_runs WHERE id >= %(r)s AND flow = %(f)s)"
            for sql in ("DELETE FROM core.revisions WHERE product = 'ee' AND code = %(c)s",
                        f"DELETE FROM raw.files WHERE load_run_id IN {runs}",
                        f"DELETE FROM staging.revision_values WHERE load_run_id IN {runs}",
                        f"DELETE FROM staging.revision_components WHERE load_run_id IN {runs}",
                        f"DELETE FROM staging.revision_component_values WHERE load_run_id IN {runs}",
                        "DELETE FROM core.components WHERE NOT (code = ANY(%(k)s))",
                        "DELETE FROM operacion.load_runs WHERE id >= %(r)s AND flow = %(f)s"):
                cur.execute(sql, {"r": first_new_run, "f": loads.REVISIONS_FLOW, "c": CODE, "k": components})
        conn.commit()


def serve(monkeypatch, content: bytes):
    """El sitio de la UPME simulado: entrega `content` a cualquier descarga."""
    handler = lambda request: httpx.Response(200, content=content)
    real_client = httpx.Client
    monkeypatch.setattr(upme_revisions.httpx, "Client", lambda: real_client(transport=httpx.MockTransport(handler)))


def last_messages(conn, run_id):
    with conn.cursor() as cur:
        cur.execute("SELECT flow, status FROM operacion.load_runs WHERE id = %s", [run_id])
        flow, status = cur.fetchone()
        cur.execute("SELECT code FROM operacion.load_messages WHERE load_run_id = %s AND level = 'error'", [run_id])
        return flow, status, [r[0] for r in cur.fetchall()]


def test_downloads_checks_and_loads_then_skips_on_the_next_run(db, monkeypatch, old_format):  # noqa: F811
    content = old_format.read_bytes()
    revision = meta(CODE, sha=hashlib.sha256(content).hexdigest())
    serve(monkeypatch, content)

    result = upme_revisions.load_revision.fn(revision)
    assert result.status == "ok", result.message
    assert last_messages(db, result.load_run_id) == (loads.REVISIONS_FLOW, "ok", [])
    with db.cursor() as cur:
        cur.execute("""SELECT count(*) FROM core.revision_values v JOIN core.revisions r ON r.id = v.revision_id
                        WHERE r.product = 'ee' AND r.code = %s""", [CODE])
        assert cur.fetchone()[0] > 0

    assert upme_revisions.pending_revisions.fn([revision]) == []  # la próxima vez ni se descarga


def test_a_different_file_is_logged_as_failed_and_not_loaded(db, monkeypatch, old_format):  # noqa: F811
    serve(monkeypatch, b"otro archivo")
    revision = replace(meta(CODE), annex_sha256=hashlib.sha256(old_format.read_bytes()).hexdigest())

    result = upme_revisions.load_revision.fn(revision)
    assert result.status == "failed"
    assert last_messages(db, result.load_run_id) == (loads.REVISIONS_FLOW, "failed", ["annex_hash_mismatch"])
    with db.cursor() as cur:
        cur.execute("SELECT 1 FROM core.revisions WHERE product = 'ee' AND code = %s", [CODE])
        assert cur.fetchone() is None
