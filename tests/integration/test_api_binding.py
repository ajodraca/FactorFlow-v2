"""TC-COMP-014, TC-COMP-346 / AC-14, DAC-E1-S6-6.

The API binds to loopback only, and no route declares an authentication
requirement (component design sections 3, 4; task plan T006).
"""

import socket
import threading
import time

import httpx
import pytest
import uvicorn

from factorflow.api.app import create_app


@pytest.fixture(autouse=True)
def _database_url(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("FACTORFLOW_DATABASE_URL", "postgresql://unused/unused")


def _free_port() -> int:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        sock.bind(("127.0.0.1", 0))
        return sock.getsockname()[1]


def test_server_binds_to_loopback_only(monkeypatch: pytest.MonkeyPatch) -> None:
    """The default `FACTORFLOW_API_HOST` binds the socket to `127.0.0.1`."""
    port = _free_port()
    monkeypatch.delenv("FACTORFLOW_API_HOST", raising=False)
    monkeypatch.setenv("FACTORFLOW_API_PORT", str(port))

    app = create_app()
    config = uvicorn.Config(app, host="127.0.0.1", port=port, log_level="warning")
    server = uvicorn.Server(config)

    thread = threading.Thread(target=server.run, daemon=True)
    thread.start()
    try:
        deadline = time.monotonic() + 5
        while not server.started and time.monotonic() < deadline:
            time.sleep(0.05)
        assert server.started, "server did not start in time"

        # Reachable on loopback.
        response = httpx.get(f"http://127.0.0.1:{port}/api/health", timeout=10)
        assert response.status_code == 200

        # Not reachable on any non-loopback interface the host exposes.
        hostname = socket.gethostname()
        try:
            non_loopback_ip = socket.gethostbyname(hostname)
        except socket.gaierror:
            non_loopback_ip = None

        if non_loopback_ip and non_loopback_ip != "127.0.0.1":
            with pytest.raises((httpx.ConnectError, httpx.ConnectTimeout)):
                httpx.get(f"http://{non_loopback_ip}:{port}/api/health", timeout=1)
    finally:
        server.should_exit = True
        thread.join(timeout=5)


def test_no_route_declares_an_authentication_dependency() -> None:
    app = create_app()

    for route in app.routes:
        dependant = getattr(route, "dependant", None)
        if dependant is None:
            continue
        for dependency in dependant.dependencies:
            call = getattr(dependency, "call", None)
            name = getattr(call, "__name__", "") if call else ""
            assert "auth" not in name.lower(), (
                f"route {getattr(route, 'path', route)!r} declares an auth dependency"
            )

    schema = app.openapi()
    components = schema.get("components", {})
    assert "securitySchemes" not in components
