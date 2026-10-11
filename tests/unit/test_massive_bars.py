"""`DailyBar` tests (CAP-001-E3-S2). See `models.py` for the model.

Component design: `component-design-massive-client.md` section 7 (`Daily
bars parse and page`); `component-design-market-data-store.md` section 2.3
(`daily_bar`).
"""

import json
import time as time_module
from datetime import date, datetime
from decimal import Decimal
from pathlib import Path
from unittest.mock import patch

import pytest
from pydantic import ValidationError

from factorflow.config.settings import MassiveSettings
from factorflow.ingestion.massive.client import MassiveClient
from factorflow.ingestion.massive.errors import ProviderUnavailable
from factorflow.ingestion.massive.models import DailyBar
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
    """A minimal stand-in for `urllib3.HTTPResponse`: only `status` and
    `data`, which is all `MassiveClient` reads off a raw SDK response."""

    def __init__(self, payload: dict, status: int = 200) -> None:
        self.status = status
        self.data = json.dumps(payload).encode()


def _bar_envelope(bars: list[dict], next_url: str | None = None) -> dict:
    body: dict = {"request_id": "req_ok_001", "results": bars}
    if next_url is not None:
        body["next_url"] = next_url
    return body


def test_parses_wire_shape_into_product_vocabulary() -> None:
    """TC-COMP-206: public attributes are the observation-table vocabulary,
    never the provider's one-letter wire keys."""
    bar = DailyBar.model_validate(_load("bar_regular.json"))

    for wire_name in ("t", "o", "h", "l", "c", "v", "vw", "n"):
        assert not hasattr(bar, wire_name)


def test_aliases_map_every_wire_field_to_a_named_attribute() -> None:
    """TC-COMP-215: `t`, `o`, `h`, `l`, `c`, `v`, `vw` and `n` map to named
    attributes for timestamp, open, high, low, close, volume,
    volume-weighted average price and transaction count
    (DAC-E3-S2-1)."""
    bar = DailyBar.model_validate(_load("bar_regular.json"))

    assert bar.session_date == date(2024, 1, 2)
    assert bar.open_price == Decimal("187.15")
    assert bar.high_price == Decimal("188.44")
    assert bar.low_price == Decimal("183.885")
    assert bar.close_price == Decimal("185.64")
    assert bar.volume == Decimal("82488677")
    assert bar.vwap == Decimal("186.1234")
    assert bar.transaction_count == 811734


def test_unix_millis_convert_to_session_date_via_timezone_aware_utc(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """TC-COMP-216 / DAC-E3-S2-2: the non-UTC pin is self-verifying, so
    missing timezone data fails loudly instead of making this regression
    test vacuous (CAP-001-E3-S2-implementation-review-v3 IR-001)."""
    try:
        with monkeypatch.context() as timezone:
            timezone.setenv("TZ", "America/Los_Angeles")
            time_module.tzset()

            # Prove the named zone resolved: a silent UTC fallback would yield January 2.
            assert datetime.fromtimestamp(1704153600).date() == date(2024, 1, 1)

            bar = DailyBar.model_validate({**_load("bar_regular.json"), "t": 1704153600000})
            assert bar.session_date == date(2024, 1, 2)

            # One millisecond before midnight UTC must still land on the prior day.
            bar_before_midnight = DailyBar.model_validate(
                {**_load("bar_regular.json"), "t": 1704153599999}
            )
            assert bar_before_midnight.session_date == date(2024, 1, 1)
    finally:
        time_module.tzset()


def test_earliest_massive_advanced_bar_is_within_millis_bound() -> None:
    """DAC-E3-S2-2 / T008: Massive Advanced's September 2003 history floor
    remains inside the Unix-milliseconds plausibility bound (review-v3 IR-002)."""
    earliest_advanced_millis = 1_062_374_400_000  # 2003-09-01T00:00:00Z

    bar = DailyBar.model_validate({**_load("bar_regular.json"), "t": earliest_advanced_millis})

    assert bar.session_date == date(2003, 9, 1)


def test_non_numeric_t_is_rejected_rather_than_coerced() -> None:
    """CAP-001-E3-S2-implementation-review-v2 IR-004: a non-numeric `t`
    must not fall through to Pydantic's ordinary `date` coercion -- a
    provider/SDK change to an ISO-string timestamp is provider drift, not
    a value this component may silently accept."""
    with pytest.raises(ValidationError):
        DailyBar.model_validate({**_load("bar_regular.json"), "t": "2024-01-02"})


def test_t_expressed_in_seconds_instead_of_milliseconds_is_rejected() -> None:
    """CAP-001-E3-S2-implementation-review-v2 IR-004: `t` one order of
    magnitude off (Unix seconds, the most likely SDK/provider drift) must
    fail loudly rather than parse to a session date roughly 54 years
    early."""
    with pytest.raises(ValidationError):
        DailyBar.model_validate({**_load("bar_regular.json"), "t": 1704153600})


def test_otc_flag_is_optional_and_absence_is_not_false() -> None:
    """DAC-E3-S2-5: an absent optional field records its absence -- `None`
    -- distinct from an explicit `False`."""
    regular = DailyBar.model_validate(_load("bar_regular.json"))
    otc = DailyBar.model_validate(_load("bar_otc.json"))

    assert regular.is_otc is None
    assert otc.is_otc is True


@pytest.mark.parametrize("missing_field", ["t", "o", "h", "l", "c", "v", "vw", "n"])
def test_missing_required_field_fails_validation(missing_field: str) -> None:
    """DAC-E3-S2-4: every field DAC-E3-S2-1 names is required -- none of
    them is documented as optional (component design section 2.5), so a
    response missing one fails validation rather than passing a partial
    bar on."""
    wire = _load("bar_regular.json")
    del wire[missing_field]

    with pytest.raises(ValidationError):
        DailyBar.model_validate(wire)


def test_no_field_is_typed_float() -> None:
    """DAC-E3-S2-3: no monetary or ratio field is typed `float`."""
    for name, info in DailyBar.model_fields.items():
        assert info.annotation is not float, name


def test_value_payload_uses_decimal_strings_and_owns_no_writer_metadata() -> None:
    """Payload-contract test: `Decimal` values serialize as strings, and the
    payload carries none of the writer-owned fields."""
    bar = DailyBar.model_validate(_load("bar_regular.json"))
    payload = bar.value_payload()

    json.dumps(payload)  # must not raise
    assert payload["open_price"] == "187.15"
    assert payload["volume"] == "82488677"
    for writer_owned in ("observed_on", "run_id", "recorded_at"):
        assert writer_owned not in payload


# --- MassiveClient.fetch_daily_bars (CAP-001-E3-S1) ----------------------


# Implements TC-INT-022
def test_fetch_daily_bars_requests_multiplier_1_day_timespan_and_inclusive_dates() -> None:
    """TC-COMP-003 / TC-COMP-210 / DAC-E3-S1-2: the daily aggregate request
    uses multiplier `1`, timespan `day`, and inclusive `YYYY-MM-DD` range
    values."""
    with patch("factorflow.ingestion.massive.client.RESTClient") as rest_client_cls:
        instance = rest_client_cls.return_value
        instance.get_aggs.return_value = _FakeResponse(_bar_envelope([_load("bar_regular.json")]))
        client = MassiveClient(settings=_settings(), governor=_governor())

        client.fetch_daily_bars("AAPL", date(2024, 1, 1), date(2024, 1, 31))

    instance.get_aggs.assert_called_once()
    _, kwargs = instance.get_aggs.call_args
    assert kwargs["multiplier"] == 1
    assert kwargs["timespan"] == "day"
    assert kwargs["from_"] == "2024-01-01"
    assert kwargs["to"] == "2024-01-31"
    assert kwargs["raw"] is True


def test_fetch_daily_bars_requests_unadjusted_bars() -> None:
    """Component design section 14, open question 3: `adjusted=False` is
    passed explicitly rather than left to the SDK's server-side default
    (adjusted=true), per the owner's decision in `DEC-0001`. See
    `MassiveClient.fetch_daily_bars`'s docstring for the rationale."""
    with patch("factorflow.ingestion.massive.client.RESTClient") as rest_client_cls:
        instance = rest_client_cls.return_value
        instance.get_aggs.return_value = _FakeResponse(_bar_envelope([_load("bar_regular.json")]))
        client = MassiveClient(settings=_settings(), governor=_governor())

        client.fetch_daily_bars("AAPL", date(2024, 1, 1), date(2024, 1, 31))

    _, kwargs = instance.get_aggs.call_args
    assert kwargs["adjusted"] is False


# Implements TC-INT-022
def test_fetch_daily_bars_returns_all_rows_from_a_two_page_response_in_order() -> None:
    """TC-COMP-003 / TC-COMP-211: two recorded pages return all rows, in
    order, as one complete result (DAC-E3-S1-3, AC-3 acceptance criterion
    11)."""
    page_two_url = (
        "https://api.massive.com/v2/aggs/ticker/AAPL/range/1/day/2024-01-01/2024-01-31?cursor=abc"
    )
    first_bar = _load("bar_regular.json")
    second_bar = {**_load("bar_regular.json"), "t": 1704240000000}  # one day later

    with patch("factorflow.ingestion.massive.client.RESTClient") as rest_client_cls:
        instance = rest_client_cls.return_value
        instance.get_aggs.return_value = _FakeResponse(
            _bar_envelope([first_bar], next_url=page_two_url)
        )
        instance._get.return_value = _FakeResponse(_bar_envelope([second_bar]))
        client = MassiveClient(settings=_settings(), governor=_governor())

        bars = client.fetch_daily_bars("AAPL", date(2024, 1, 1), date(2024, 1, 31))

    assert len(bars) == 2
    assert bars[0].session_date == date(2024, 1, 2)
    assert bars[1].session_date == date(2024, 1, 3)
    instance._get.assert_called_once()
    _, kwargs = instance._get.call_args
    assert kwargs["raw"] is True


def test_fetch_daily_bars_raises_when_a_later_page_fails_rather_than_returning_partial() -> None:
    """T008 / component design section 8, acceptance criterion 12: a
    later page request fails, and the method raises rather than returning
    the earlier page as a complete range."""
    from massive.exceptions import BadResponse

    page_two_url = (
        "https://api.massive.com/v2/aggs/ticker/AAPL/range/1/day/2024-01-01/2024-01-31?cursor=abc"
    )

    with patch("factorflow.ingestion.massive.client.RESTClient") as rest_client_cls:
        instance = rest_client_cls.return_value
        instance.get_aggs.return_value = _FakeResponse(
            _bar_envelope([_load("bar_regular.json")], next_url=page_two_url)
        )
        instance._get.side_effect = BadResponse((FIXTURES / "error_unknown_shape.json").read_text())
        client = MassiveClient(settings=_settings(), governor=_governor())

        with pytest.raises(ProviderUnavailable):
            client.fetch_daily_bars("AAPL", date(2024, 1, 1), date(2024, 1, 31))


def test_fetch_daily_bars_returns_no_bars_for_an_empty_range_rather_than_not_found() -> None:
    """A range with no sessions, before listing or after delisting.
    An empty successful response is a valid no-data result for a
    recognised instrument and returns `[]`: only the reference read means
    an unknown instrument (implementation review v5 IR-002; owner decision
    DEC-0047 in the ai-agents SDD harness; component design section 8
    criterion 4). acquisition-runner records `InstrumentNotFound` as a
    failure of that data type, so raising here would record a false
    failure."""
    with patch("factorflow.ingestion.massive.client.RESTClient") as rest_client_cls:
        instance = rest_client_cls.return_value
        instance.get_aggs.return_value = _FakeResponse(_bar_envelope([]))
        client = MassiveClient(settings=_settings(), governor=_governor())

        bars = client.fetch_daily_bars("AAPL", date(2024, 1, 1), date(2024, 1, 31))

    assert bars == []
