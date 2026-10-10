"""TC-COMP-014, TC-COMP-346 / AC-14, DAC-E1-S6-6.

The API binds to loopback only, and no route declares an authentication
requirement (component design sections 3, 4; task plan T006).
"""

import ipaddress
import socket
import threading
import time

import httpx
import pytest

from factorflow.api.app import create_app
from factorflow.app_main import build_server


@pytest.fixture(autouse=True)
def _database_url(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("FACTORFLOW_DATABASE_URL", "postgresql://unused/unused")


def _free_port() -> int:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        sock.bind(("127.0.0.1", 0))
        return sock.getsockname()[1]


def _find_non_loopback_ipv4() -> str | None:
    """A real, non-loopback IPv4 address this host owns, or `None`.

    Asks the kernel's routing table, not the resolver: `connect()` on a UDP
    socket sends no packet, it only picks the local address the host would
    use to reach an off-host destination, which `getsockname()` returns.
    That address is assigned to one of this host's interfaces.

    Earlier versions resolved the hostname (`gethostbyname`, then
    `getaddrinfo`). That is a name lookup, so it found nothing on hosts
    whose hostname has no DNS entry (IR-003) or maps to `127.0.0.1` in
    `/etc/hosts` (IR-604), even when non-loopback interfaces existed.

    Returns `None` when the kernel has no IPv4 route to an off-host
    destination, which is the case on a host with only loopback, so callers
    must handle it. A host whose only non-loopback interfaces carry no such
    route (no default route) also yields `None`.
    """
    with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as sock:
        try:
            # TEST-NET-2 (RFC 5737): never on-link, so it follows the default route.
            sock.connect(("198.51.100.1", 9))
        except OSError:
            return None
        ip = sock.getsockname()[0]
    if ipaddress.ip_address(ip).is_loopback or ip == "0.0.0.0":
        return None
    return ip


def test_server_binds_to_loopback_only(monkeypatch: pytest.MonkeyPatch) -> None:
    """The default `FACTORFLOW_API_HOST` binds the socket to `127.0.0.1`.

    IR-005: drives the server through `app_main.build_server`, the actual
    settings-to-socket path this story ships, rather than constructing a
    `uvicorn.Config` with a literal `host="127.0.0.1"` that no production
    code path produces.
    """
    non_loopback_ip = _find_non_loopback_ipv4()
    if non_loopback_ip is None:
        pytest.skip(
            "no non-loopback IPv4 address found: this host has no IPv4 route off itself; "
            "the non-loopback-rejection half of AC-14 cannot be exercised here"
        )

    port = _free_port()
    monkeypatch.delenv("FACTORFLOW_API_HOST", raising=False)

    server = build_server(port=port)
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

        # Not reachable on the non-loopback interface this host actually owns.
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
