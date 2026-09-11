"""`DailyBar` tests (CAP-001-E3-S2). See `models.py` for the model.

Component design: `component-design-massive-client.md` section 7 (`Daily
bars parse and page`); `component-design-market-data-store.md` section 2.3
(`daily_bar`).
"""

import json
from datetime import UTC, date, datetime
from decimal import Decimal
from pathlib import Path

import pytest
from pydantic import ValidationError

from factorflow.ingestion.massive.models import DailyBar

FIXTURES = Path(__file__).resolve().parents[1] / "fixtures" / "massive"


def _load(name: str) -> dict:
    return json.loads((FIXTURES / name).read_text())


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


def test_unix_millis_convert_to_session_date_via_timezone_aware_utc() -> None:
    """TC-COMP-216: `t` converts from Unix milliseconds using a
    timezone-aware UTC conversion to `daily_bar.session_date`
    (DAC-E3-S2-2). A naive local-time conversion would shift the date near
    midnight depending on the host's timezone; this asserts the UTC
    boundary specifically."""
    bar = DailyBar.model_validate({**_load("bar_regular.json"), "t": 1704153600000})

    assert bar.session_date == datetime.fromtimestamp(0, tz=UTC).date().replace(2024, 1, 2)
    assert bar.session_date == date(2024, 1, 2)

    # One millisecond before midnight UTC must still land on the prior day.
    bar_before_midnight = DailyBar.model_validate({**_load("bar_regular.json"), "t": 1704153599999})
    assert bar_before_midnight.session_date == date(2024, 1, 1)


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
