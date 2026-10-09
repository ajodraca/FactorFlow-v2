"""`MassiveClient` retry behaviour through the real `RateLimitGovernor`.

Component design: `component-design-massive-client.md` section 7, test
table rows "429 is not an attempt", "Timeout retries to the limit" and
"A 429 without Retry-After is still throttling". `RESTClient` is patched
and constructed with `retries=0`, so the governor alone owns retry and the
SDK call count equals the provider requests sent.
"""

import json
from pathlib import Path
from unittest.mock import patch

import pytest
from massive.exceptions import BadResponse
from urllib3.exceptions import ReadTimeoutError

from factorflow.config.settings import MassiveSettings
from factorflow.ingestion.massive.client import MassiveClient
from factorflow.ingestion.massive.errors import ProviderUnavailable
from factorflow.ingestion.massive.models import TickerReference
from factorflow.ingestion.rate_limit import GovernorSettings, RateLimitGovernor

FIXTURES = Path(__file__).resolve().parents[1] / "fixtures" / "massive"


def _load(name: str) -> dict:
    return json.loads((FIXTURES / name).read_text())


def _settings() -> MassiveSettings:
    return MassiveSettings.model_validate(
        {
            "api_key": "test-secret-key",
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


class _FakeResponse:
    def __init__(self, payload: dict, status: int = 200) -> None:
        self.status = status
        self.data = json.dumps(payload).encode()


def _envelope(results: object) -> dict:
    return {"request_id": "req_ok_001", "results": results}


# Implements TC-INT-025
def test_rate_limited_responses_are_paced_without_consuming_attempts() -> None:
    """429 is not an attempt (section 7, 5.13): four throttled responses
    are paced and the fifth send succeeds, although `max_attempts` is 3."""
    rate_limited = (FIXTURES / "error_rate_limited.json").read_text()
    with patch("factorflow.ingestion.massive.client.RESTClient") as rest_client_cls:
        instance = rest_client_cls.return_value
        instance.get_ticker_details.side_effect = [
            BadResponse(rate_limited),
            BadResponse(rate_limited),
            BadResponse(rate_limited),
            BadResponse(rate_limited),
            _FakeResponse(_envelope(_load("reference_active.json"))),
        ]
        client = MassiveClient(settings=_settings(), governor=_governor())

        reference = client.fetch_reference("AAPL")

    assert isinstance(reference, TickerReference)
    assert reference.cik == "0000320193"
    assert instance.get_ticker_details.call_count == 5


# Implements TC-INT-026
@pytest.mark.parametrize(
    "failure",
    [
        pytest.param(
            ReadTimeoutError(None, "https://api.massive.com", "Read timed out."),
            id="timeout",
        ),
        pytest.param(
            BadResponse((FIXTURES / "error_unknown_shape.json").read_text()),
            id="server-error",
        ),
    ],
)
def test_timeouts_and_server_errors_retry_to_the_attempt_limit(failure: Exception) -> None:
    """Timeout retries to the limit (section 7, 5.13): a timeout or an
    unrecognised server error is retried up to `max_attempts`, then
    surfaces as `ProviderUnavailable` with no further send."""
    with patch("factorflow.ingestion.massive.client.RESTClient") as rest_client_cls:
        instance = rest_client_cls.return_value
        instance.get_ticker_details.side_effect = failure
        client = MassiveClient(settings=_settings(), governor=_governor())

        with pytest.raises(ProviderUnavailable):
            client.fetch_reference("AAPL")

    assert instance.get_ticker_details.call_count == 3
