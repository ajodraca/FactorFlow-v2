"""`MassiveClient` retry behaviour through the real `RateLimitGovernor`.

Component design: CAP-001 `component-design-massive-client.md` section 7,
row "Timeout retries to the limit", and CAP-003 massive-client section 7.

The `429` rows run the real SDK and urllib3 path (CAP-003 massive-client
section 7, DAC-E8-20): a real `MassiveClient` with production
`MassiveSettings` at 60 requests per minute and every timing value at its
default, the governor built from those settings with one `FakeClock` passed
as both `monotonic` and `now` and a `FakeSleeper` on it, and the socket-free
harness of `tests/unit/massive_transport_fakes.py`, which replaces only
`HTTPConnectionPool._make_request`. Under the locked SDK built with
`retries=0`, a real `429` reaches the governor as urllib3's `MaxRetryError`,
never as a `BadResponse`, so no row patches `RESTClient` to raise one for a
`429`. The `403`, refused-redirect and `503` rows use the same harness.
Request counts come from `RecordingMakeRequest`, never from a stored
`attempts` value.

Only the delivered TC-INT-026 row still patches `RESTClient`, constructed
with `retries=0`, so the governor alone owns retry and the SDK call count
equals the provider requests sent.
"""

import ast
import json
from collections.abc import Callable, Sequence
from datetime import date
from pathlib import Path
from typing import TypeGuard
from unittest.mock import patch

import pytest
from massive.exceptions import BadResponse
from urllib3.exceptions import (
    MaxRetryError,
    NewConnectionError,
    ProtocolError,
    ReadTimeoutError,
    ResponseError,
)

from factorflow.config.settings import MassiveSettings
from factorflow.ingestion.massive import (
    MassiveError,
    ProviderNotEntitled,
    ProviderRateLimited,
    compose_failure_reason,
)
from factorflow.ingestion.massive import client as massive_client
from factorflow.ingestion.massive.client import MassiveClient
from factorflow.ingestion.massive.errors import InstrumentNotFound, ProviderUnavailable
from factorflow.ingestion.massive.models import TickerReference
from factorflow.ingestion.rate_limit import GovernorSettings, Outcome, RateLimitGovernor
from tests.unit.governor_fakes import FakeClock, FakeSleeper, SequenceJitter
from tests.unit.massive_transport_fakes import (
    FakeAnswer,
    RecordedRequest,
    RecordingMakeRequest,
    forbid_sockets,
    generated_test_key,
    json_answer,
    redirect_answer,
)

REPO_ROOT = Path(__file__).resolve().parents[2]
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
            # Checked before each wait; the FACTORFLOW_MASSIVE_MAX_THROTTLE_WAIT_SECONDS default.
            max_throttle_wait_seconds=300.0,
        ),
        sleep=lambda _seconds: None,
    )


def _envelope(results: object) -> dict:
    return {"request_id": "req_ok_001", "results": results}


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
# Implements CAP-003 TC-COMP-249
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
_REFERENCE_AAPL = "/v3/reference/tickers/AAPL"
_DAILY_BARS_AAPL = "/v2/aggs/ticker/AAPL"
_CONFIGURED_HOST = "api.massive.com"
_REDIRECT_HOST = "198.51.100.7"


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
    jitter: Sequence[float] = (0.0,),
) -> tuple[MassiveClient, FakeClock, FakeSleeper]:
    """A `MassiveClient` built as CAP-001 section 2.2b builds it, with the
    governor from production settings and one `FakeClock` as both
    `monotonic` and `now`, so every sleep advances both clocks together.
    `jitter` feeds `SequenceJitter`; every row but the jitter row keeps
    `[0.0]`."""
    clock = FakeClock(_CLOCK_START)
    sleeper = FakeSleeper(clock)
    governor = RateLimitGovernor(
        GovernorSettings.from_massive_settings(settings),
        monotonic=clock,
        sleep=sleeper,
        jitter=SequenceJitter(jitter),
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


def _answer_429(
    path_prefix: str = "/", *, then_after: int | None = None, then: FakeAnswer | None = None
) -> Callable[[RecordedRequest], FakeAnswer]:
    """Answer every request whose path starts with `path_prefix` with a real
    `429` carrying the body of `error_rate_limited.json`; once `then_after`
    such requests have been answered, answer `then` instead. The recorded
    path carries the query string (`/v3/reference/tickers/AAPL?ticker=AAPL`),
    hence the prefix match. Any other path gets an empty success, so a read
    that went elsewhere would show in the recorded paths."""
    throttled = json_answer(_load("error_rate_limited.json"), status=429)
    matched = 0

    def responder(request: RecordedRequest) -> FakeAnswer:
        nonlocal matched
        if not request.path.startswith(path_prefix):
            return json_answer({"status": "OK", "request_id": "unexpected", "results": []})
        matched += 1
        if then is not None and then_after is not None and matched > then_after:
            return then
        return throttled

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
# Implements CAP-003 TC-COMP-249
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
# Implements CAP-003 TC-COMP-249
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


# Implements TC-INT-025
# Implements CAP-003 TC-COMP-243
def test_rate_limited_responses_are_paced_without_consuming_attempts(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """CAP-003 TC-COMP-243 / DAC-E8-S3-1, replacing CAP-001's patched
    TC-INT-025 row: through the real SDK and urllib3 path, five real `429`s
    and then a `200` are waited out at the minute boundary and the reference
    is returned, although five exceeds `max_attempts` (3). Five waits of
    exactly 60.0 s: at jitter 0.0 a backoff delay would be 0.0, so the
    literal list also proves none of them was a backoff."""
    settings = _production_settings(monkeypatch)
    guard = forbid_sockets(monkeypatch)
    transport = RecordingMakeRequest(
        _answer_429(
            _REFERENCE_AAPL,
            then_after=5,
            then=json_answer(_envelope(_load("reference_active.json"))),
        )
    ).install(monkeypatch)
    client, _clock, sleeper = _real_transport_client(settings)

    reference = client.fetch_reference("AAPL")

    assert isinstance(reference, TickerReference)
    assert reference.cik == "0000320193"
    assert len(transport.requests) == 6
    assert all(r.path.startswith(_REFERENCE_AAPL) for r in transport.requests)
    assert sleeper.calls == [60.0, 60.0, 60.0, 60.0, 60.0]
    assert guard.fired == []


# Implements CAP-003 TC-COMP-244
def test_a_persistent_real_429_spends_exactly_the_300_s_budget_and_raises_rate_limited(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """CAP-003 TC-COMP-244 / DAC-E8-S3-2: every request answered `429`, jitter
    0.0. After `start_instrument()`, five 60.0 s boundary waits fit the 300 s
    budget; the sixth `429` would take it to 360 s, so the read raises
    `ProviderRateLimited` after six requests and never sleeps past 300 s."""
    settings = _production_settings(monkeypatch)
    guard = forbid_sockets(monkeypatch)
    transport = RecordingMakeRequest(_answer_429()).install(monkeypatch)
    client, _clock, sleeper = _real_transport_client(settings)

    client.start_instrument()
    with pytest.raises(ProviderRateLimited) as raised:
        client.fetch_reference("AAPL")

    err = raised.value
    assert isinstance(err, ProviderUnavailable)
    assert err.provider_request_id is None
    assert isinstance(err.__cause__, MaxRetryError)
    assert len(transport.requests) == 6
    assert sleeper.calls == [60.0] * 5
    assert sum(sleeper.calls) == 300.0
    reason = compose_failure_reason(
        err, symbol="AAPL", data_type="reference", redact=lambda text: text
    )
    assert reason.startswith(
        "[rate_limited] symbol=AAPL data_type=reference request_id=unavailable: "
    )
    assert guard.fired == []


# Implements CAP-003 TC-COMP-245
def test_a_spent_budget_fails_the_stocks_next_read_after_one_request_until_the_next_stock(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """CAP-003 TC-COMP-245 / DAC-E8-S3-3: the budget is the stock's, across its
    requests. TC-COMP-244's scenario is repeated on one client, governor and
    clock (no state is shared between tests). Without `start_instrument()`,
    the next read fails after exactly one request and no sleep; after it, a
    read waits again. The clock then sits at `_CLOCK_START + 300.0`, a
    multiple of 60, so each new wait is exactly 60.0 s."""
    settings = _production_settings(monkeypatch)
    guard = forbid_sockets(monkeypatch)
    transport = RecordingMakeRequest(_answer_429()).install(monkeypatch)
    client, clock, sleeper = _real_transport_client(settings)
    client.start_instrument()
    with pytest.raises(ProviderRateLimited):
        client.fetch_reference("AAPL")
    assert len(transport.requests) == 6
    assert sleeper.calls == [60.0] * 5
    assert clock() == _CLOCK_START + 300.0

    with pytest.raises(ProviderRateLimited):
        client.fetch_daily_bars("AAPL", date(2024, 1, 1), date(2024, 1, 31))

    assert len(transport.requests) == 7
    assert transport.requests[6].path.startswith(_DAILY_BARS_AAPL)
    assert len(sleeper.calls) == 5

    client.start_instrument()
    with pytest.raises(ProviderRateLimited):
        client.fetch_reference("AAPL")

    assert sleeper.calls[5:] == [60.0] * 5
    assert len(transport.requests) == 13
    assert all(r.path.startswith(_REFERENCE_AAPL) for r in transport.requests[7:])
    assert guard.fired == []


# Implements CAP-003 TC-COMP-246
def test_jitter_never_takes_the_real_transport_budget_past_300_s(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """CAP-003 TC-COMP-246 / DAC-E8-S3-4: every request `429`, jitter 0.999, so
    each boundary wait is nearly doubled. The recorded sleeps total at most
    300 s, and that total plus the next delay, which the governor declined to
    sleep, exceeds 300 s. The declined delay is computed here from the clock
    with the boundary-wait formula, never through the governor."""
    settings = _production_settings(monkeypatch)
    guard = forbid_sockets(monkeypatch)
    transport = RecordingMakeRequest(_answer_429()).install(monkeypatch)
    client, clock, sleeper = _real_transport_client(settings, jitter=[0.999])

    client.start_instrument()
    with pytest.raises(ProviderRateLimited):
        client.fetch_reference("AAPL")

    boundary = 60.0 - (clock() % 60.0)
    next_delay = boundary + 0.999 * boundary
    assert sum(sleeper.calls) <= 300.0
    assert sum(sleeper.calls) + next_delay > 300.0
    assert len(transport.requests) == len(sleeper.calls) + 1
    assert guard.fired == []


@pytest.mark.parametrize(
    "responder",
    [
        pytest.param(redirect_answer, id="refused-redirect"),
        pytest.param(
            lambda _request: json_answer(
                {"status": "ERROR", "request_id": "r503", "error": "Service Unavailable"},
                status=503,
            ),
            id="forcelisted-503",
        ),
    ],
)
# Implements CAP-003 TC-COMP-247
def test_a_refused_redirect_and_a_forcelisted_503_stay_retryable_and_reach_no_other_host(
    monkeypatch: pytest.MonkeyPatch, responder: Callable[[RecordedRequest], FakeAnswer]
) -> None:
    """CAP-003 TC-COMP-247 / DAC-E8-S3-5: the `429` rule did not widen. A `302`
    to another host (refused, DEC-0042) and a forcelisted `503` each reach
    the governor as a `MaxRetryError` that stays `RETRYABLE`: three requests,
    all to the configured host, two backoff delays of 0.0 at jitter 0.0 and
    never a 60.0 s boundary wait, then a `ProviderUnavailable` that is not a
    `ProviderRateLimited`. The delivered rows in `test_massive_redirects.py`
    stay the security proof."""
    settings = _production_settings(monkeypatch)
    guard = forbid_sockets(monkeypatch)
    transport = RecordingMakeRequest(responder).install(monkeypatch)
    client, _clock, sleeper = _real_transport_client(settings)

    with pytest.raises(ProviderUnavailable) as raised:
        client.fetch_reference("AAPL")

    err = raised.value
    assert not isinstance(err, ProviderRateLimited)
    assert isinstance(err.__cause__, MaxRetryError)
    assert len(transport.requests) == 3
    assert [r.host for r in transport.requests] == [_CONFIGURED_HOST] * 3
    assert all(r.host != _REDIRECT_HOST for r in transport.requests)
    assert sleeper.calls == [0.0, 0.0]
    assert guard.fired == []


def _not_a_max_retry_error_with_a_429_reason() -> ProtocolError:
    """An error that is not a `MaxRetryError` but carries a `reason` equal to
    the `429` `ResponseError`: rule 1 is for a `MaxRetryError` only."""
    error = ProtocolError("Connection aborted.")
    error.reason = ResponseError(ResponseError.SPECIFIC_ERROR.format(status_code=429))  # type: ignore[attr-defined]
    return error


@pytest.mark.parametrize(
    ("exc", "expected"),
    [
        pytest.param(
            MaxRetryError(
                None,
                _REFERENCE_AAPL,
                ResponseError(ResponseError.SPECIFIC_ERROR.format(status_code=429)),
            ),
            Outcome.THROTTLED,
            id="429-max-retry-is-throttled",
        ),
        pytest.param(
            MaxRetryError(
                None,
                _REFERENCE_AAPL,
                ResponseError(ResponseError.SPECIFIC_ERROR.format(status_code=503)),
            ),
            Outcome.RETRYABLE,
            id="503-max-retry-is-retryable",
        ),
        pytest.param(
            MaxRetryError(None, _REFERENCE_AAPL, ResponseError("too many redirects")),
            Outcome.RETRYABLE,
            id="refused-redirect-is-retryable",
        ),
        pytest.param(
            MaxRetryError(
                None,
                _REFERENCE_AAPL,
                NewConnectionError(None, "Failed to establish a new connection"),
            ),
            Outcome.RETRYABLE,
            id="connection-error-is-retryable",
        ),
        pytest.param(
            BadResponse((FIXTURES / "error_rate_limited.json").read_text()),
            Outcome.THROTTLED,
            id="rate-limited-body-is-throttled",
        ),
        # Implementation-level rows (T012), beyond the case's steps.
        pytest.param(
            MaxRetryError(
                None,
                _REFERENCE_AAPL,
                ProtocolError(ResponseError.SPECIFIC_ERROR.format(status_code=429)),
            ),
            Outcome.RETRYABLE,
            id="429-text-in-a-reason-that-is-not-a-response-error-is-retryable",
        ),
        pytest.param(
            BadResponse((FIXTURES / "error_not_found.json").read_text()),
            Outcome.FATAL,
            id="not-found-body-is-fatal",
        ),
        pytest.param(
            BadResponse((FIXTURES / "error_unknown_shape.json").read_text()),
            Outcome.RETRYABLE,
            id="unknown-shape-body-is-retryable",
        ),
        # Implementation-level rows added after the cycle's mutation runs, beyond
        # the plan: every other forcelisted status design section 2.3 rule 2
        # names, rule 1's exact-text and MaxRetryError-only edges, and rule 2
        # winning over rule 3 for an error that is not a `BadResponse`.
        *[
            pytest.param(
                MaxRetryError(
                    None,
                    _REFERENCE_AAPL,
                    ResponseError(ResponseError.SPECIFIC_ERROR.format(status_code=status)),
                ),
                Outcome.RETRYABLE,
                id=f"{status}-max-retry-is-retryable",
            )
            for status in (413, 499, 500, 502, 504)
        ],
        pytest.param(
            MaxRetryError(
                None,
                _REFERENCE_AAPL,
                ResponseError(
                    ResponseError.SPECIFIC_ERROR.format(status_code=429) + " via a proxy"
                ),
            ),
            Outcome.RETRYABLE,
            id="a-reason-only-containing-the-429-text-is-retryable",
        ),
        # Rule 1 compares the text with `==` (DAC-E8-2 "equal to"; design
        # section 2.3 rule 1): the 429 text with a prefix, with leading or
        # trailing whitespace or in another letter case is not equal, so it is
        # rule 2's RETRYABLE (implementation review v1 IR-001).
        pytest.param(
            MaxRetryError(
                None,
                _REFERENCE_AAPL,
                ResponseError("proxy: " + ResponseError.SPECIFIC_ERROR.format(status_code=429)),
            ),
            Outcome.RETRYABLE,
            id="the-429-text-with-a-prefix-is-retryable",
        ),
        pytest.param(
            MaxRetryError(
                None,
                _REFERENCE_AAPL,
                ResponseError(" " + ResponseError.SPECIFIC_ERROR.format(status_code=429)),
            ),
            Outcome.RETRYABLE,
            id="the-429-text-with-leading-whitespace-is-retryable",
        ),
        pytest.param(
            MaxRetryError(
                None,
                _REFERENCE_AAPL,
                ResponseError(ResponseError.SPECIFIC_ERROR.format(status_code=429) + "\n"),
            ),
            Outcome.RETRYABLE,
            id="the-429-text-with-trailing-whitespace-is-retryable",
        ),
        pytest.param(
            MaxRetryError(
                None,
                _REFERENCE_AAPL,
                ResponseError(ResponseError.SPECIFIC_ERROR.format(status_code=429).upper()),
            ),
            Outcome.RETRYABLE,
            id="the-429-text-in-another-case-is-retryable",
        ),
        pytest.param(
            _not_a_max_retry_error_with_a_429_reason(),
            Outcome.RETRYABLE,
            id="a-429-reason-on-an-error-that-is-not-a-max-retry-error-is-retryable",
        ),
        pytest.param(
            ProtocolError((FIXTURES / "error_rate_limited.json").read_text()),
            Outcome.RETRYABLE,
            id="the-rate-limited-body-on-an-error-that-is-not-a-bad-response-is-retryable",
        ),
    ],
)
# Implements CAP-003 TC-COMP-248
def test_classify_for_governor_matches_only_urllib3s_429_constant_and_still_throttles_the_body(
    exc: BaseException, expected: Outcome
) -> None:
    """CAP-003 TC-COMP-248 / DAC-E8-S3-6: called directly, with no client and
    nothing patched. The `429` text is built here from urllib3's own
    `ResponseError.SPECIFIC_ERROR` with the literal 429, never from the
    module's constant. The `BadResponse` rate-limited row is the only one
    building a `BadResponse` for a `429`: it stands for an SDK without `429`
    in its forcelist, not for production."""
    assert massive_client.classify_for_governor(exc) is expected


# Implementation-level row beyond TC-COMP-248's steps (added after the cycle's
# first mutation run): pins T014's `__all__` entry.
def test_classify_for_governor_is_part_of_the_client_modules_interface() -> None:
    """massive-client CAP-003 section 11 lists `classify_for_governor(exc)` as
    an in-process interface; T014 declares it in the module's `__all__`."""
    assert "classify_for_governor" in massive_client.__all__


# Implementation-level row beyond TC-COMP-249's steps (added after the cycle's
# first mutation run): pins T015's kept FATAL re-raise.
def test_a_fatal_bad_response_is_raised_typed_from_the_one_response(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """The `except BadResponse` re-raise `_through_governor` keeps (massive-client
    CAP-003 section 2.3): through the real path, a `404` (not forcelisted)
    reaches the governor as the SDK's `BadResponse`, `classify_for_governor`
    makes it `FATAL`, and the client raises `InstrumentNotFound` built from
    that one response, with its `request_id`, from the SDK's error, after one
    request and no wait."""
    settings = _production_settings(monkeypatch)
    guard = forbid_sockets(monkeypatch)
    transport = RecordingMakeRequest(
        lambda _request: json_answer(_load("error_not_found.json"), status=404)
    ).install(monkeypatch)
    client, _clock, sleeper = _real_transport_client(settings)

    with pytest.raises(MassiveError) as raised:
        client.fetch_reference("AAPL")

    err = raised.value
    assert type(err) is InstrumentNotFound
    assert err.provider_request_id == "req_notfound_001"
    assert isinstance(err.__cause__, BadResponse)
    assert len(transport.requests) == 1
    assert sleeper.calls == []
    assert guard.fired == []


def _patches_rest_client(function: ast.AST) -> bool:
    """`patch("<...>.RESTClient")`, `patch.object(<module>, "RESTClient")`,
    `monkeypatch.setattr("<...>.RESTClient", ...)` or
    `monkeypatch.setattr(<module>, "RESTClient", ...)`."""
    for node in ast.walk(function):
        if not isinstance(node, ast.Call):
            continue
        func = node.func
        name = (
            func.id
            if isinstance(func, ast.Name)
            else func.attr
            if isinstance(func, ast.Attribute)
            else None
        )
        if name not in {"patch", "object", "setattr"}:
            continue
        arguments = [
            *node.args[:2],
            *(k.value for k in node.keywords if k.arg in {"target", "attribute", "name"}),
        ]
        targets = [
            arg.value
            for arg in arguments
            if isinstance(arg, ast.Constant) and isinstance(arg.value, str)
        ]
        if any(target == "RESTClient" or target.endswith(".RESTClient") for target in targets):
            return True
    return False


def _reads_attempts(node: ast.AST) -> TypeGuard[ast.Attribute | ast.Subscript]:
    return (isinstance(node, ast.Attribute) and node.attr == "attempts") or (
        isinstance(node, ast.Subscript)
        and isinstance(node.slice, ast.Constant)
        and node.slice.value == "attempts"
    )


# The one `attempts` read under tests/ that is not a recorded value: the
# column's default, read from `information_schema` (CAP-001 migration 0004).
_SCHEMA_DEFAULT_READS = {
    ("tests/integration/test_run_constraints.py", "result_columns['attempts']"),
}


def _names_a_429(function: ast.AST) -> bool:
    for node in ast.walk(function):
        if not isinstance(node, ast.Constant):
            continue
        if isinstance(node.value, str) and (
            "error_rate_limited" in node.value or "429" in node.value
        ):
            return True
        if isinstance(node.value, int) and node.value == 429:
            return True
    return False


# Implements CAP-003 TC-COMP-251
def test_the_429_change_adds_no_package_and_no_test_fakes_a_429_or_reads_attempts() -> None:
    """CAP-003 TC-COMP-251 / DAC-E8-S3-9, read with `ast`, never a text regex
    over test files (so this test's own constants cannot match its rules):
    (a) `client.py` imports `MaxRetryError` and `ResponseError` from
    `urllib3.exceptions`; (b) `_THROTTLED_RETRY_REASON` is built from
    urllib3's constant, never a hand-typed copy, which no behavioural test can
    tell apart at urllib3 2.7.0; (c) no test function that replaces
    `RESTClient` (`patch`, `patch.object` or `monkeypatch.setattr`) names a
    `429` or the rate-limited fixture; (d) no test file reads a recorded
    `attempts` value (`_SCHEMA_DEFAULT_READS` names the one read of the
    column's default, which is schema metadata). The lock-file clause is
    checked by the story's validation, not here."""
    client_source = REPO_ROOT / "src" / "factorflow" / "ingestion" / "massive" / "client.py"
    client_tree = ast.parse(client_source.read_text())

    imported = {
        alias.name
        for node in ast.walk(client_tree)
        if isinstance(node, ast.ImportFrom) and node.module == "urllib3.exceptions"
        for alias in node.names
    }
    assert {"MaxRetryError", "ResponseError"} <= imported

    assignments = [
        node
        for node in client_tree.body
        if isinstance(node, ast.Assign)
        and any(
            isinstance(target, ast.Name) and target.id == "_THROTTLED_RETRY_REASON"
            for target in node.targets
        )
    ]
    assert len(assignments) == 1
    value = assignments[0].value
    assert isinstance(value, ast.Call)
    assert ast.unparse(value.func) == "ResponseError.SPECIFIC_ERROR.format"
    assert value.args == []
    assert [(k.arg, ast.literal_eval(k.value)) for k in value.keywords] == [("status_code", 429)]
    string_constants = {
        node.value
        for node in ast.walk(client_tree)
        if isinstance(node, ast.Constant) and isinstance(node.value, str)
    }
    assert "too many 429 error responses" not in string_constants

    offenders = []
    reads = []
    for path in sorted((REPO_ROOT / "tests").rglob("*.py")):
        tree = ast.parse(path.read_text(), filename=str(path))
        functions = [
            node
            for node in ast.walk(tree)
            if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef))
        ]
        offenders += [
            f"{path.relative_to(REPO_ROOT)}::{function.name}"
            for function in functions
            if _patches_rest_client(function) and _names_a_429(function)
        ]
        relative = path.relative_to(REPO_ROOT).as_posix()
        reads += [
            f"{relative}:{node.lineno}"
            for node in ast.walk(tree)
            if _reads_attempts(node) and (relative, ast.unparse(node)) not in _SCHEMA_DEFAULT_READS
        ]
    assert offenders == []
    assert reads == []
