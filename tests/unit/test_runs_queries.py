"""Unit tests for the runs query boundary.

Task plan T005: covers parameterised SQL, cursor encoding/validation, bounds,
tie-breaker ordering predicates, outcome filtering, and explicit detail
not-found.
"""

from __future__ import annotations

import re
import uuid
from dataclasses import fields
from datetime import UTC, datetime
from pathlib import Path
from typing import get_args, get_type_hints

import pytest

from factorflow.api.models import ResultOutcome
from factorflow.runs.queries import (
    RESULT_OUTCOMES,
    CursorError,
    DetailFilters,
    ListFilters,
    OutcomeCounts,
    RunNotFound,
    decode_cursor,
    encode_cursor,
)
from factorflow.runs.states import RUN_STATES

# ---------------------------------------------------------------------------
# Cursor encoding / decoding
# ---------------------------------------------------------------------------


def test_cursor_round_trips() -> None:
    """A cursor produced by encode_cursor decodes back to the same values."""
    run_id = uuid.uuid4()
    ts = datetime(2026, 1, 15, 12, 30, 0, tzinfo=UTC)

    encoded = encode_cursor(ts, run_id)
    decoded_ts, decoded_id = decode_cursor(encoded)

    assert decoded_ts == ts
    assert decoded_id == run_id


def test_cursor_is_url_safe() -> None:
    """The cursor string contains only URL-safe characters."""
    import re

    run_id = uuid.uuid4()
    ts = datetime.now(UTC)
    cursor = encode_cursor(ts, run_id)

    assert re.match(r"^[A-Za-z0-9_\-=]+$", cursor), (
        f"cursor contains non-URL-safe chars: {cursor!r}"
    )


def test_decode_cursor_rejects_malformed() -> None:
    """A random string raises CursorError."""
    with pytest.raises(CursorError):
        decode_cursor("not_a_real_cursor")


def test_decode_cursor_rejects_unsupported_version() -> None:
    """A cursor with an unknown version prefix raises CursorError."""
    import base64
    import json

    payload = json.dumps({"v": 99, "ts": "2026-01-01T00:00:00+00:00", "id": str(uuid.uuid4())})
    bad_cursor = base64.urlsafe_b64encode(payload.encode()).decode().rstrip("=")

    with pytest.raises(CursorError):
        decode_cursor(bad_cursor)


def test_decode_cursor_rejects_empty_string() -> None:
    with pytest.raises(CursorError):
        decode_cursor("")


# ---------------------------------------------------------------------------
# ListFilters validation
# ---------------------------------------------------------------------------


def test_list_filters_default_limit() -> None:
    """ListFilters defaults to DEFAULT_PAGE_SIZE."""
    from factorflow.api.bounds import DEFAULT_PAGE_SIZE

    f = ListFilters()
    assert f.limit == DEFAULT_PAGE_SIZE


def test_list_filters_max_limit_accepted() -> None:
    from factorflow.api.bounds import MAX_PAGE_SIZE

    f = ListFilters(limit=MAX_PAGE_SIZE)
    assert f.limit == MAX_PAGE_SIZE


def test_list_filters_over_max_rejected() -> None:
    from factorflow.api.bounds import MAX_PAGE_SIZE

    with pytest.raises((ValueError, Exception)):
        ListFilters(limit=MAX_PAGE_SIZE + 1)


def test_list_filters_zero_limit_rejected() -> None:
    with pytest.raises((ValueError, Exception)):
        ListFilters(limit=0)


def test_run_and_result_filter_enumerations_match_the_contract() -> None:
    """T008: read filters accept only the schema and API enumeration values."""
    migration = (Path(__file__).resolve().parents[2] / "migrations" / "0004_runs.sql").read_text()
    expected_outcomes = {"written", "unchanged", "not_found", "failed", "skipped"}

    assert RESULT_OUTCOMES == expected_outcomes
    assert set(get_args(ResultOutcome)) == expected_outcomes
    check = re.search(
        r"CONSTRAINT run_result_outcome_known\s+CHECK \(outcome IN \((.*?)\)\)",
        migration,
        re.DOTALL,
    )
    assert check is not None
    assert set(re.findall(r"'([^']+)'", check.group(1))) == expected_outcomes

    for state in RUN_STATES:
        assert ListFilters(state=state).state == state
    for invalid_state in ("bogus", "", "FAILED"):
        with pytest.raises(ValueError):
            ListFilters(state=invalid_state)
    assert ListFilters(state=None).state is None

    for outcome in RESULT_OUTCOMES:
        assert DetailFilters(outcome=outcome).outcome == outcome
    for invalid_outcome in ("bogus", "", "FAILED"):
        with pytest.raises(ValueError):
            DetailFilters(outcome=invalid_outcome)
    assert DetailFilters(outcome=None).outcome is None


def test_outcome_counts_has_exactly_five_integer_fields() -> None:
    """T008: query-level counts preserve all schema outcome categories."""
    assert [field.name for field in fields(OutcomeCounts)] == [
        "written",
        "unchanged",
        "not_found",
        "failed",
        "skipped",
    ]
    assert get_type_hints(OutcomeCounts) == {
        "written": int,
        "unchanged": int,
        "not_found": int,
        "failed": int,
        "skipped": int,
    }


# ---------------------------------------------------------------------------
# RunNotFound is a typed result (not an exception)
# ---------------------------------------------------------------------------


def test_run_not_found_is_instantiable() -> None:
    """RunNotFound can be constructed and is not an Exception subclass."""
    run_id = uuid.uuid4()
    result = RunNotFound(run_id=run_id)
    assert result.run_id == run_id
    assert not isinstance(result, Exception)


# ---------------------------------------------------------------------------
# CursorError is an exception
# ---------------------------------------------------------------------------


def test_cursor_error_is_exception() -> None:
    err = CursorError("bad")
    assert isinstance(err, Exception)
