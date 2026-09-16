"""`CorporateAction` tests (CAP-001-E3-S2). See `models.py` for the model.

Component design: `component-design-massive-client.md` section 7 (`Corporate
actions parse`); `component-design-market-data-store.md` section 2.3
(`corporate_action`).
"""

import json
from datetime import date
from decimal import Decimal
from pathlib import Path
from unittest.mock import patch

import pytest
from pydantic import ValidationError

from factorflow.config.settings import MassiveSettings
from factorflow.ingestion.massive.client import MassiveClient
from factorflow.ingestion.massive.errors import ProviderContractViolation
from factorflow.ingestion.massive.models import CorporateAction
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


def test_split_maps_to_a_product_named_action() -> None:
    """TC-COMP-206 (corporate-action portion): a split maps to
    `corporate_action`'s `action_type`/`effective_on` natural key. The
    provider's own `execution_date` still survives -- deliberately, as
    variant-specific payload data (component design Notes) -- but the
    natural key itself is named in the product's vocabulary, not the
    provider's."""
    wire = _load("action_split.json")
    action = CorporateAction.model_validate(
        {**wire, "action_type": "split", "effective_on": wire["execution_date"]}
    )

    assert action.action_type == "split"
    assert action.effective_on == date(2020, 8, 31)


def test_dividend_maps_to_a_product_named_action() -> None:
    """A dividend's natural effective date is its ex-dividend date."""
    wire = _load("action_dividend.json")
    action = CorporateAction.model_validate(
        {**wire, "action_type": "dividend", "effective_on": wire["ex_dividend_date"]}
    )

    assert action.action_type == "dividend"
    assert action.effective_on == date(2024, 2, 9)


def test_ticker_change_maps_to_a_product_named_action() -> None:
    """A ticker-change event's `date` becomes `effective_on`."""
    wire = _load("action_ticker_change.json")
    action = CorporateAction.model_validate(
        {**wire, "action_type": "ticker_change", "effective_on": wire["date"]}
    )

    assert action.action_type == "ticker_change"
    assert action.effective_on == date(2007, 1, 9)


def test_ipo_maps_to_a_product_named_action() -> None:
    """An IPO's listing date becomes `effective_on`."""
    wire = _load("action_ipo.json")
    action = CorporateAction.model_validate(
        {**wire, "action_type": "ipo", "effective_on": wire["listing_date"]}
    )

    assert action.action_type == "ipo"
    assert action.effective_on == date(2023, 9, 14)


def test_only_the_four_known_action_types_are_accepted() -> None:
    """`corporate_action_type_known` in the DDL constrains `action_type` to
    `split`, `dividend`, `ticker_change` and `ipo`; an unrecognised value
    fails validation rather than being written."""
    wire = _load("action_split.json")

    with pytest.raises(ValidationError):
        CorporateAction.model_validate(
            {**wire, "action_type": "not_a_real_action", "effective_on": wire["execution_date"]}
        )


@pytest.mark.parametrize("missing_field", ["action_type", "effective_on"])
def test_missing_required_field_fails_validation(missing_field: str) -> None:
    """DAC-E3-S2-4: a response missing a field the model requires fails
    validation. `action_type` and `effective_on` are required because they
    are `corporate_action`'s natural key and NOT NULL columns."""
    wire = _load("action_split.json")
    payload = {**wire, "action_type": "split", "effective_on": wire["execution_date"]}
    del payload[missing_field]

    with pytest.raises(ValidationError):
        CorporateAction.model_validate(payload)


def test_no_declared_field_is_typed_float() -> None:
    """DAC-E3-S2-3: no declared monetary or ratio field is typed `float`."""
    for name, info in CorporateAction.model_fields.items():
        assert info.annotation is not float, name


def test_split_ratio_values_are_decimal_not_float() -> None:
    """DAC-E3-S2-3: a split's ratio-shaped provider values (e.g. the
    historical adjustment factor) are coerced to `Decimal`."""
    wire = _load("action_split.json")
    action = CorporateAction.model_validate(
        {**wire, "action_type": "split", "effective_on": wire["execution_date"]}
    )

    assert action.model_extra is not None
    assert action.model_extra["historical_adjustment_factor"] == Decimal("0.25")
    assert isinstance(action.model_extra["historical_adjustment_factor"], Decimal)


def test_dividend_cash_amount_is_decimal_not_float() -> None:
    """DAC-E3-S2-3: a dividend's cash amount is `Decimal`, not `float`."""
    wire = _load("action_dividend.json")
    action = CorporateAction.model_validate(
        {**wire, "action_type": "dividend", "effective_on": wire["ex_dividend_date"]}
    )

    assert action.model_extra["cash_amount"] == Decimal("0.24")
    assert isinstance(action.model_extra["cash_amount"], Decimal)


def test_value_payload_uses_decimal_strings_and_owns_no_writer_metadata() -> None:
    """Payload-contract test: `Decimal` values serialize as strings, and
    the payload carries none of the writer-owned fields."""
    wire = _load("action_split.json")
    action = CorporateAction.model_validate(
        {**wire, "action_type": "split", "effective_on": wire["execution_date"]}
    )
    payload = action.value_payload()

    json.dumps(payload)  # must not raise
    assert payload["historical_adjustment_factor"] == "0.25"
    assert payload["action_type"] == "split"
    for writer_owned in ("observed_on", "run_id", "recorded_at"):
        assert writer_owned not in payload


# --- MassiveClient.fetch_corporate_actions (CAP-001-E3-S1) ---------------


def test_fetch_corporate_actions_returns_a_complete_result_for_a_covered_symbol() -> None:
    """TC-COMP-003: `fetch_corporate_actions` returns splits, dividends,
    ticker changes and IPOs mapped to the product's enumeration for a
    covered symbol (AC-3)."""
    with patch("factorflow.ingestion.massive.client.RESTClient") as rest_client_cls:
        instance = rest_client_cls.return_value
        instance.list_stocks_splits.return_value = _FakeResponse(
            _envelope([_load("action_split.json")])
        )
        instance.list_stocks_dividends.return_value = _FakeResponse(
            _envelope([_load("action_dividend.json")])
        )
        instance.vx.list_ipos.return_value = _FakeResponse(_envelope([_load("action_ipo.json")]))
        instance.get_ticker_events.return_value = _FakeResponse(
            _envelope({"events": [_load("action_ticker_change.json")]})
        )
        client = MassiveClient(settings=_settings(), governor=_governor())

        # `action_ticker_change.json` dates to 2007-01-09; the ticker-events
        # endpoint takes no date-range parameter (component design section
        # 2.5), so the client filters client-side -- the queried range must
        # bracket the fixture's date for it to survive that filter.
        actions = client.fetch_corporate_actions("AAPL", date(2000, 1, 1), date(2024, 12, 31))

    action_types = {action.action_type for action in actions}
    assert action_types == {"split", "dividend", "ticker_change", "ipo"}
    assert all(isinstance(action, CorporateAction) for action in actions)


def test_fetch_corporate_actions_split_effective_on_is_execution_date() -> None:
    with patch("factorflow.ingestion.massive.client.RESTClient") as rest_client_cls:
        instance = rest_client_cls.return_value
        instance.list_stocks_splits.return_value = _FakeResponse(
            _envelope([_load("action_split.json")])
        )
        instance.list_stocks_dividends.return_value = _FakeResponse(_envelope([]))
        instance.vx.list_ipos.return_value = _FakeResponse(_envelope([]))
        instance.get_ticker_events.return_value = _FakeResponse(_envelope({"events": []}))
        client = MassiveClient(settings=_settings(), governor=_governor())

        actions = client.fetch_corporate_actions("AAPL", date(2020, 1, 1), date(2024, 12, 31))

    assert len(actions) == 1
    assert actions[0].action_type == "split"
    assert actions[0].effective_on == date(2020, 8, 31)


def test_fetch_corporate_actions_ticker_events_endpoint_has_no_paging_assumed() -> None:
    """Component design section 2.5: ticker events documents no paging, so
    this component must not assume `next_url` is universally present --
    absence is a complete result, not an error."""
    with patch("factorflow.ingestion.massive.client.RESTClient") as rest_client_cls:
        instance = rest_client_cls.return_value
        instance.list_stocks_splits.return_value = _FakeResponse(_envelope([]))
        instance.list_stocks_dividends.return_value = _FakeResponse(_envelope([]))
        instance.vx.list_ipos.return_value = _FakeResponse(_envelope([]))
        instance.get_ticker_events.return_value = _FakeResponse(
            _envelope({"events": [_load("action_ticker_change.json")]})
        )
        client = MassiveClient(settings=_settings(), governor=_governor())

        actions = client.fetch_corporate_actions("AAPL", date(2000, 1, 1), date(2024, 12, 31))

    assert len(actions) == 1
    assert actions[0].action_type == "ticker_change"
    assert actions[0].effective_on == date(2007, 1, 9)


def test_fetch_corporate_actions_excludes_ticker_events_outside_the_requested_range() -> None:
    """The ticker-events endpoint takes no date-range parameter (component
    design section 2.5: only `ticker` and `types`), so an event outside
    the requested `[start, end]` must be filtered client-side rather than
    returned -- `action_ticker_change.json` dates to 2007-01-09, outside
    this query's 2020-2024 range."""
    with patch("factorflow.ingestion.massive.client.RESTClient") as rest_client_cls:
        instance = rest_client_cls.return_value
        instance.list_stocks_splits.return_value = _FakeResponse(_envelope([]))
        instance.list_stocks_dividends.return_value = _FakeResponse(_envelope([]))
        instance.vx.list_ipos.return_value = _FakeResponse(_envelope([]))
        instance.get_ticker_events.return_value = _FakeResponse(
            _envelope({"events": [_load("action_ticker_change.json")]})
        )
        client = MassiveClient(settings=_settings(), governor=_governor())

        actions = client.fetch_corporate_actions("AAPL", date(2020, 1, 1), date(2024, 12, 31))

    assert actions == []


def _client_with_ticker_events(event_rows: list[dict]) -> MassiveClient:
    with patch("factorflow.ingestion.massive.client.RESTClient") as rest_client_cls:
        instance = rest_client_cls.return_value
        instance.list_stocks_splits.return_value = _FakeResponse(_envelope([]))
        instance.list_stocks_dividends.return_value = _FakeResponse(_envelope([]))
        instance.vx.list_ipos.return_value = _FakeResponse(_envelope([]))
        instance.get_ticker_events.return_value = _FakeResponse(_envelope({"events": event_rows}))
        return MassiveClient(settings=_settings(), governor=_governor())


def test_fetch_corporate_actions_rejects_a_ticker_event_with_a_malformed_date() -> None:
    event = _load("action_ticker_change.json") | {"date": None}
    client = _client_with_ticker_events([event])

    with pytest.raises(ProviderContractViolation):
        client.fetch_corporate_actions("AAPL", date(2024, 1, 1), date(2024, 12, 31))


def test_fetch_corporate_actions_rejects_a_ticker_event_without_a_date() -> None:
    event = _load("action_ticker_change.json")
    del event["date"]
    client = _client_with_ticker_events([event])

    with pytest.raises(ProviderContractViolation):
        client.fetch_corporate_actions("AAPL", date(2024, 1, 1), date(2024, 12, 31))


def test_fetch_corporate_actions_includes_ticker_events_on_both_date_boundaries() -> None:
    event = _load("action_ticker_change.json")
    client = _client_with_ticker_events(
        [
            event | {"date": "2024-01-01T00:00:00Z"},
            event | {"date": "2024-12-31T00:00:00Z"},
        ]
    )

    actions = client.fetch_corporate_actions("AAPL", date(2024, 1, 1), date(2024, 12, 31))

    assert [action.effective_on for action in actions] == [date(2024, 1, 1), date(2024, 12, 31)]
