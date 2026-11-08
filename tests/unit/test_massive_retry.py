"""`MassiveClient` retry behaviour through the real `RateLimitGovernor`.

Component design: `component-design-massive-client.md` section 7, test
table rows "429 is not an attempt", "Timeout retries to the limit" and
"A 429 without Retry-After is still throttling". `RESTClient` is patched
and constructed with `retries=0`, so the governor alone owns retry and the
SDK call count equals the provider requests sent.

CAP-003 adds rows that run through the real SDK and urllib3 path instead
(CAP-003 massive-client section 7, DAC-E8-20): a real `MassiveClient` with
production `MassiveSettings` at 60 requests per minute and every timing value
at its default, the governor built from those settings with one `FakeClock`
passed as both `monotonic` and `now` and a `FakeSleeper` on it, and the
socket-free harness of `massive_transport_fakes`, which replaces only
`HTTPConnectionPool._make_request`. Request counts come from
`RecordingMakeRequest`, never from a stored `attempts` value: "A real 403
plan refusal is sent once" (CAP-003 TC-COMP-230) and "An unrecognised 4xx
refusal is retried to the limit" (CAP-003 TC-COMP-231).
"""

import json
from collections.abc import Callable
from datetime import date
from pathlib import Path
from unittest.mock import patch

import pytest
from massive.exceptions import BadResponse
from urllib3.exceptions import ReadTimeoutError

from factorflow.config.settings import MassiveSettings
from factorflow.ingestion.massive import MassiveError, ProviderNotEntitled, compose_failure_reason
from factorflow.ingestion.massive.client import MassiveClient
from factorflow.ingestion.massive.errors import ProviderUnavailable
from factorflow.ingestion.massive.models import TickerReference
from factorflow.ingestion.rate_limit import GovernorSettings, RateLimitGovernor
from tests.unit.governor_fakes import FakeClock, FakeSleeper, SequenceJitter
from tests.unit.massive_transport_fakes import (
    FakeAnswer,
    RecordedRequest,
    RecordingMakeRequest,
    forbid_sockets,
    generated_test_key,
    json_answer,
)

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
# Implements TC-INT-026
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


# --- CAP-003 real-transport harness (massive-client section 7) ----------

_CLOCK_START = 1_800_000_000.0
_BALANCE_SHEETS = "/stocks/financials/v1/balance-sheets"
_PLAN_REFUSAL_TEXT = "You are not entitled to this data. Please upgrade your plan"


def _production_settings(monkeypatch: pytest.MonkeyPatch) -> MassiveSettings:
    """Production `MassiveSettings`: the key and the 60 requests per minute
    production ran at, every other value at its default."""
    for name in (
        "FACTORFLOW_MASSIVE_BASE_URL",
        "FACTORFLOW_MASSIVE_MAX_ATTEMPTS",
        "FACTORFLOW_MASSIVE_BACKOFF_INITIAL_SECONDS",
        "FACTORFLOW_MASSIVE_MAX_THROTTLE_WAIT_SECONDS",
        "FACTORFLOW_MASSIVE_TIMEOUT_SECONDS",
    ):
        monkeypatch.delenv(name, raising=False)
    monkeypatch.setenv("FACTORFLOW_MASSIVE_API_KEY", generated_test_key())
    monkeypatch.setenv("FACTORFLOW_MASSIVE_REQUESTS_PER_MINUTE", "60")
    return MassiveSettings(_env_file=None)  # type: ignore[call-arg]


def _real_transport_client(
    settings: MassiveSettings,
) -> tuple[MassiveClient, FakeClock, FakeSleeper]:
    """A `MassiveClient` built as CAP-001 section 2.2b builds it, with the
    governor from production settings and one `FakeClock` as both
    `monotonic` and `now`, so every sleep advances both clocks together."""
    clock = FakeClock(_CLOCK_START)
    sleeper = FakeSleeper(clock)
    governor = RateLimitGovernor(
        GovernorSettings.from_massive_settings(settings),
        monotonic=clock,
        sleep=sleeper,
        jitter=SequenceJitter([0.0]),
        now=clock,
    )
    return MassiveClient(settings=settings, governor=governor), clock, sleeper


def _answer_balance_sheets_with(
    answer: FakeAnswer,
) -> Callable[[RecordedRequest], FakeAnswer]:
    """Answer the balance-sheet path with `answer`; any other path gets an
    empty success, so a read that went on would show in the recorded paths."""

    def responder(request: RecordedRequest) -> FakeAnswer:
        if request.path.split("?", 1)[0] == _BALANCE_SHEETS:
            return answer
        return json_answer({"status": "OK", "request_id": "unexpected", "results": []})

    return responder


def test_the_real_transport_clock_starts_on_a_minute_boundary() -> None:
    assert _CLOCK_START % 60 == 0


@pytest.mark.parametrize(
    "body",
    [
        pytest.param(
            {"status": "ERROR", "request_id": "req_403_001", "message": _PLAN_REFUSAL_TEXT},
            id="in-message",
        ),
        pytest.param(
            {"status": "ERROR", "request_id": "req_403_001", "error": _PLAN_REFUSAL_TEXT},
            id="in-error",
        ),
        pytest.param(
            {
                "status": "ERROR",
                "request_id": "req_403_001",
                "error": "Forbidden",
                "message": _PLAN_REFUSAL_TEXT,
            },
            id="beside-forbidden",
        ),
    ],
)
# Implements CAP-003 TC-COMP-230
def test_a_real_403_plan_refusal_is_sent_once_and_waits_nothing(
    monkeypatch: pytest.MonkeyPatch, body: dict[str, str]
) -> None:
    """CAP-003 TC-COMP-230 / DAC-E8-S1-3: through the real SDK and urllib3
    path, a `403` plan refusal raises `ProviderNotEntitled` after exactly one
    request, none to the income-statement or cash-flow paths, with no wait,
    and composes the fixed `not_entitled` reason. `sleeper.calls == []`
    rather than a zero sum: retried at jitter 0.0, the unchanged code's two
    backoff sleeps are each 0.0."""
    settings = _production_settings(monkeypatch)
    key = settings.api_key.get_secret_value()
    guard = forbid_sockets(monkeypatch)
    transport = RecordingMakeRequest(
        _answer_balance_sheets_with(json_answer(body, status=403))
    ).install(monkeypatch)
    client, _clock, sleeper = _real_transport_client(settings)

    with pytest.raises(MassiveError) as raised:
        client.fetch_financials("KO", date(2021, 1, 1), date(2025, 12, 31))

    err = raised.value
    assert type(err) is ProviderNotEntitled
    assert err.provider_request_id == "req_403_001"
    assert [r.path.split("?", 1)[0] for r in transport.requests] == [_BALANCE_SHEETS]
    assert sleeper.calls == []
    assert guard.fired == []
    reason = compose_failure_reason(
        err,
        symbol="KO",
        data_type="fundamentals",
        redact=lambda text: text.replace(key, "[redacted]"),
    )
    assert reason == (
        "[not_entitled] symbol=KO data_type=fundamentals request_id=req_403_001: "
        "the provider plan is not entitled to this data"
    )
    assert "Please upgrade your plan" not in reason


@pytest.mark.parametrize(
    "answer",
    [
        pytest.param(
            json_answer({"status": "ERROR", "request_id": "r1", "error": "Forbidden"}, status=403),
            id="forbidden-envelope",
        ),
        pytest.param(
            FakeAnswer(status=403, body=b"Forbidden", headers={"Content-Type": "text/plain"}),
            id="non-json-body",
        ),
    ],
)
# Implements CAP-003 TC-COMP-231
def test_an_unrecognised_403_is_still_retried_to_the_limit_as_unavailable(
    monkeypatch: pytest.MonkeyPatch, answer: FakeAnswer
) -> None:
    """CAP-003 TC-COMP-231 / DAC-E8-S1-4: through the real path, a `403`
    without the marker, or with a body that is not JSON, is retried to
    `max_attempts` (3, production default) and surfaces as a plain
    `ProviderUnavailable` composing kind `unavailable`."""
    settings = _production_settings(monkeypatch)
    key = settings.api_key.get_secret_value()
    forbid_sockets(monkeypatch)
    transport = RecordingMakeRequest(_answer_balance_sheets_with(answer)).install(monkeypatch)
    client, _clock, _sleeper = _real_transport_client(settings)

    with pytest.raises(MassiveError) as raised:
        client.fetch_financials("KO", date(2021, 1, 1), date(2025, 12, 31))

    err = raised.value
    assert type(err) is ProviderUnavailable
    assert not isinstance(err, ProviderNotEntitled)
    assert [r.path.split("?", 1)[0] for r in transport.requests] == [_BALANCE_SHEETS] * 3
    reason = compose_failure_reason(
        err,
        symbol="KO",
        data_type="fundamentals",
        redact=lambda text: text.replace(key, "[redacted]"),
    )
    assert reason.startswith(
        "[unavailable] symbol=KO data_type=fundamentals request_id=unavailable: "
    )
