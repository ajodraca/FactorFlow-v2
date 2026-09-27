"""TC-COMP-344 / DAC-E1-S6-4: the application factory mounts the static bundle.

Component design section 2.5; task plan T011.
"""

from pathlib import Path

import pytest
from fastapi.testclient import TestClient

import factorflow.api.app as app_module
from factorflow.api.app import create_app


@pytest.fixture
def client(monkeypatch: pytest.MonkeyPatch, tmp_path: Path) -> TestClient:
    monkeypatch.setenv("FACTORFLOW_DATABASE_URL", "postgresql://unused/unused")
    monkeypatch.setattr(app_module, "_STATIC_DIR", tmp_path)
    app = create_app()
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture
def client_with_bundle(monkeypatch: pytest.MonkeyPatch, tmp_path: Path) -> TestClient:
    """A client whose static directory holds a real fixture bundle.

    The default `client` fixture uses an empty static directory and cannot
    exercise the mount or SPA fallback with real files. This fixture points
    `_STATIC_DIR` at a directory this test controls, with both an
    `index.html` (the SPA-fallback target) and a second file at a nested
    path (`assets/app.js`, standing in for a real Vite build's hashed
    asset) that only `StaticFiles`' exact-path serving can produce --
    `not_found_handler`'s own fallback only ever reads `index.html`, so
    exercising this second file is what actually depends on
    `app.mount(...)` rather than on the fallback handler alone.
    """
    monkeypatch.setenv("FACTORFLOW_DATABASE_URL", "postgresql://unused/unused")
    index_html = tmp_path / "index.html"
    index_html.write_text("<html><body>fixture bundle</body></html>")
    assets_dir = tmp_path / "assets"
    assets_dir.mkdir()
    (assets_dir / "app.js").write_text("console.log('fixture bundle asset');")
    monkeypatch.setattr(app_module, "_STATIC_DIR", tmp_path)

    app = create_app()
    with TestClient(app) as test_client:
        yield test_client


def test_static_mount_serves_a_bundle_asset_by_exact_path(
    client_with_bundle: TestClient,
) -> None:
    """DAC-E1-S6-4: the factory mounts the static directory with `StaticFiles`.

    Requesting an asset that exists at its exact path is served by the
    mount itself, not by `not_found_handler`'s `index.html` fallback (which
    only ever reads `index.html`, regardless of the requested path) --
    removing `app.mount(...)` (`app.py`) makes this 404 and fails this test.
    """
    response = client_with_bundle.get("/assets/app.js")

    assert response.status_code == 200
    assert "fixture bundle asset" in response.text


def test_unmatched_non_api_path_falls_back_to_index(client_with_bundle: TestClient) -> None:
    """DAC-E1-S6-4: an unmatched non-API path returns the SPA's `index.html`."""
    response = client_with_bundle.get("/coverage")

    assert response.status_code == 200
    assert "text/html" in response.headers["content-type"]
    assert "fixture bundle" in response.text


def test_no_bundle_yet_falls_back_to_a_bare_404(client: TestClient) -> None:
    """The controlled static directory contains no frontend bundle.

    Separate from the fallback behavior itself (covered above with a real
    fixture bundle): confirms the *absence* of a bundle degrades to a plain
    404 rather than ever producing this story's `not_found` error envelope,
    which is reserved for unmatched paths under `/api`.
    """
    response = client.get("/coverage")

    assert response.status_code == 404
    assert response.headers.get("content-type", "").startswith("application/json") is False


def test_unmatched_api_path_returns_error_envelope(client: TestClient) -> None:
    response = client.get("/api/does-not-exist")

    assert response.status_code == 404
    body = response.json()
    assert body["error"]["code"] == "not_found"
    assert "request_id" in body["error"]
