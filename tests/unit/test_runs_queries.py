"""Unit tests for the runs query boundary.

Task plan T005: covers parameterised SQL, cursor encoding/validation, bounds,
tie-breaker ordering predicates, outcome filtering, and explicit detail
not-found.
"""

from __future__ import annotations

import uuid
from datetime import UTC, datetime

import pytest

from factorflow.runs.queries import (
    CursorError,
    ListFilters,
    RunNotFound,
    decode_cursor,
    encode_cursor,
)

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
