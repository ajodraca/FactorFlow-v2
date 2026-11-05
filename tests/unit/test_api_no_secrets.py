"""TC-COMP-300 / DAC-E1-9: credential presence is a boolean, never the value.

Task plan T009.
"""

import logging
import uuid
from collections.abc import Iterator
from contextlib import contextmanager
from typing import Any

import pytest
from fastapi.testclient import TestClient

from factorflow.api.app import create_app


def test_health_never_echoes_credential(monkeypatch: pytest.MonkeyPatch) -> None:
    secret_value = "sk-super-secret-massive-key-0123456789"
    monkeypatch.setenv("FACTORFLOW_MASSIVE_API_KEY", secret_value)
    monkeypatch.setenv("FACTORFLOW_DATABASE_URL", "postgresql://unused@127.0.0.1/unused")

    app = create_app()
    with TestClient(app, base_url="http://127.0.0.1:8000") as client:
        response = client.get("/api/health")

    assert secret_value not in response.text
    body = response.json()
    assert body["credential_present"] is True


# ---------------------------------------------------------------------------
# CAP-002-E3-S6: TC-COMP-088 / DAC-E3-S6-3 / DAC-E3-13 -- the universes and
# classifications routes leak no credential (DEC-0084).
# ---------------------------------------------------------------------------

_SECRET = "sk-super-secret-massive-key-9876543210"
_NEW_PREFIXES = ("/api/universes", "/api/classifications")


class _FakePool:
    @contextmanager
    def connection(self) -> Iterator[object]:
        yield object()


def _assert_no_secret(secret: str, *, text: str, headers: dict[str, str], logs: str) -> None:
    assert secret not in text, "credential in a response body"
    assert all(secret not in value for value in headers.values()), "credential in a header"
    assert secret not in logs, "credential in a log"


def _new_routes(app: Any) -> list[tuple[str, str]]:
    """(METHOD, path) of every route under the new prefixes.

    FastAPI keeps an included router as one wrapping entry, so the OpenAPI
    schema is the reliable enumeration of what is mounted.
    """
    return [
        (method.upper(), path)
        for path, operations in app.openapi()["paths"].items()
        if path.startswith(_NEW_PREFIXES)
        for method in operations
    ]


def _fill(path: str) -> str:
    parts = []
    for part in path.split("/"):
        if part.startswith("{") and part.endswith("}"):
            name = part[1:-1]
            parts.append(str(uuid.uuid4()) if name.endswith("id") else "AAA")
        else:
            parts.append(part)
    return "/".join(parts)


def test_new_routes_never_echo_credential(
    monkeypatch: pytest.MonkeyPatch, caplog: pytest.LogCaptureFixture
) -> None:
    """# Implements TC-COMP-088: every universes and classifications route, every method."""
    monkeypatch.setenv("FACTORFLOW_MASSIVE_API_KEY", _SECRET)
    monkeypatch.setenv("FACTORFLOW_DATABASE_URL", "postgresql://unused@127.0.0.1/unused")
    caplog.set_level(logging.DEBUG)

    app = create_app()
    app.state.db_pool = _FakePool()
    routes = _new_routes(app)
    enumerated = set(routes)
    for expected in (
        ("GET", "/api/universes"),
        ("GET", "/api/classifications"),
        ("GET", "/api/classifications/summary"),
        ("GET", "/api/classifications/sets"),
        ("GET", "/api/classifications/sets/{set_id}"),
        ("GET", "/api/classifications/stocks/{symbol}"),
        ("GET", "/api/classifications/stocks/{symbol}/history"),
    ):
        assert expected in enumerated, f"{expected} is not mounted"

    client = TestClient(app, base_url="http://127.0.0.1:8000", raise_server_exceptions=False)
    for method, path in sorted(routes):
        kwargs: dict[str, Any] = {} if method in ("GET", "HEAD", "OPTIONS") else {"json": {}}
        response = client.request(method, _fill(path), **kwargs)
        _assert_no_secret(
            _SECRET,
            text=response.text,
            headers=dict(response.headers),
            logs=caplog.text,
        )


def test_secret_detector_fails_on_a_leaking_route_and_a_leaking_log(
    monkeypatch: pytest.MonkeyPatch, caplog: pytest.LogCaptureFixture
) -> None:
    """# Implements TC-COMP-088: the detector itself raises when a secret does leak."""
    monkeypatch.setenv("FACTORFLOW_MASSIVE_API_KEY", _SECRET)
    monkeypatch.setenv("FACTORFLOW_DATABASE_URL", "postgresql://unused@127.0.0.1/unused")
    caplog.set_level(logging.DEBUG)

    app = create_app()
    app.state.db_pool = _FakePool()

    def _leak() -> dict[str, str]:
        return {"key": _SECRET}

    app.add_api_route("/api/__leak", _leak)
    # The static mount added by `create_app` matches every path, so the throwaway route goes first.
    app.router.routes.insert(0, app.router.routes.pop())

    client = TestClient(app, base_url="http://127.0.0.1:8000", raise_server_exceptions=False)
    response = client.get("/api/__leak")
    with pytest.raises(AssertionError):
        _assert_no_secret(_SECRET, text=response.text, headers={}, logs="")
    with pytest.raises(AssertionError):
        _assert_no_secret(_SECRET, text="", headers={"x-leak": _SECRET}, logs="")
    logging.getLogger("factorflow.test").warning("leaked %s", _SECRET)
    with pytest.raises(AssertionError):
        _assert_no_secret(_SECRET, text="", headers={}, logs=caplog.text)
