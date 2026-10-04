"""`HealthResponse` round-trips through JSON with real booleans (task plan T015).

CAP-001-E2-S3 adds request-model validation tests (task plan T015, T018, T019).
"""

import json
from datetime import datetime
from typing import Literal, get_type_hints

import pytest
from pydantic import ValidationError

from factorflow.api.bounds import MAX_HISTORY_DEPTH_YEARS, MAX_SYMBOLS_PER_REQUEST
from factorflow.api.models import (
    AddInstrumentsRequest,
    HealthResponse,
    HistoryDepthResponse,
    OutcomeCounts,
    ResultOutcome,
    ResultRow,
    RunCounts,
    SetHistoryDepthRequest,
)


def test_run_detail_models_include_outcome_counts_and_symbols() -> None:
    """T009: new run-detail fields are additive and credential-free."""
    assert list(OutcomeCounts.model_fields) == [
        "written",
        "unchanged",
        "not_found",
        "failed",
        "skipped",
    ]
    assert {name: field.annotation for name, field in OutcomeCounts.model_fields.items()} == {
        "written": int,
        "unchanged": int,
        "not_found": int,
        "failed": int,
        "skipped": int,
    }
    assert all(field.is_required() for field in OutcomeCounts.model_fields.values())
    assert list(RunCounts.model_fields) == [
        "instruments_named",
        "instruments_written",
        "instruments_failed",
        "results_by_outcome",
    ]
    assert RunCounts.model_fields["results_by_outcome"].annotation is OutcomeCounts
    assert RunCounts.model_fields["results_by_outcome"].is_required()
    assert get_type_hints(RunCounts) == {
        "instruments_named": int,
        "instruments_written": int,
        "instruments_failed": int,
        "results_by_outcome": OutcomeCounts,
    }
    assert all(field.is_required() for field in RunCounts.model_fields.values())
    assert list(ResultRow.model_fields) == [
        "instrument_id",
        "data_type",
        "outcome",
        "reason",
        "attempts",
        "completed_at",
        "symbol",
    ]
    assert ResultRow.model_fields["symbol"].annotation is str
    assert get_type_hints(ResultRow) == {
        "instrument_id": int,
        "data_type": Literal["reference", "prices", "fundamentals", "corporate_actions"],
        "outcome": ResultOutcome,
        "reason": str | None,
        "attempts": int,
        "completed_at": datetime,
        "symbol": str,
    }
    assert ResultRow.model_fields["symbol"].is_required()
    assert ResultRow.model_fields["reason"].is_required() is False
    assert all(
        ResultRow.model_fields[name].is_required()
        for name in ("instrument_id", "data_type", "outcome", "attempts", "completed_at")
    )
    assert not any("secret" in field.lower() for field in ResultRow.model_fields)


def test_health_response_serializes_credential_present_as_json_boolean() -> None:
    model = HealthResponse(
        status="ok",
        database="reachable",
        credential_present=True,
        schema_version=3,
        most_recent_run=None,
    )

    payload = json.loads(model.model_dump_json())

    assert payload["credential_present"] is True
    assert isinstance(payload["credential_present"], bool)
    assert payload["most_recent_run"] is None


def test_add_instruments_request_rejects_batch_over_bound() -> None:
    """T015: a `symbols` array longer than `MAX_SYMBOLS_PER_REQUEST` is
    rejected at the model layer."""
    too_many = ["AAPL"] * (MAX_SYMBOLS_PER_REQUEST + 1)

    with pytest.raises(ValidationError):
        AddInstrumentsRequest(symbols=too_many)


def test_add_instruments_request_accepts_batch_at_bound() -> None:
    exactly_the_bound = ["AAPL"] * MAX_SYMBOLS_PER_REQUEST

    request = AddInstrumentsRequest(symbols=exactly_the_bound)

    assert len(request.symbols) == MAX_SYMBOLS_PER_REQUEST


def test_set_history_depth_request_rejects_non_positive_and_over_bound() -> None:
    """T018: `SetHistoryDepthRequest` rejects `0`, negative, and
    above-bound values at the model layer, before `write_history_depth`
    is ever called."""
    with pytest.raises(ValidationError):
        SetHistoryDepthRequest(years=0)
    with pytest.raises(ValidationError):
        SetHistoryDepthRequest(years=-5)
    with pytest.raises(ValidationError):
        SetHistoryDepthRequest(years=MAX_HISTORY_DEPTH_YEARS + 1)


def test_set_history_depth_request_accepts_bounded_value() -> None:
    request = SetHistoryDepthRequest(years=MAX_HISTORY_DEPTH_YEARS)

    assert request.years == MAX_HISTORY_DEPTH_YEARS


def test_history_depth_response_serializes_absent_years_as_json_null() -> None:
    """T019: an absent depth serializes `years` as JSON `null`, not an
    omitted key."""
    model = HistoryDepthResponse(years=None, updated_at=None)

    payload = json.loads(model.model_dump_json())

    assert "years" in payload
    assert payload["years"] is None
