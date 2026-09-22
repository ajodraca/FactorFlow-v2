"""Unit tests for the writer-local typed input/result contracts (CAP-001-E4-S3).

These tests verify the ParsedObservations grouping and WriteResult structure
without touching the database or importing the runner.

Implements TC-COMP-007 (contract portion).
"""

from datetime import date

import pytest

# These imports will fail (RED) until src/factorflow/ingestion/writer.py exists.
from factorflow.ingestion.massive.models import (
    CorporateAction,
    DailyBar,
    FinancialStatement,
    TickerReference,
)
from factorflow.ingestion.writer import ParsedObservations, WriteResult


def _make_ticker_reference() -> TickerReference:
    return TickerReference.model_validate(
        {
            "cik": "0001234567",
            "composite_figi": "BBG000ABC123",
            "share_class_figi": "BBG001ABC123",
            "active": True,
            "name": "Test Corp",
        }
    )


def _make_daily_bar(session_ms: int = 1_672_531_200_000) -> DailyBar:
    return DailyBar.model_validate(
        {
            "t": session_ms,
            "o": "100.00",
            "h": "105.00",
            "l": "99.00",
            "c": "102.50",
            "v": "1000000",
            "vw": "101.75",
            "n": 5000,
        }
    )


def _make_financial_statement(
    timeframe: str = "annual", fiscal_quarter: int | None = None
) -> FinancialStatement:
    data: dict = {
        "cik": "0001234567",
        "tickers": ["TST"],
        "period_end": "2025-12-31",
        "filing_date": "2026-02-15",
        "fiscal_year": 2025,
        "timeframe": timeframe,
        "statement_type": "income_statement",
        "total_revenue": "5000000000",
    }
    if fiscal_quarter is not None:
        data["fiscal_quarter"] = fiscal_quarter
    return FinancialStatement.model_validate(data)


def _make_corporate_action() -> CorporateAction:
    return CorporateAction.model_validate(
        {
            "action_type": "split",
            "effective_on": "2026-01-15",
            "split_from": "1",
            "split_to": "4",
        }
    )


def test_parsed_observations_groups_four_data_types() -> None:
    obs = ParsedObservations(
        reference=[_make_ticker_reference()],
        prices=[_make_daily_bar()],
        fundamentals=[_make_financial_statement()],
        corporate_actions=[_make_corporate_action()],
        reference_range=(date(2026, 1, 1), date(2026, 6, 30)),
        prices_range=(date(2026, 1, 1), date(2026, 6, 30)),
        fundamentals_range=(date(2020, 1, 1), date(2025, 12, 31)),
        corporate_actions_range=(date(2015, 1, 1), date(2026, 6, 30)),
    )
    assert len(obs.reference) == 1
    assert len(obs.prices) == 1
    assert len(obs.fundamentals) == 1
    assert len(obs.corporate_actions) == 1


def test_parsed_observations_preserves_per_data_type_ranges_independently() -> None:
    ref_range = (date(2026, 1, 1), date(2026, 6, 30))
    prices_range = (date(2025, 1, 1), date(2026, 6, 30))
    fundamentals_range = (date(2020, 1, 1), date(2025, 12, 31))
    ca_range = (date(2015, 1, 1), date(2026, 6, 30))

    obs = ParsedObservations(
        reference=[_make_ticker_reference()],
        prices=[_make_daily_bar()],
        fundamentals=[_make_financial_statement()],
        corporate_actions=[_make_corporate_action()],
        reference_range=ref_range,
        prices_range=prices_range,
        fundamentals_range=fundamentals_range,
        corporate_actions_range=ca_range,
    )

    assert obs.reference_range == ref_range
    assert obs.prices_range == prices_range
    assert obs.fundamentals_range == fundamentals_range
    assert obs.corporate_actions_range == ca_range


def test_parsed_observations_allows_empty_collections() -> None:
    """A data type with no rows is valid -- the write proceeds for other types."""
    obs = ParsedObservations(
        reference=[],
        prices=[],
        fundamentals=[],
        corporate_actions=[],
        reference_range=(date(2026, 1, 1), date(2026, 6, 30)),
        prices_range=(date(2026, 1, 1), date(2026, 6, 30)),
        fundamentals_range=(date(2020, 1, 1), date(2025, 12, 31)),
        corporate_actions_range=(date(2015, 1, 1), date(2026, 6, 30)),
    )
    assert obs.reference == []
    assert obs.prices == []


def test_write_result_exposes_per_type_appended_unchanged_covered_range() -> None:
    result = WriteResult(
        reference_appended=1,
        reference_unchanged=0,
        reference_covered_range=(date(2026, 1, 1), date(2026, 6, 30)),
        prices_appended=365,
        prices_unchanged=0,
        prices_covered_range=(date(2025, 1, 1), date(2026, 6, 30)),
        fundamentals_appended=4,
        fundamentals_unchanged=0,
        fundamentals_covered_range=(date(2020, 1, 1), date(2025, 12, 31)),
        corporate_actions_appended=2,
        corporate_actions_unchanged=0,
        corporate_actions_covered_range=(date(2015, 1, 1), date(2026, 6, 30)),
    )

    assert result.reference_appended == 1
    assert result.reference_unchanged == 0
    assert result.reference_covered_range == (date(2026, 1, 1), date(2026, 6, 30))
    assert result.prices_appended == 365
    assert result.prices_covered_range == (date(2025, 1, 1), date(2026, 6, 30))
    assert result.fundamentals_appended == 4
    assert result.fundamentals_covered_range == (date(2020, 1, 1), date(2025, 12, 31))
    assert result.corporate_actions_appended == 2
    assert result.corporate_actions_covered_range == (date(2015, 1, 1), date(2026, 6, 30))


def test_write_result_is_immutable() -> None:
    result = WriteResult(
        reference_appended=1,
        reference_unchanged=0,
        reference_covered_range=(date(2026, 1, 1), date(2026, 6, 30)),
        prices_appended=10,
        prices_unchanged=5,
        prices_covered_range=(date(2025, 1, 1), date(2026, 6, 30)),
        fundamentals_appended=0,
        fundamentals_unchanged=4,
        fundamentals_covered_range=(date(2020, 1, 1), date(2025, 12, 31)),
        corporate_actions_appended=0,
        corporate_actions_unchanged=2,
        corporate_actions_covered_range=(date(2015, 1, 1), date(2026, 6, 30)),
    )

    with pytest.raises((AttributeError, TypeError)):
        result.reference_appended = 999  # type: ignore[misc]


def test_observation_batch_groups_data_types() -> None:
    """ParsedObservations groups the four provider-model types."""
    # Just verifying ParsedObservations accepts the correct model types.
    obs = ParsedObservations(
        reference=[_make_ticker_reference()],
        prices=[_make_daily_bar(), _make_daily_bar(1_675_209_600_000)],
        fundamentals=[_make_financial_statement(), _make_financial_statement("quarterly", 1)],
        corporate_actions=[_make_corporate_action()],
        reference_range=(date(2026, 1, 1), date(2026, 6, 30)),
        prices_range=(date(2026, 1, 1), date(2026, 6, 30)),
        fundamentals_range=(date(2020, 1, 1), date(2025, 12, 31)),
        corporate_actions_range=(date(2015, 1, 1), date(2026, 6, 30)),
    )
    assert isinstance(obs.reference[0], TickerReference)
    assert isinstance(obs.prices[0], DailyBar)
    assert isinstance(obs.fundamentals[0], FinancialStatement)
    assert isinstance(obs.corporate_actions[0], CorporateAction)


def test_parsed_observations_does_not_import_runner_module() -> None:
    """writer.py must not import runner.py (writer-local boundary requirement)."""
    import re

    import factorflow.ingestion.writer as writer_module

    writer_source = __import__("inspect").getsource(writer_module)
    # Check that there is no actual import statement for the runner module.
    # References in comments and docstrings are allowed.
    import_runner = re.compile(r"^\s*(from\s+factorflow.*runner|import\s+.*runner)", re.MULTILINE)
    assert import_runner.search(writer_source) is None, (
        "writer.py must not import the runner module"
    )
