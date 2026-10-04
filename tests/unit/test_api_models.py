"""`HealthResponse` round-trips through JSON with real booleans (task plan T015).

CAP-001-E2-S3 adds request-model validation tests (task plan T015, T018, T019).
"""

import json
from datetime import UTC, datetime
from typing import Literal, get_args, get_type_hints
from uuid import UUID

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
    RunState,
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


# CAP-001-E7-S3 task plan T007. `MostRecentRun` is imported per test so the
# RED for this story's model does not break collection of the tests above.

_RUN_ID = UUID("6f1c2a52-9a9e-4a8b-8d2e-2b9f3f0b7c11")
_ENDED_AT = datetime(2026, 9, 5, 22, 14, 3, tzinfo=UTC)


def test_most_recent_run_has_exactly_three_fields() -> None:
    from factorflow.api.models import MostRecentRun

    assert set(MostRecentRun.model_fields) == {"run_id", "state", "ended_at"}


@pytest.mark.parametrize("state", get_args(RunState))
def test_most_recent_run_accepts_every_run_state(state: str) -> None:
    from factorflow.api.models import MostRecentRun

    assert MostRecentRun(run_id=_RUN_ID, state=state, ended_at=None).state == state


def test_most_recent_run_rejects_an_unknown_state() -> None:
    from factorflow.api.models import MostRecentRun

    with pytest.raises(ValidationError):
        MostRecentRun(run_id=_RUN_ID, state="bogus", ended_at=None)


def test_most_recent_run_serializes_absent_end_as_json_null() -> None:
    from factorflow.api.models import MostRecentRun

    payload = json.loads(
        MostRecentRun(run_id=_RUN_ID, state="running", ended_at=None).model_dump_json()
    )

    assert "ended_at" in payload
    assert payload["ended_at"] is None


def test_health_response_round_trips_a_most_recent_run() -> None:
    from factorflow.api.models import MostRecentRun

    model = HealthResponse(
        status="ok",
        database="reachable",
        credential_present=False,
        schema_version=4,
        most_recent_run=MostRecentRun(run_id=_RUN_ID, state="failed", ended_at=_ENDED_AT),
    )

    payload = json.loads(model.model_dump_json())

    assert set(payload["most_recent_run"]) == {"run_id", "state", "ended_at"}
    assert payload["most_recent_run"]["run_id"] == str(_RUN_ID)
    assert payload["most_recent_run"]["state"] == "failed"
    assert datetime.fromisoformat(payload["most_recent_run"]["ended_at"]) == _ENDED_AT
    assert HealthResponse.model_validate_json(model.model_dump_json()) == model


def test_health_response_still_serializes_a_null_most_recent_run() -> None:
    """DAC-E1-S6-3 holds after the widening."""
    model = HealthResponse(
        status="ok", database="reachable", credential_present=True, schema_version=4
    )

    payload = json.loads(model.model_dump_json())

    assert "most_recent_run" in payload
    assert payload["most_recent_run"] is None
