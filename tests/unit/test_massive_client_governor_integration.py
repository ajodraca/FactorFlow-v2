"""`MassiveClient` <-> `RateLimitGovernor` integration (CAP-001-E3-S1).

Component design: `component-design-massive-client.md` section 2.2
("every request is paced by the governor before it is issued") and
`component-design-rate-limit-governor.md` section 2.3 (the seam this
story owns). None of the per-endpoint test files observe the governor
itself -- they mock `RESTClient` and assert on its call arguments, which
cannot tell a governed call from an ungoverned one. These tests patch
`RateLimitGovernor.execute` directly and count calls, so a first page
routed around the governor (as `fetch_reference`, `fetch_daily_bars`,
`fetch_financials` and three of `fetch_corporate_actions`'s four reads
originally were) fails here even though the SDK-level tests stay green.
"""

import json
from datetime import date
from pathlib import Path
from unittest.mock import MagicMock, call, patch

import pytest

from factorflow.config.settings import MassiveSettings
from factorflow.ingestion.massive.client import MassiveClient
from factorflow.ingestion.massive.errors import InstrumentNotFound
from factorflow.ingestion.rate_limit import GovernorSettings, RateLimitGovernor
from tests.unit.massive_transport_fakes import (
    RecordingMakeRequest,
    forbid_sockets,
    generated_test_key,
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


def test_fetch_reference_routes_its_single_request_through_the_governor() -> None:
    with (
        patch("factorflow.ingestion.massive.client.RESTClient") as rest_client_cls,
        patch.object(RateLimitGovernor, "execute", autospec=True) as execute,
    ):
        execute.side_effect = lambda self, send, classify: send()
        instance = rest_client_cls.return_value
        instance.get_ticker_details.return_value = _FakeResponse(
            _envelope(_load("reference_active.json"))
        )
        client = MassiveClient(settings=_settings(), governor=_governor())

        client.fetch_reference("AAPL")

    assert execute.call_count == 1


def test_fetch_daily_bars_routes_both_the_first_and_next_page_through_the_governor() -> None:
    page_two_url = (
        "https://api.massive.com/v2/aggs/ticker/AAPL/range/1/day/2024-01-01/2024-01-31?cursor=abc"
    )
    with (
        patch("factorflow.ingestion.massive.client.RESTClient") as rest_client_cls,
        patch.object(RateLimitGovernor, "execute", autospec=True) as execute,
    ):
        execute.side_effect = lambda self, send, classify: send()
        instance = rest_client_cls.return_value
        instance.get_aggs.return_value = _FakeResponse(
            _envelope([_load("bar_regular.json")]) | {"next_url": page_two_url}
        )
        instance._get.return_value = _FakeResponse(_envelope([_load("bar_regular.json")]))
        client = MassiveClient(settings=_settings(), governor=_governor())

        client.fetch_daily_bars("AAPL", date(2024, 1, 1), date(2024, 1, 31))

    # One permit for the first page, one for the followed `next_url` page.
    assert execute.call_count == 2


def test_fetch_financials_routes_each_of_the_three_statement_reads_through_the_governor() -> None:
    with (
        patch("factorflow.ingestion.massive.client.RESTClient") as rest_client_cls,
        patch.object(RateLimitGovernor, "execute", autospec=True) as execute,
    ):
        execute.side_effect = lambda self, send, classify: send()
        instance = rest_client_cls.return_value
        for method in (
            instance.list_financials_balance_sheets,
            instance.list_financials_income_statements,
            instance.list_financials_cash_flow_statements,
        ):
            method.return_value = _FakeResponse(_envelope([]))
        client = MassiveClient(settings=_settings(), governor=_governor())

        client.fetch_financials("AAPL", date(2023, 1, 1), date(2023, 12, 31))

    # Three statement reads, each its own governor permit; ratios are not
    # acquired (component design v13 section 2.5).
    assert execute.call_count == 3


def test_fetch_corporate_actions_routes_all_four_reads_through_the_governor() -> None:
    with (
        patch("factorflow.ingestion.massive.client.RESTClient") as rest_client_cls,
        patch.object(RateLimitGovernor, "execute", autospec=True) as execute,
    ):
        execute.side_effect = lambda self, send, classify: send()
        instance = rest_client_cls.return_value
        instance.list_stocks_splits.return_value = _FakeResponse(_envelope([]))
        instance.list_stocks_dividends.return_value = _FakeResponse(_envelope([]))
        instance.vx.list_ipos.return_value = _FakeResponse(_envelope([]))
        instance.get_ticker_events.return_value = _FakeResponse(_envelope({"events": []}))
        client = MassiveClient(settings=_settings(), governor=_governor())

        client.fetch_corporate_actions("AAPL", date(2020, 1, 1), date(2024, 12, 31))

    # Splits, dividends, IPOs and the ticker-events read: four provider
    # requests, each its own governor permit.
    assert execute.call_count == 4


@pytest.mark.parametrize(
    ("call", "sdk_method"),
    [
        (
            lambda client: client.fetch_reference("AAPL"),
            "get_ticker_details",
        ),
        (
            lambda client: client.fetch_daily_bars("AAPL", date(2024, 1, 1), date(2024, 1, 31)),
            "get_aggs",
        ),
        (
            lambda client: client.fetch_financials("AAPL", date(2023, 1, 1), date(2023, 12, 31)),
            "list_financials_balance_sheets",
        ),
        (
            lambda client: client.fetch_corporate_actions(
                "AAPL", date(2020, 1, 1), date(2024, 12, 31)
            ),
            "list_stocks_splits",
        ),
    ],
    ids=["fetch_reference", "fetch_daily_bars", "fetch_financials", "fetch_corporate_actions"],
)
# Implements TC-INT-025
def test_a_first_page_provider_failure_surfaces_as_the_typed_error(call, sdk_method) -> None:
    """IR-001: before routing the first page through the governor, a
    first-page failure escaped as the SDK's own `massive.exceptions.
    BadResponse` rather than a typed error, because only `_next_page` and
    `_get_one` went through `_through_governor`'s classification. All four
    fetch methods' first reads must now surface `InstrumentNotFound`
    (component design sections 2.4 / 8; the E4 runner's AC-11 handling
    depends on the typed distinction, not on `BadResponse`)."""
    from massive.exceptions import BadResponse

    with patch("factorflow.ingestion.massive.client.RESTClient") as rest_client_cls:
        instance = rest_client_cls.return_value
        # Every other sibling read stays unconfigured (defaults to a Mock,
        # not exercised): only the first call this test's `call` makes
        # needs to fail, and each `call` is arranged so that is `sdk_method`.
        for other in (
            "get_ticker_details",
            "get_aggs",
            "list_financials_balance_sheets",
            "list_financials_income_statements",
            "list_financials_cash_flow_statements",
            "list_stocks_splits",
        ):
            if other != sdk_method:
                getattr(instance, other).return_value = _FakeResponse(_envelope([]))
        instance.vx.list_ipos.return_value = _FakeResponse(_envelope([]))
        instance.list_stocks_dividends.return_value = _FakeResponse(_envelope([]))
        instance.get_ticker_events.return_value = _FakeResponse(_envelope({"events": []}))
        getattr(instance, sdk_method).side_effect = BadResponse(
            (FIXTURES / "error_not_found.json").read_text()
        )
        client = MassiveClient(settings=_settings(), governor=_governor())

        with pytest.raises(InstrumentNotFound):
            call(client)


# Implements CAP-003 TC-COMP-250
def test_start_instrument_starts_the_governor_budget_once_and_sends_nothing(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """CAP-003 TC-COMP-250 / DAC-E8-S3-8: `start_instrument()` is the stock
    boundary (massive-client CAP-003 section 2.6). On a real `MassiveClient`
    built from production settings with a spy governor, it starts the
    governor's throttle budget exactly once, asks the governor for no permit
    and sends no request through the socket-free transport."""
    monkeypatch.delenv("FACTORFLOW_MASSIVE_BASE_URL", raising=False)
    monkeypatch.delenv("FACTORFLOW_MASSIVE_MAX_ATTEMPTS", raising=False)
    monkeypatch.setenv("FACTORFLOW_MASSIVE_API_KEY", generated_test_key())
    monkeypatch.setenv("FACTORFLOW_MASSIVE_REQUESTS_PER_MINUTE", "60")
    settings = MassiveSettings(_env_file=None)  # type: ignore[call-arg]
    guard = forbid_sockets(monkeypatch)
    transport = RecordingMakeRequest().install(monkeypatch)
    governor = MagicMock(spec=RateLimitGovernor)
    client = MassiveClient(settings=settings, governor=governor)

    client.start_instrument()

    governor.start_throttle_budget.assert_called_once_with()
    assert governor.execute.call_count == 0
    assert governor.method_calls == [call.start_throttle_budget()]
    assert transport.requests == []
    assert guard.fired == []
