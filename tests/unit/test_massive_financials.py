"""`FinancialStatement` tests (CAP-001-E3-S2). See `models.py` for the model.

Component design: `component-design-massive-client.md` section 7 (`Financials
keep filing date as an attribute`); `component-design-market-data-store.md`
section 2.3 (`fundamental_observation`).
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
from factorflow.ingestion.massive.models import FinancialStatement
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


def _envelope(results: list[dict]) -> dict:
    return {"request_id": "req_ok_001", "results": results}


def _wire_statement(fixture_name: str) -> dict:
    """The fixture minus `statement_type`, which the real wire never
    carries -- this component supplies it from which endpoint was
    called."""
    wire = _load(fixture_name)
    wire.pop("statement_type", None)
    return wire


def test_parses_wire_shape_into_product_vocabulary() -> None:
    """TC-COMP-206: public attributes use the observation-table vocabulary
    (`fiscal_period_end`, `provider_filing_date`), never the provider's own
    field names (`period_end`, `filing_date`)."""
    statement = FinancialStatement.model_validate(_load("financial_annual.json"))

    assert statement.fiscal_period_end == date(2023, 9, 30)
    assert statement.provider_filing_date == date(2023, 11, 3)
    assert statement.cik == "0000320193"
    assert statement.fiscal_year == 2023
    assert statement.timeframe == "annual"
    assert statement.statement_type == "balance_sheet"

    for wire_name in ("period_end", "filing_date"):
        assert not hasattr(statement, wire_name)


def test_filing_date_is_preserved_as_a_descriptive_attribute_only() -> None:
    """TC-COMP-005 / AC-5: the provider's filing date survives as
    `provider_filing_date`. It conflates restatements of the same period
    (C5), so this model exposes no other attribute that could be mistaken
    for an as-of date -- `observed_on` is the writer's alone."""
    statement = FinancialStatement.model_validate(_load("financial_annual.json"))

    assert statement.provider_filing_date == date(2023, 11, 3)
    assert not hasattr(statement, "observed_on")
    assert not hasattr(statement, "recorded_at")


def test_monetary_values_are_decimal_not_float() -> None:
    """TC-COMP-217: monetary and ratio values are held as `Decimal`, so no
    binary rounding enters recorded history (DAC-E3-S2-3)."""
    statement = FinancialStatement.model_validate(_load("financial_annual.json"))

    assert statement.model_extra is not None
    assert statement.model_extra["total_assets"] == Decimal("352755000000")
    assert isinstance(statement.model_extra["total_assets"], Decimal)

    ratios = FinancialStatement.model_validate(_load("financial_quarterly.json"))
    assert ratios.model_extra["current_ratio"] == Decimal("0.988")
    assert isinstance(ratios.model_extra["current_ratio"], Decimal)


def test_no_declared_field_is_typed_float() -> None:
    """DAC-E3-S2-3: no declared monetary or ratio field is typed `float`."""
    for name, info in FinancialStatement.model_fields.items():
        assert info.annotation is not float, name


def test_fiscal_quarter_is_optional_for_annual_statements() -> None:
    """DAC-E3-S2-5: an annual statement carries no `fiscal_quarter` -- its
    absence is `None`, not a substituted value; a quarterly statement
    carries the quarter it was filed for."""
    annual = FinancialStatement.model_validate(_load("financial_annual.json"))
    quarterly = FinancialStatement.model_validate(_load("financial_quarterly.json"))

    assert annual.fiscal_quarter is None
    assert quarterly.fiscal_quarter == 1


@pytest.mark.parametrize(
    "missing_field",
    ["cik", "tickers", "period_end", "filing_date", "fiscal_year", "timeframe", "statement_type"],
)
def test_missing_required_field_fails_validation(missing_field: str) -> None:
    """TC-COMP-218: a response missing a field the model requires fails
    Pydantic validation rather than producing a partial record
    (DAC-E3-S2-4). Every field named in the component design's "Each
    result carries..." sentence is required, and `statement_type` is
    required because `fundamental_observation.statement_type` is
    `NOT NULL` and part of its natural key."""
    wire = _load("financial_annual.json")
    del wire[missing_field]

    with pytest.raises(ValidationError):
        FinancialStatement.model_validate(wire)


def test_only_the_four_known_statement_types_are_accepted() -> None:
    """CAP-001-E3-S2-implementation-review-v2 IR-002:
    `fundamental_statement_known` in the DDL constrains `statement_type`
    to `balance_sheet`, `income_statement`, `cash_flow_statement` and
    `ratios`; an unrecognised value fails validation here rather than as
    a database `CHECK` violation inside the writer's per-instrument
    transaction."""
    wire = _load("financial_annual.json")

    with pytest.raises(ValidationError):
        FinancialStatement.model_validate({**wire, "statement_type": "not_a_statement_type"})


def test_only_annual_or_quarterly_timeframe_is_accepted() -> None:
    """CAP-001-E3-S2-implementation-review-v2 IR-002:
    `component-design-massive-client.md` section 2.5 names `annual` and
    `quarterly` as `timeframe`'s only two values."""
    wire = _load("financial_annual.json")

    with pytest.raises(ValidationError):
        FinancialStatement.model_validate({**wire, "timeframe": "weekly"})


def test_nested_extra_numeric_values_are_coerced_to_decimal() -> None:
    """CAP-001-E3-S2-implementation-review-v2 IR-003: the extra-field
    Decimal coercion recurses into nested dicts and lists, not only the
    top level -- a nested provider numeric must not reach the JSONB
    payload or the append-only value hash as a `float`."""
    wire = _load("financial_annual.json")
    statement = FinancialStatement.model_validate(
        {**wire, "breakdown": {"assets": {"current": 0.1, "values": [1.5, 2.5]}}}
    )

    breakdown = statement.model_extra["breakdown"]
    assert isinstance(breakdown["assets"]["current"], Decimal)
    assert breakdown["assets"]["current"] == Decimal("0.1")
    assert all(isinstance(v, Decimal) for v in breakdown["assets"]["values"])

    payload = statement.value_payload()
    json.dumps(payload)  # must not raise
    assert payload["breakdown"]["assets"]["current"] == "0.1"


def test_value_payload_uses_decimal_strings_and_owns_no_writer_metadata() -> None:
    """Payload-contract test: `Decimal` values -- including the arbitrary
    statement line items retained for JSONB storage -- serialize as
    strings, and the payload carries none of the writer-owned fields."""
    statement = FinancialStatement.model_validate(_load("financial_annual.json"))
    payload = statement.value_payload()

    json.dumps(payload)  # must not raise
    assert payload["total_assets"] == "352755000000"
    assert payload["provider_filing_date"] == "2023-11-03"
    for writer_owned in ("observed_on", "run_id", "recorded_at"):
        assert writer_owned not in payload


# --- MassiveClient.fetch_financials (CAP-001-E3-S1) ----------------------


def test_fetch_financials_returns_a_complete_result_for_a_covered_symbol() -> None:
    """TC-COMP-003: `fetch_financials` returns the complete parsed result
    across the four sibling statement endpoints for a covered symbol
    (AC-3)."""
    with patch("factorflow.ingestion.massive.client.RESTClient") as rest_client_cls:
        instance = rest_client_cls.return_value
        instance.list_financials_balance_sheets.return_value = _FakeResponse(
            _envelope([_wire_statement("financial_annual.json")])
        )
        instance.list_financials_income_statements.return_value = _FakeResponse(_envelope([]))
        instance.list_financials_cash_flow_statements.return_value = _FakeResponse(_envelope([]))
        instance.list_financials_ratios.return_value = _FakeResponse(_envelope([]))
        client = MassiveClient(settings=_settings(), governor=_governor())

        statements = client.fetch_financials("AAPL", date(2023, 1, 1), date(2023, 12, 31))

    assert len(statements) == 1
    assert isinstance(statements[0], FinancialStatement)
    assert statements[0].statement_type == "balance_sheet"
    assert statements[0].cik == "0000320193"


def test_fetch_financials_labels_ratios_rows_with_the_ddl_statement_type() -> None:
    """A ratios row must parse: the client's label for the ratios endpoint has
    to be a `fundamental_statement_known` value (`ratios`, plural). Every other
    test mocks ratios as empty, so a wrong label never reached validation."""
    with patch("factorflow.ingestion.massive.client.RESTClient") as rest_client_cls:
        instance = rest_client_cls.return_value
        for method in (
            instance.list_financials_balance_sheets,
            instance.list_financials_income_statements,
            instance.list_financials_cash_flow_statements,
        ):
            method.return_value = _FakeResponse(_envelope([]))
        instance.list_financials_ratios.return_value = _FakeResponse(
            _envelope([_wire_statement("financial_quarterly.json")])
        )
        client = MassiveClient(settings=_settings(), governor=_governor())

        statements = client.fetch_financials("AAPL", date(2023, 1, 1), date(2023, 12, 31))

    assert [s.statement_type for s in statements] == ["ratios"]


def test_fetch_financials_queries_all_four_statement_endpoints_for_the_symbol() -> None:
    """Component design section 2.5: financials are four sibling
    endpoints under one shape, each constrained by ticker and period so
    the request does not return the whole corpus."""
    with patch("factorflow.ingestion.massive.client.RESTClient") as rest_client_cls:
        instance = rest_client_cls.return_value
        for method in (
            instance.list_financials_balance_sheets,
            instance.list_financials_income_statements,
            instance.list_financials_cash_flow_statements,
            instance.list_financials_ratios,
        ):
            method.return_value = _FakeResponse(_envelope([]))
        client = MassiveClient(settings=_settings(), governor=_governor())

        client.fetch_financials("AAPL", date(2023, 1, 1), date(2023, 12, 31))

    for method in (
        instance.list_financials_balance_sheets,
        instance.list_financials_income_statements,
        instance.list_financials_cash_flow_statements,
        instance.list_financials_ratios,
    ):
        method.assert_called_once()
        _, kwargs = method.call_args
        assert kwargs["tickers"] == "AAPL"
        assert kwargs["raw"] is True
