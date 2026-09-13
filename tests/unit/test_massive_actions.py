"""`CorporateAction` tests (CAP-001-E3-S2). See `models.py` for the model.

Component design: `component-design-massive-client.md` section 7 (`Corporate
actions parse`); `component-design-market-data-store.md` section 2.3
(`corporate_action`).
"""

import json
from datetime import date
from decimal import Decimal
from pathlib import Path

import pytest
from pydantic import ValidationError

from factorflow.ingestion.massive.models import CorporateAction

FIXTURES = Path(__file__).resolve().parents[1] / "fixtures" / "massive"


def _load(name: str) -> dict:
    return json.loads((FIXTURES / name).read_text())


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
