"""`TickerReference` tests (CAP-001-E3-S2). See `models.py` for the model.

Component design: `component-design-massive-client.md` section 7 (`Reference
parse`); `component-design-market-data-store.md` section 2.3
(`instrument_reference`).
"""

import json
from datetime import date, datetime
from pathlib import Path
from unittest.mock import patch

import pytest
from pydantic import ValidationError

from factorflow.config.settings import MassiveSettings
from factorflow.ingestion.massive.client import MassiveClient
from factorflow.ingestion.massive.errors import InstrumentNotFound, ProviderContractViolation
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


# --- MassiveClient.fetch_reference (CAP-001-E3-S1) -----------------------


class _FakeResponse:
    """A minimal stand-in for `urllib3.HTTPResponse`, carrying only what
    `MassiveClient` reads off a raw SDK response: `status` and `data`."""

    def __init__(self, payload: dict, status: int = 200) -> None:
        self.status = status
        self.data = json.dumps(payload).encode()


def _envelope(results: dict, request_id: str = "req_ok_001") -> dict:
    return {"request_id": request_id, "results": results}


def test_fetch_reference_returns_product_shaped_reference() -> None:
    """TC-COMP-003 / TC-COMP-204: `fetch_reference` returns a
    `TickerReference` retaining CIK, composite FIGI and share class FIGI
    for a covered symbol (AC-3, DAC-E3-10)."""
    with patch("factorflow.ingestion.massive.client.RESTClient") as rest_client_cls:
        instance = rest_client_cls.return_value
        instance.get_ticker_details.return_value = _FakeResponse(
            _envelope(_load("reference_active.json"))
        )
        client = MassiveClient(settings=_settings(), governor=_governor())

        reference = client.fetch_reference("AAPL")

    assert isinstance(reference, TickerReference)
    assert reference.cik == "0000320193"
    assert reference.composite_figi == "BBG000B9XRY4"
    assert reference.share_class_figi == "BBG001S5N8V8"


def test_fetch_reference_raises_provider_contract_violation_when_results_is_missing() -> None:
    """A `200` envelope missing `results` entirely -- as distinct from the
    typed-error envelopes `errors.py` classifies -- fails model validation
    and must surface as `ProviderContractViolation` (component design
    section 2.4), not an unhandled `KeyError`."""
    with patch("factorflow.ingestion.massive.client.RESTClient") as rest_client_cls:
        instance = rest_client_cls.return_value
        instance.get_ticker_details.return_value = _FakeResponse(
            {"request_id": "req_ok_001"}  # no "results" key
        )
        client = MassiveClient(settings=_settings(), governor=_governor())

        with pytest.raises(ProviderContractViolation):
            client.fetch_reference("AAPL")


def test_fetch_reference_raises_instrument_not_found_when_results_is_empty() -> None:
    """A present but empty `results` object is the design's 200 unknown-
    instrument branch, not a malformed response (component design section
    2.2)."""
    with patch("factorflow.ingestion.massive.client.RESTClient") as rest_client_cls:
        instance = rest_client_cls.return_value
        instance.get_ticker_details.return_value = _FakeResponse(_envelope({}))
        client = MassiveClient(settings=_settings(), governor=_governor())

        with pytest.raises(InstrumentNotFound):
            client.fetch_reference("NOTREAL")


def test_fetch_reference_uses_the_single_ticker_endpoint_only() -> None:
    """TC-COMP-212 / DAC-E3-S1-4: reference reads use the single-ticker
    endpoint (`get_ticker_details`); the list-form endpoint
    (`list_tickers`) is never called."""
    with patch("factorflow.ingestion.massive.client.RESTClient") as rest_client_cls:
        instance = rest_client_cls.return_value
        instance.get_ticker_details.return_value = _FakeResponse(
            _envelope(_load("reference_active.json"))
        )
        client = MassiveClient(settings=_settings(), governor=_governor())

        client.fetch_reference("AAPL")

    instance.get_ticker_details.assert_called_once()
    call_args = instance.get_ticker_details.call_args
    assert call_args.args[0] == "AAPL" or call_args.kwargs.get("ticker") == "AAPL"
    assert call_args.kwargs.get("raw") is True
    assert not instance.list_tickers.called


def test_fetch_reference_delisted_instrument_carries_active_and_delisted_fields() -> None:
    """TC-COMP-205 / DAC-E3-11: a delisted instrument remains acquirable
    and its `is_active` and `delisted_utc` survive through the client."""
    with patch("factorflow.ingestion.massive.client.RESTClient") as rest_client_cls:
        instance = rest_client_cls.return_value
        instance.get_ticker_details.return_value = _FakeResponse(
            _envelope(_load("reference_delisted.json"))
        )
        client = MassiveClient(settings=_settings(), governor=_governor())

        reference = client.fetch_reference("LEHMQ")

    assert reference.is_active is False
    assert reference.delisted_utc is not None


def test_fetch_reference_raises_instrument_not_found_for_unknown_symbol() -> None:
    """AC-3's covered-instrument guarantee has a counterpart: an unknown
    symbol raises the typed `InstrumentNotFound`, not a raw SDK
    exception."""
    from massive.exceptions import BadResponse

    with patch("factorflow.ingestion.massive.client.RESTClient") as rest_client_cls:
        instance = rest_client_cls.return_value
        instance.get_ticker_details.side_effect = BadResponse(
            (FIXTURES / "error_not_found.json").read_text()
        )
        client = MassiveClient(settings=_settings(), governor=_governor())

        with pytest.raises(InstrumentNotFound):
            client.fetch_reference("NOTREAL")
