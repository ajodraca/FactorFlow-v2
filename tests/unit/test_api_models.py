"""`HealthResponse` round-trips through JSON with real booleans (task plan T015).

CAP-001-E2-S3 adds request-model validation tests (task plan T015, T018, T019).
"""

import json

import pytest
from pydantic import ValidationError

from factorflow.api.bounds import MAX_HISTORY_DEPTH_YEARS, MAX_SYMBOLS_PER_REQUEST
from factorflow.api.models import (
    AddInstrumentsRequest,
    HealthResponse,
    HistoryDepthResponse,
    SetHistoryDepthRequest,
)


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
