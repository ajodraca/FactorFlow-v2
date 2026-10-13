"""`FACTORFLOW_DATABASE_URL` confinement (CAP-001-E1-S8).

Component design: `component-design-runtime-config.md` section 2.3,
*Database URL confinement (H7)*; CONST-SEC 1.3 SEC-ENC-001 host-local
loopback exception, condition H7. A plaintext database channel may only
stay on the host: loopback hosts accept any `sslmode`, every other host (or
no host) needs `sslmode=verify-full`, and every libpq route that could
supply another address is refused. Failures name the variable and the rule,
never the value (AC-13).
"""

import socket
from typing import Any

import pytest

from factorflow.config.settings import ConfigurationError, DatabaseSettings

_VAR = "FACTORFLOW_DATABASE_URL"
_PASSWORD = "s3cretpw"

_LIBPQ_ADDRESS_VARS = ("PGHOST", "PGHOSTADDR", "PGSERVICE", "PGSERVICEFILE")


@pytest.fixture(autouse=True)
def _clear_libpq_environment(monkeypatch: pytest.MonkeyPatch) -> None:
    for name in _LIBPQ_ADDRESS_VARS:
        monkeypatch.delenv(name, raising=False)


def _resolve_localhost_to(monkeypatch: pytest.MonkeyPatch, *addresses: str) -> None:
    real_getaddrinfo = socket.getaddrinfo

    def fake_getaddrinfo(host: Any, *args: Any, **kwargs: Any) -> list[Any]:
        if host == "localhost":
            return [
                (
                    socket.AF_INET6 if ":" in address else socket.AF_INET,
                    socket.SOCK_STREAM,
                    6,
                    "",
                    (address, 0),
                )
                for address in addresses
            ]
        return real_getaddrinfo(host, *args, **kwargs)

    monkeypatch.setattr(socket, "getaddrinfo", fake_getaddrinfo)


def _load(monkeypatch: pytest.MonkeyPatch, url: str) -> DatabaseSettings:
    monkeypatch.setenv(_VAR, url)
    return DatabaseSettings()  # type: ignore[call-arg]


def _assert_refused(monkeypatch: pytest.MonkeyPatch, url: str, rule: str) -> None:
    with pytest.raises(ConfigurationError) as excinfo:
        _load(monkeypatch, url)
    message = str(excinfo.value)
    assert _VAR in message
    assert rule in message
    assert url not in message
    assert _PASSWORD not in message


# Implements TC-COMP-410
@pytest.mark.parametrize("host", ["127.0.0.1", "[::1]", "localhost"])
@pytest.mark.parametrize("query", ["", "?sslmode=disable"])
def test_loopback_url_loads_with_any_sslmode(
    monkeypatch: pytest.MonkeyPatch, host: str, query: str
) -> None:
    _resolve_localhost_to(monkeypatch, "127.0.0.1", "::1")
    url = f"postgresql://u:{_PASSWORD}@{host}:5432/d{query}"
    assert _load(monkeypatch, url).url.get_secret_value() == url


# Implements TC-COMP-411
@pytest.mark.parametrize(
    "url",
    [
        f"postgresql://u:{_PASSWORD}@db.example.com/d",
        f"postgresql://u:{_PASSWORD}@db.example.com/d?sslmode=prefer",
        f"postgresql://u:{_PASSWORD}@db.example.com/d?sslmode=require",
        f"postgresql://u:{_PASSWORD}@10.0.0.5/d",
        f"postgresql://u:{_PASSWORD}@10.0.0.5/d?sslmode=prefer",
        f"postgresql://u:{_PASSWORD}@10.0.0.5/d?sslmode=require",
        f"postgresql://u:{_PASSWORD}@/d",
        f"postgresql://u:{_PASSWORD}@/d?sslmode=require",
    ],
)
def test_non_loopback_or_hostless_url_without_verify_full_is_refused(
    monkeypatch: pytest.MonkeyPatch, url: str
) -> None:
    _assert_refused(monkeypatch, url, "sslmode=verify-full")


# Implements TC-COMP-412
@pytest.mark.parametrize("host", ["db.example.com", "10.0.0.5", ""])
def test_non_loopback_or_hostless_url_with_verify_full_loads(
    monkeypatch: pytest.MonkeyPatch, host: str
) -> None:
    url = f"postgresql://u:{_PASSWORD}@{host}/d?sslmode=verify-full"
    assert _load(monkeypatch, url).url.get_secret_value() == url


# Implements TC-COMP-413
@pytest.mark.parametrize(
    ("url", "rule"),
    [
        (f"postgresql://u:{_PASSWORD}@127.0.0.1/d?host=10.0.0.5", "host parameter"),
        (f"postgresql://u:{_PASSWORD}@127.0.0.1/d?hostaddr=10.0.0.5", "hostaddr"),
        (f"postgresql://u:{_PASSWORD}@127.0.0.1/d?service=x", "service"),
        (f"postgresql://u:{_PASSWORD}@127.0.0.1,10.0.0.5/d", "exactly one host"),
        # libpq accepts `#` inside a password or path; urlsplit takes it for a
        # fragment and would hide the parameter that follows (code review, cycle A).
        (f"postgresql://u:{_PASSWORD}#x@127.0.0.1/d?hostaddr=10.0.0.5", "hostaddr"),
        (f"postgresql://u:{_PASSWORD}@127.0.0.1/d#?hostaddr=10.0.0.5", "hostaddr"),
        (f"postgresql://u:{_PASSWORD}@127.0.0.1/d#?service=x", "service"),
        (f"postgresql://u:{_PASSWORD}@127.0.0.1/d#?host=10.0.0.5", "host parameter"),
        (
            f"postgresql://u:{_PASSWORD}@127.0.0.1/d#?host=10.0.0.5&sslmode=verify-full",
            "host parameter",
        ),
        (f"postgresql://u:{_PASSWORD}@db.example.com/d#?host=127.0.0.1", "host parameter"),
        (f"postgresql://u:{_PASSWORD}@127.0.0.1/d?ho%73t=10.0.0.5", "host parameter"),
        (f"host=127.0.0.1 hostaddr=10.0.0.5 user=u password={_PASSWORD}", "hostaddr"),
    ],
)
def test_loopback_url_with_another_address_route_is_refused(
    monkeypatch: pytest.MonkeyPatch, url: str, rule: str
) -> None:
    _assert_refused(monkeypatch, url, rule)


# Implements TC-COMP-414
@pytest.mark.parametrize("value", ["10.0.0.5", ""])
@pytest.mark.parametrize("name", _LIBPQ_ADDRESS_VARS)
def test_loopback_url_is_refused_while_a_libpq_address_variable_is_set(
    monkeypatch: pytest.MonkeyPatch, name: str, value: str
) -> None:
    monkeypatch.setenv(name, value)
    with pytest.raises(ConfigurationError) as excinfo:
        _load(monkeypatch, f"postgresql://u:{_PASSWORD}@127.0.0.1/d")
    message = str(excinfo.value)
    assert _VAR in message
    assert f"{name} must not be set" in message
    assert "10.0.0.5" not in message
    assert _PASSWORD not in message


# Implements TC-COMP-415
def test_localhost_resolving_off_host_is_refused(monkeypatch: pytest.MonkeyPatch) -> None:
    _resolve_localhost_to(monkeypatch, "127.0.0.1", "192.0.2.10")
    _assert_refused(monkeypatch, f"postgresql://u:{_PASSWORD}@localhost/d", "sslmode=verify-full")
