"""Pruebas del flujo load-published-revisions sin base ni internet (issue #42): descarga simulada con
httpx.MockTransport y carga simulada."""
import hashlib
import logging
from datetime import date

import httpx
import pytest

from flows import upme_revisions
from flows.upme_revisions import RevisionResult
from lib import loads

CONTENT = b"anexo de prueba"
SHA = hashlib.sha256(CONTENT).hexdigest()


def meta(code="2099-01", url="https://docs.upme.gov.co/anexo.xlsx", sha=SHA):
    return loads.RevisionMeta(code=code, name=f"Rev. {code}", file="anexo.xlsx", published_on=date(2099, 1, 31),
                              document_url="https://www.upme.gov.co", model="Por confirmar", annex_url=url,
                              annex_sha256=sha)


def client(*responses):
    """Responde en orden; un Exception se lanza como error de red."""
    queue = list(responses)

    def handler(request):
        item = queue.pop(0)
        if isinstance(item, Exception):
            raise item
        return item
    return httpx.Client(transport=httpx.MockTransport(handler))


class TestDownload:
    def test_returns_the_annex_when_the_hash_matches(self):
        assert loads.download_annex(client(httpx.Response(200, content=CONTENT)), meta()) == CONTENT

    def test_a_different_hash_is_not_loaded(self):
        with pytest.raises(loads.AnnexDownloadError, match="no la validada") as exc:
            loads.download_annex(client(httpx.Response(200, content=b"otro archivo")), meta())
        assert exc.value.code == "annex_hash_mismatch"

    def test_network_errors_and_5xx_are_retried(self):
        c = client(httpx.ConnectError("sin red"), httpx.Response(503), httpx.Response(200, content=CONTENT))
        assert loads.download_annex(c, meta()) == CONTENT

    def test_gives_up_after_three_attempts(self):
        c = client(*[httpx.ConnectError("sin red")] * 3)
        with pytest.raises(loads.AnnexDownloadError, match="No se pudo descargar") as exc:
            loads.download_annex(c, meta())
        assert exc.value.code == "annex_download_failed"

    def test_a_4xx_is_not_retried(self):
        with pytest.raises(loads.AnnexDownloadError, match="respondió 404"):
            loads.download_annex(client(httpx.Response(404)), meta())

    def test_without_url_or_hash_it_does_not_download(self):
        with pytest.raises(loads.AnnexDownloadError) as exc:
            loads.download_annex(client(), meta(url=None))
        assert exc.value.code == "annex_url_missing"


def test_the_manifest_has_url_and_hash_for_every_revision():
    revisions = upme_revisions.read_manifest()
    assert [r.code for r in revisions] == ["2023-12", "2024-07", "2024-12", "2025-07", "2026-07"]
    for r in revisions:
        assert r.annex_url.startswith("https://docs.upme.gov.co/") and "?" not in r.annex_url
        assert len(r.annex_sha256) == 64


@pytest.fixture()
def flow_calls(monkeypatch):
    """Simula qué falta (2099-02 ya está cargada) y la carga de cada una (2099-03 falla)."""
    loaded = []
    revisions = [meta("2099-01"), meta("2099-02"), meta("2099-03")]
    monkeypatch.setattr(upme_revisions, "read_manifest", lambda: revisions)
    monkeypatch.setattr(upme_revisions, "pending_revisions", lambda rs: [r for r in rs if r.code != "2099-02"])

    def fake_load(m):
        loaded.append(m.code)
        return RevisionResult(m.code, len(loaded), "failed" if m.code == "2099-03" else "ok", f"{m.code} simulada")
    monkeypatch.setattr(upme_revisions, "load_revision", fake_load)
    monkeypatch.setattr(upme_revisions, "record_nothing_to_do",
                        lambda total: RevisionResult("todas", 99, "ok", f"Las {total} ya estaban"))
    monkeypatch.setattr(upme_revisions, "get_run_logger", lambda: logging.getLogger("prueba"))
    return loaded


def test_only_missing_revisions_are_loaded_and_a_failure_is_named(flow_calls):
    with pytest.raises(RuntimeError, match="Fallaron 1 de 2 revisiones: 2099-03"):
        upme_revisions.load_published_revisions.fn()
    assert flow_calls == ["2099-01", "2099-03"]  # 2099-02 ya estaba: ni se descarga


def test_one_revision_can_be_chosen(flow_calls):
    assert upme_revisions.load_published_revisions.fn(["2099-01"])[0]["status"] == "ok"
    assert flow_calls == ["2099-01"]


def test_nothing_to_do_leaves_one_ok_result(flow_calls):
    result = upme_revisions.load_published_revisions.fn(["2099-02"])
    assert result == [{"code": "todas", "load_run_id": 99, "status": "ok", "message": "Las 1 ya estaban"}]
    assert flow_calls == []


def test_an_unknown_code_is_an_error(flow_calls):
    with pytest.raises(ValueError, match="No están en revisiones_ee.toml: 1999-01"):
        upme_revisions.load_published_revisions.fn(["1999-01"])
