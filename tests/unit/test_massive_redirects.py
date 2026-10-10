"""No redirect and no proxy, proven socket-free (CAP-001-E3-S6).

Component design: `component-design-massive-client.md` sections 2.2b and 7;
DEC-0038, DEC-0041 and DEC-0042 (specification review v7 FINDING-19 and
FINDING-21). The harness in `massive_transport_fakes` replaces only
`HTTPConnectionPool._make_request`: the SDK and urllib3's `PoolManager`
redirect and retry logic run unpatched, so a redirect the client refuses is
refused by the real code path. A refused redirect is a transport failure the
production governor retries, to the same host, `max_attempts` times before
raising `ProviderUnavailable` (DEC-0042).
"""

import pytest
import urllib3
from massive import RESTClient
from urllib3.exceptions import MaxRetryError

from factorflow.config.settings import MassiveSettings
from factorflow.ingestion.massive.client import MassiveClient
from factorflow.ingestion.massive.errors import ProviderUnavailable
from factorflow.ingestion.rate_limit import GovernorSettings, RateLimitGovernor
from tests.unit.massive_transport_fakes import (
    RecordingMakeRequest,
    SocketGuard,
    forbid_sockets,
    generated_test_key,
)

_REDIRECT_HOST = "198.51.100.7"
_PROXY_VARS = ("HTTP_PROXY", "HTTPS_PROXY", "ALL_PROXY", "http_proxy", "https_proxy", "all_proxy")


def _settings(monkeypatch: pytest.MonkeyPatch) -> MassiveSettings:
    monkeypatch.delenv("FACTORFLOW_MASSIVE_BASE_URL", raising=False)
    monkeypatch.delenv("FACTORFLOW_MASSIVE_MAX_ATTEMPTS", raising=False)
    monkeypatch.setenv("FACTORFLOW_MASSIVE_API_KEY", generated_test_key())
    monkeypatch.setenv("FACTORFLOW_MASSIVE_REQUESTS_PER_MINUTE", "60")
    return MassiveSettings(_env_file=None)  # type: ignore[call-arg]


def _production_client(settings: MassiveSettings) -> MassiveClient:
    """A `MassiveClient` built as in section 2.2b, with a governor built from
    production settings. `sleep` and `jitter` are injected so the test does
    not wait; `monotonic` is not, because a frozen clock with a no-op sleep
    never ends the token wait (specification review v9 FINDING-27)."""
    governor = RateLimitGovernor(
        GovernorSettings.from_massive_settings(settings),
        sleep=lambda _s: None,
        jitter=lambda: 0.0,
    )
    return MassiveClient(settings=settings, governor=governor)


@pytest.fixture
def harness(monkeypatch: pytest.MonkeyPatch) -> tuple[SocketGuard, RecordingMakeRequest]:
    guard = forbid_sockets(monkeypatch)
    transport = RecordingMakeRequest().install(monkeypatch)
    return guard, transport


# Implements TC-COMP-359
def _assert_harness_held(guard: SocketGuard, transport: RecordingMakeRequest) -> None:
    """DAC-E3-S6-12: no socket was opened, no plain-HTTP request was made,
    and the fake handed urllib3 back the very `retries` object it was given,
    as urllib3's own `_make_request` does."""
    assert guard.fired == []
    assert transport.requests, "the harness recorded no request"
    assert all(r.scheme == "https" for r in transport.requests)
    assert len(transport.retries_returned) == len(transport.retries_passed)
    for passed, returned in zip(transport.retries_passed, transport.retries_returned, strict=True):
        assert passed is not None
        assert returned is passed


# Implements TC-COMP-360
def test_main_pool_redirect_is_refused_and_retried_to_the_same_host(
    monkeypatch: pytest.MonkeyPatch, harness: tuple[SocketGuard, RecordingMakeRequest]
) -> None:
    """DAC-E3-S6-13: `fetch_reference` meets a `302` to another host on every
    attempt. The client never follows it; the governor classifies each refusal
    as retryable and gives up after `max_attempts` with `ProviderUnavailable`."""
    guard, transport = harness
    settings = _settings(monkeypatch)
    client = _production_client(settings)

    with pytest.raises(ProviderUnavailable) as excinfo:
        client.fetch_reference("AAPL")

    assert not isinstance(excinfo.value, MaxRetryError)
    assert isinstance(excinfo.value.__cause__, MaxRetryError)
    assert settings.max_attempts == 3
    assert len(transport.requests) == settings.max_attempts
    assert all(r.host == "api.massive.com" for r in transport.requests)
    assert all(r.host != _REDIRECT_HOST for r in transport.requests)
    _assert_harness_held(guard, transport)


# Implements TC-COMP-361
def test_vx_redirect_is_refused_through_the_vx_pool(
    monkeypatch: pytest.MonkeyPatch, harness: tuple[SocketGuard, RecordingMakeRequest]
) -> None:
    """DAC-E3-S6-14: a `vx` read driven directly through the governor seam
    meets the redirect on a `/vX/` request, through the `vx` sub-client's own
    pool, and is refused `max_attempts` times. The test cannot pass while
    exercising only the main pool: it requires `/vX/` requests on that pool."""
    guard, transport = harness
    settings = _settings(monkeypatch)
    client = _production_client(settings)
    vx_pool = client._rest_client.vx.client.connection_from_url("https://api.massive.com")

    with pytest.raises(ProviderUnavailable):
        client._through_governor(lambda: client._rest_client.vx.list_ipos(ticker="AAPL", raw=True))

    ipos = [r for r in transport.requests if r.path.startswith("/vX/reference/ipos")]
    assert ipos, "no /vX/reference/ipos request was recorded"
    assert len(ipos) == settings.max_attempts
    assert all(r.pool is vx_pool for r in ipos)
    assert all(r.host == "api.massive.com" for r in transport.requests)
    assert all(r.host != _REDIRECT_HOST for r in transport.requests)
    _assert_harness_held(guard, transport)


# Implements TC-COMP-362
def test_control_client_with_retries_follows_the_redirect(
    harness: tuple[SocketGuard, RecordingMakeRequest],
) -> None:
    """DAC-E3-S6-15: the same read on a bare SDK client with `retries=3`
    does follow the redirect, which proves the fake drives urllib3's real
    redirect path rather than short-circuiting it (DEC-0038)."""
    guard, transport = harness
    control = RESTClient(api_key=generated_test_key(), retries=3)

    with pytest.raises(MaxRetryError):
        control.get_ticker_details("AAPL")

    assert any(r.host == _REDIRECT_HOST for r in transport.requests)
    _assert_harness_held(guard, transport)


# Implements TC-COMP-363
def test_no_proxy_is_used_by_either_pool(
    monkeypatch: pytest.MonkeyPatch, harness: tuple[SocketGuard, RecordingMakeRequest]
) -> None:
    """DAC-E3-S6-16 (DEC-0038, DEC-0041; CONST-SEC 1.2 SEC-ENC-001 condition
    2): with every proxy variable set and `NO_PROXY` unset, neither the SDK
    pool nor the `vx` pool is a `ProxyManager`, and the pools each returns for
    the base URL and for the clause 2a loopback form carry no proxy. Building
    a pool sends nothing."""
    guard, transport = harness
    for var in _PROXY_VARS:
        monkeypatch.setenv(var, "http://127.0.0.1:9")
    monkeypatch.delenv("NO_PROXY", raising=False)
    monkeypatch.delenv("no_proxy", raising=False)
    client = _production_client(_settings(monkeypatch))

    for manager in (client._rest_client.client, client._rest_client.vx.client):
        assert isinstance(manager, urllib3.PoolManager)
        assert not isinstance(manager, urllib3.ProxyManager)

        base_pool = manager.connection_from_url("https://api.massive.com")
        assert isinstance(base_pool, urllib3.HTTPSConnectionPool)
        assert base_pool.host == "api.massive.com"
        assert base_pool.proxy is None

        loopback_pool = manager.connection_from_url("http://127.0.0.1:8126")
        assert type(loopback_pool) is urllib3.HTTPConnectionPool
        assert loopback_pool.proxy is None

    assert transport.requests == []
    assert guard.fired == []
