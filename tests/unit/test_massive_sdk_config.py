"""`MassiveClient` SDK construction tests (CAP-001-E3-S1).

Component design: `component-design-massive-client.md` section 2.2b (the
SDK defaults that must be overridden explicitly) and section 7 (`SDK
retries are disabled`, `SDK pagination is disabled`, `Trace logging is
off`).

The SDK's own `RESTClient` is substituted here so these tests inspect the
exact keyword arguments this component passes to it, never a live
connection.
"""

import json
from datetime import date
from pathlib import Path
from unittest.mock import patch

from factorflow.config.settings import MassiveSettings
from factorflow.ingestion.massive.client import MassiveClient
from factorflow.ingestion.rate_limit import GovernorSettings, RateLimitGovernor

FIXTURES = Path(__file__).resolve().parents[1] / "fixtures" / "massive"


def _load(name: str) -> dict:
    return json.loads((FIXTURES / name).read_text())


class _FakeResponse:
    def __init__(self, payload: dict, status: int = 200) -> None:
        self.status = status
        self.data = json.dumps(payload).encode()


def _settings(**overrides: object) -> MassiveSettings:
    defaults: dict[str, object] = {
        "api_key": "test-secret-key",
        "requests_per_minute": 60,
        "max_attempts": 3,
        "timeout_seconds": 30.0,
        "backoff_initial_seconds": 2.0,
        "max_throttle_wait_seconds": 300.0,
    }
    defaults.update(overrides)
    return MassiveSettings.model_validate(defaults)


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


# --- TC-COMP-209 / DAC-E3-S1-1: SDK defaults requiring override ---------


def test_constructs_one_rest_client_with_retries_disabled() -> None:
    """TC-COMP-209: `retries=0` is passed explicitly, so the governor owns
    retry alone (section 2.2b) -- a default reasserting itself on an SDK
    upgrade must not silently multiply attempts."""
    with patch("factorflow.ingestion.massive.client.RESTClient") as rest_client_cls:
        MassiveClient(settings=_settings(), governor=_governor())

    _, kwargs = rest_client_cls.call_args
    assert kwargs["retries"] == 0


def test_constructs_one_rest_client_with_pagination_disabled() -> None:
    """TC-COMP-209: `pagination=False`, so pages are followed one at a time
    under governor permits rather than eagerly by the SDK (section 2.2b)."""
    with patch("factorflow.ingestion.massive.client.RESTClient") as rest_client_cls:
        MassiveClient(settings=_settings(), governor=_governor())

    _, kwargs = rest_client_cls.call_args
    assert kwargs["pagination"] is False


def test_constructs_one_rest_client_with_trace_disabled() -> None:
    """TC-COMP-209: `trace=False`, so request headers carrying the
    credential are never logged (AC-13)."""
    with patch("factorflow.ingestion.massive.client.RESTClient") as rest_client_cls:
        MassiveClient(settings=_settings(), governor=_governor())

    _, kwargs = rest_client_cls.call_args
    assert kwargs["trace"] is False


def test_constructs_one_rest_client_with_explicit_connect_and_read_timeouts() -> None:
    """DAC-E3-S1-1: both SDK timeout fields are sourced from
    `MassiveSettings.timeout_seconds` explicitly, not left to the SDK's own
    default (component design section 2.2b)."""
    with patch("factorflow.ingestion.massive.client.RESTClient") as rest_client_cls:
        MassiveClient(settings=_settings(timeout_seconds=45.0), governor=_governor())

    _, kwargs = rest_client_cls.call_args
    assert kwargs["connect_timeout"] == 45.0
    assert kwargs["read_timeout"] == 45.0


def test_constructs_exactly_one_reusable_rest_client() -> None:
    """The client builds its one reusable `RESTClient` at construction time,
    not per-request (section 2.2b: 'one pooled SDK client')."""
    with patch("factorflow.ingestion.massive.client.RESTClient") as rest_client_cls:
        MassiveClient(settings=_settings(), governor=_governor())

    assert rest_client_cls.call_count == 1


# --- TC-COMP-213: the market-status endpoint is never called ------------


def test_market_status_endpoint_is_never_called() -> None:
    """DAC-E3-S1-5: `MassiveClient` never calls the forward-looking
    market-holidays endpoint (`GET /v1/marketstatus/upcoming`); trading
    days are derived from acquired data instead.

    Constructing the client alone can never fail this assertion, since
    nothing calls any endpoint at construction time -- it would pass even
    if every one of the four reads called the forbidden endpoint. All four
    reads are exercised so the assertion protects the complete acquisition
    surface (IR-001)."""
    with patch("factorflow.ingestion.massive.client.RESTClient") as rest_client_cls:
        instance = rest_client_cls.return_value
        instance.get_ticker_details.return_value = _FakeResponse(
            {"request_id": "req_ok_001", "results": _load("reference_active.json")}
        )
        instance.get_aggs.return_value = _FakeResponse({"request_id": "req_ok_001", "results": []})
        for method in (
            instance.list_financials_balance_sheets,
            instance.list_financials_income_statements,
            instance.list_financials_cash_flow_statements,
            instance.list_financials_ratios,
            instance.list_stocks_splits,
            instance.list_stocks_dividends,
            instance.vx.list_ipos,
        ):
            method.return_value = _FakeResponse({"request_id": "req_ok_001", "results": []})
        instance.get_ticker_events.return_value = _FakeResponse(
            {"request_id": "req_ok_001", "results": {"events": []}}
        )
        client = MassiveClient(settings=_settings(), governor=_governor())

        client.fetch_reference("AAPL")
        client.fetch_daily_bars("AAPL", date(2024, 1, 1), date(2024, 1, 31))
        client.fetch_financials("AAPL", date(2024, 1, 1), date(2024, 12, 31))
        client.fetch_corporate_actions("AAPL", date(2024, 1, 1), date(2024, 12, 31))

    assert not instance.get_market_holidays.called
    assert not instance.get_market_status.called
    assert not instance.list_tickers.called
