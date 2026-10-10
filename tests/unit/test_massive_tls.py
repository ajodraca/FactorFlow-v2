"""TLS and default-base guards for `MassiveClient` (CAP-001-E3-S6).

Component design: `component-design-massive-client.md` sections 2.2b and 4
(SEC-ENC-001), section 8 item 13. Expedited review EXP-20261009-1 ER-001 and
ER-004 found these tests missing. Every test runs on the real, unpatched SDK
unless it inspects the exact keyword arguments, and none opens a socket.
"""

from unittest.mock import patch

import pytest

from factorflow.config.settings import MassiveSettings, Settings
from factorflow.ingestion.massive.client import MassiveClient
from factorflow.ingestion.rate_limit import GovernorSettings, RateLimitGovernor
from factorflow.ingestion_main import _build_client_for_key
from tests.unit.massive_transport_fakes import forbid_sockets, generated_test_key

_TLS_OVERRIDES = ("verify", "cert_reqs", "ssl_context", "ca_certs")


def _env(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.delenv("FACTORFLOW_MASSIVE_BASE_URL", raising=False)
    monkeypatch.setenv("FACTORFLOW_MASSIVE_API_KEY", generated_test_key())
    monkeypatch.setenv("FACTORFLOW_MASSIVE_REQUESTS_PER_MINUTE", "60")


def _governor(settings: MassiveSettings) -> RateLimitGovernor:
    return RateLimitGovernor(
        GovernorSettings.from_massive_settings(settings), sleep=lambda _s: None
    )


# Implements TC-COMP-355
def test_unset_base_reaches_both_sdk_clients_as_the_governed_host(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """DAC-E3-S6-8: with the variable unset, the client and its `vx`
    sub-client both use `https://api.massive.com`."""
    forbid_sockets(monkeypatch)
    _env(monkeypatch)
    settings = MassiveSettings(_env_file=None)  # type: ignore[call-arg]
    client = MassiveClient(settings=settings, governor=_governor(settings))

    assert client._rest_client.BASE == client._rest_client.vx.BASE == "https://api.massive.com"


# Implements TC-COMP-358
def test_no_construction_path_passes_a_tls_override(monkeypatch: pytest.MonkeyPatch) -> None:
    """DAC-E3-S6-11: neither `MassiveClient.__init__` nor the credential
    rebuild path in `ingestion_main` passes `verify`, `cert_reqs`,
    `ssl_context` or `ca_certs` to the SDK."""
    _env(monkeypatch)
    monkeypatch.setenv("FACTORFLOW_DATABASE_URL", "postgresql://unused/unused")
    settings = Settings(_env_file=None)  # type: ignore[call-arg]

    with patch("factorflow.ingestion.massive.client.RESTClient") as rest_client_cls:
        MassiveClient(settings=settings.massive, governor=_governor(settings.massive))
        _build_client_for_key(generated_test_key(), settings)

    assert rest_client_cls.call_count == 2
    for call in rest_client_cls.call_args_list:
        assert not set(_TLS_OVERRIDES) & set(call.kwargs)


# Implements TC-COMP-358
def test_both_sdk_pools_require_certificates(monkeypatch: pytest.MonkeyPatch) -> None:
    """DAC-E3-S6-11, SEC-ENC-001: on the real SDK, the main pool and the
    `vx` pool keep `cert_reqs="CERT_REQUIRED"`, on both construction paths."""
    forbid_sockets(monkeypatch)
    _env(monkeypatch)
    monkeypatch.setenv("FACTORFLOW_DATABASE_URL", "postgresql://unused/unused")
    settings = Settings(_env_file=None)  # type: ignore[call-arg]

    for client in (
        MassiveClient(settings=settings.massive, governor=_governor(settings.massive)),
        _build_client_for_key(generated_test_key(), settings),
    ):
        assert client._rest_client.client.connection_pool_kw["cert_reqs"] == "CERT_REQUIRED"
        assert client._rest_client.vx.client.connection_pool_kw["cert_reqs"] == "CERT_REQUIRED"
