"""`TickerReference` tests (CAP-001-E3-S2). See `models.py` for the model.

Component design: `component-design-massive-client.md` section 7 (`Reference
parse`); `component-design-market-data-store.md` section 2.3
(`instrument_reference`).
"""

import json
from datetime import date, datetime
from pathlib import Path

import pytest
from pydantic import ValidationError

from factorflow.ingestion.massive.models import TickerReference

FIXTURES = Path(__file__).resolve().parents[1] / "fixtures" / "massive"


def _load(name: str) -> dict:
    return json.loads((FIXTURES / name).read_text())


def test_parses_wire_shape_into_product_vocabulary() -> None:
    """TC-COMP-206: public attributes use the observation-table vocabulary,
    never the provider's own field names (`name`, `active`, `type`)."""
    reference = TickerReference.model_validate(_load("reference_active.json"))

    assert reference.company_name == "Apple Inc."
    assert reference.is_active is True
    assert reference.cik == "0000320193"
    assert reference.composite_figi == "BBG000B9XRY4"
    assert reference.share_class_figi == "BBG001S5N8V8"
    assert reference.list_date == date(1980, 12, 12)
    assert reference.security_type == "CS"
    assert reference.currency_name == "usd"

    # The provider's own field names never survive as public attributes.
    for wire_name in ("name", "active", "type"):
        assert not hasattr(reference, wire_name)


def test_delisted_instrument_carries_its_delisted_timestamp() -> None:
    """A delisted instrument's `list_date` and `delisted_utc` survive, and
    `delisted_utc` is timezone-aware (component design section 7)."""
    reference = TickerReference.model_validate(_load("reference_delisted.json"))

    assert reference.is_active is False
    assert reference.list_date == date(1994, 5, 27)
    assert reference.delisted_utc == datetime(2008, 9, 19, tzinfo=reference.delisted_utc.tzinfo)
    assert reference.delisted_utc.utcoffset().total_seconds() == 0


def test_active_instrument_has_no_delisted_timestamp() -> None:
    """DAC-E3-S2-5: an absent optional field records its absence -- `None`
    -- rather than some substitute value."""
    reference = TickerReference.model_validate(_load("reference_active.json"))

    assert reference.delisted_utc is None


@pytest.mark.parametrize(
    "missing_field", ["cik", "composite_figi", "share_class_figi", "active", "name"]
)
def test_missing_required_field_fails_validation(missing_field: str) -> None:
    """DAC-E3-S2-4: a response missing a field the model requires fails
    Pydantic validation rather than producing a partial record. `cik`,
    `composite_figi` and `share_class_figi` are required because AC-3 rests
    instrument identity on them; `active` and `name` are required because a
    parsed reference with no name or activity state is not a usable record."""
    wire = _load("reference_active.json")
    del wire[missing_field]

    with pytest.raises(ValidationError):
        TickerReference.model_validate(wire)


def test_value_payload_is_json_safe_and_owns_no_writer_metadata() -> None:
    """Payload-contract test: serialization is JSON-round-trippable and
    carries none of the writer-owned fields (`observed_on`, `run_id`,
    `recorded_at`)."""
    reference = TickerReference.model_validate(_load("reference_active.json"))
    payload = reference.value_payload()

    json.dumps(payload)  # must not raise
    for writer_owned in ("observed_on", "run_id", "recorded_at"):
        assert writer_owned not in payload


def test_no_field_is_typed_float() -> None:
    """No model field is typed `float`, even though this model carries no
    monetary value today -- the rule is a model-wide invariant, not one
    checked only where a price happens to exist."""
    for info in TickerReference.model_fields.values():
        assert info.annotation is not float
