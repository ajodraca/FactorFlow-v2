"""`MassiveClient` credential-handling tests (CAP-001-E3-S1).

Component design: `component-design-massive-client.md` section 2.6
(authentication) and section 7 (`Credential is in a header, never a URL`,
`The credential is not cached outside the client`).
"""

import json
from pathlib import Path
from unittest.mock import patch

import urllib3

from factorflow.config.settings import MassiveSettings
from factorflow.ingestion.massive.client import MassiveClient
from factorflow.ingestion.rate_limit import GovernorSettings, RateLimitGovernor

FIXTURES = Path(__file__).resolve().parents[1] / "fixtures" / "massive"

_SECRET = "SECRET_TEST_TOKEN_ABC123"  # a known credential fixture, never real


def _settings() -> MassiveSettings:
    return MassiveSettings.model_validate(
        {
            "api_key": _SECRET,
            "requests_per_minute": 60,
            "max_attempts": 3,
            "timeout_seconds": 30.0,
        }
    )


def _governor() -> RateLimitGovernor:
    return RateLimitGovernor(
        GovernorSettings(
            requests_per_minute=60,
            max_attempts=3,
            initial_backoff_seconds=0.0,
            max_throttle_wait_seconds=1.0,
        ),
        sleep=lambda _seconds: None,
    )


# --- TC-COMP-214 / DAC-E3-S1-6: credential passed to SDK, absent from logs


def test_credential_is_passed_to_the_sdk_constructor() -> None:
    """DAC-E3-S1-6: the runtime credential unwraps into the SDK's
    `api_key` keyword exactly once, at construction (section 2.6)."""
    with patch("factorflow.ingestion.massive.client.RESTClient") as rest_client_cls:
        MassiveClient(settings=_settings(), governor=_governor())

    _, kwargs = rest_client_cls.call_args
    assert kwargs["api_key"] == _SECRET


def test_client_holds_no_module_or_class_level_credential_attribute() -> None:
    """The credential is not cached outside the client (SEC-SEC-002): no
    module-level or class-level attribute on `MassiveClient` itself holds
    the key -- only the constructed `RESTClient` instance does, so a
    rebuilt client cannot keep using a revoked one."""
    import factorflow.ingestion.massive.client as client_module

    for name in dir(client_module):
        if name.startswith("_"):
            continue
        value = getattr(client_module, name)
        assert value != _SECRET

    for name, value in vars(MassiveClient).items():
        if name.startswith("_"):
            continue
        assert value != _SECRET


# --- TC-COMP-214 / AC-13: credential in a header, never a URL ----------


def _reference_envelope() -> bytes:
    results = json.loads((FIXTURES / "reference_active.json").read_text())
    return json.dumps({"request_id": "req_ok_001", "results": results}).encode()


def test_credential_is_sent_as_a_bearer_header_never_a_url_parameter() -> None:
    """TC-COMP-013 / TC-COMP-214 / AC-13, section 2.6: the real SDK request path (only
    `urllib3.PoolManager.request` substituted) carries the credential in an
    `Authorization: Bearer` header. No request URL contains the credential
    or an `apiKey` query parameter, which Massive does accept and this
    component must never use."""
    captured: dict[str, object] = {}

    def _fake_request(  # type: ignore[no-untyped-def]
        method: str,
        url: str,
        fields: dict | None = None,
        headers: dict | None = None,
    ):
        captured["url"] = url
        captured["fields"] = fields
        captured["headers"] = dict(headers or {})
        return urllib3.HTTPResponse(
            body=_reference_envelope(),
            status=200,
            headers={"Content-Type": "application/json"},
        )

    with patch.object(urllib3.PoolManager, "request", autospec=True) as mock_request:
        mock_request.side_effect = lambda self, *a, **kw: _fake_request(*a, **kw)
        client = MassiveClient(settings=_settings(), governor=_governor())
        client.fetch_reference("AAPL")

    assert captured["headers"]["Authorization"] == f"Bearer {_SECRET}"
    assert _SECRET not in str(captured["url"])
    assert "apiKey" not in str(captured["url"])
    fields = captured["fields"] or {}
    assert "apiKey" not in fields
    assert _SECRET not in json.dumps(fields)
