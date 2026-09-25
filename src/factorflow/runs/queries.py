"""Read-only journal query boundary for acquisition runs.

Component design: `component-design-run-journal.md` section 5;
`component-design-ingestion-api.md` sections 2.4, 2.4a, 11.

This module owns:
- Listing runs in (requested_at, run_id) DESC order with state filter and
  keyset cursor (DAC-E5-S5-4).
- Fetching a single run's summary and persisted counts (DAC-E5-S5-5).
- Selecting paged per-instrument results with failure-first ordering, outcome
  filter, and instrument-level continuation (DAC-E5-S5-5).

It does NOT perform any lifecycle transitions; those belong to
`factorflow.runs.journal` (S2/S3).

Owner-confirmed cursor contract (2026-09-17): a versioned URL-safe opaque
composite cursor, encoding every key needed to avoid tied-timestamp and
failure-first ordering gaps. Malformed or unsupported-version values raise
`CursorError` which the route maps to 422.
"""

from __future__ import annotations

import base64
import json
from dataclasses import dataclass
from datetime import datetime
from typing import Any
from uuid import UUID

import psycopg

from factorflow.api.bounds import DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE

_CURSOR_VERSION = 1


class CursorError(ValueError):
    """Raised when a cursor string is malformed or carries an unsupported version."""


@dataclass(frozen=True)
class ListFilters:
    """Filters for `list_runs`."""

    limit: int = DEFAULT_PAGE_SIZE
    state: str | None = None
    cursor: str | None = None

    def __post_init__(self) -> None:
        if self.limit < 1 or self.limit > MAX_PAGE_SIZE:
            raise ValueError(f"limit must be between 1 and {MAX_PAGE_SIZE}, got {self.limit}")


@dataclass(frozen=True)
class DetailFilters:
    """Filters for `get_run_detail`."""

    limit: int = DEFAULT_PAGE_SIZE
    outcome: str | None = None
    cursor: str | None = None

    def __post_init__(self) -> None:
        if self.limit < 1 or self.limit > MAX_PAGE_SIZE:
            raise ValueError(f"limit must be between 1 and {MAX_PAGE_SIZE}, got {self.limit}")


@dataclass(frozen=True)
class RunRow:
    """One run row from the journal."""

    run_id: UUID
    state: str
    history_depth_years: int
    requested_at: datetime
    started_at: datetime | None
    ended_at: datetime | None
    instruments_named: int
    instruments_written: int
    instruments_failed: int
    failure_reason: str | None


@dataclass(frozen=True)
class ResultRow:
    """One run_instrument_result row."""

    run_id: UUID
    instrument_id: int
    data_type: str
    outcome: str
    reason: str | None
    attempts: int
    completed_at: datetime


@dataclass(frozen=True)
class RunNotFound:
    """Typed not-found result for an unknown run id."""

    run_id: UUID


@dataclass(frozen=True)
class RunPage:
    """Result of `list_runs`."""

    rows: list[RunRow]
    next_cursor: str | None


@dataclass(frozen=True)
class RunDetail:
    """Result of `get_run_detail`."""

    run: RunRow
    results: list[ResultRow]
    next_cursor: str | None


# ---------------------------------------------------------------------------
# Cursor encoding / decoding
# ---------------------------------------------------------------------------


def encode_cursor(ts: datetime, run_id: UUID) -> str:
    """Encode a (requested_at, run_id) keyset cursor as a versioned URL-safe string."""
    payload = json.dumps(
        {"v": _CURSOR_VERSION, "ts": ts.isoformat(), "id": str(run_id)},
        separators=(",", ":"),
    )
    return base64.urlsafe_b64encode(payload.encode()).decode().rstrip("=")


def _pad(s: str) -> str:
    """Add base64 padding."""
    return s + "=" * (-len(s) % 4)


def decode_cursor(cursor: str) -> tuple[datetime, UUID]:
    """Decode a cursor back to (requested_at, run_id).

    Raises `CursorError` if the cursor is malformed or has an unsupported version.
    """
    if not cursor:
        raise CursorError("empty cursor")
    try:
        raw = base64.urlsafe_b64decode(_pad(cursor))
        data = json.loads(raw)
    except Exception as exc:
        raise CursorError(f"malformed cursor: {exc}") from exc
    if not isinstance(data, dict):
        raise CursorError("cursor payload is not a JSON object")
    if data.get("v") != _CURSOR_VERSION:
        raise CursorError(
            f"unsupported cursor version {data.get('v')!r}; expected {_CURSOR_VERSION}"
        )
    try:
        ts = datetime.fromisoformat(data["ts"])
        run_id = UUID(data["id"])
    except (KeyError, ValueError) as exc:
        raise CursorError(f"cursor field error: {exc}") from exc
    return ts, run_id


def encode_detail_cursor(instrument_id: int, has_failure: bool, symbol: str) -> str:
    """Encode a per-instrument failure-first detail cursor."""
    payload = json.dumps(
        {
            "v": _CURSOR_VERSION,
            "iid": instrument_id,
            "fail": has_failure,
            "sym": symbol,
        },
        separators=(",", ":"),
    )
    return base64.urlsafe_b64encode(payload.encode()).decode().rstrip("=")


def decode_detail_cursor(cursor: str) -> tuple[int, bool, str]:
    """Decode a detail cursor to (instrument_id, has_failure, symbol).

    Raises `CursorError` for malformed or unsupported-version cursors.
    """
    if not cursor:
        raise CursorError("empty cursor")
    try:
        raw = base64.urlsafe_b64decode(_pad(cursor))
        data = json.loads(raw)
    except Exception as exc:
        raise CursorError(f"malformed cursor: {exc}") from exc
    if not isinstance(data, dict):
        raise CursorError("cursor payload is not a JSON object")
    if data.get("v") != _CURSOR_VERSION:
        raise CursorError(
            f"unsupported cursor version {data.get('v')!r}; expected {_CURSOR_VERSION}"
        )
    try:
        instrument_id = int(data["iid"])
        has_failure = bool(data["fail"])
        symbol = str(data["sym"])
    except (KeyError, ValueError, TypeError) as exc:
        raise CursorError(f"cursor field error: {exc}") from exc
    return instrument_id, has_failure, symbol


# ---------------------------------------------------------------------------
# List runs
# ---------------------------------------------------------------------------

_LIST_SQL_BASE = """
SELECT
    run_id,
    state,
    history_depth_years,
    requested_at,
    started_at,
    ended_at,
    instruments_named,
    instruments_written,
    instruments_failed,
    failure_reason
  FROM acquisition_run
"""

_LIST_ORDER = " ORDER BY requested_at DESC, run_id DESC"


def list_runs(connection: psycopg.Connection, filters: ListFilters) -> RunPage:
    """List runs with optional state filter and keyset cursor.

    Returns `filters.limit` rows and a cursor for the next page, or None on
    the last page. Ordering is (requested_at DESC, run_id DESC) to provide a
    stable tie-breaker (DAC-E5-S5-4).
    """
    wheres: list[str] = []
    params: list[object] = []

    if filters.state is not None:
        wheres.append("state = %s")
        params.append(filters.state)

    if filters.cursor is not None:
        ts, run_id = decode_cursor(filters.cursor)
        wheres.append("(requested_at, run_id) < (%s, %s)")
        params.extend([ts, run_id])

    where_clause = (" WHERE " + " AND ".join(wheres)) if wheres else ""
    fetch = filters.limit + 1
    params.append(fetch)

    sql = _LIST_SQL_BASE + where_clause + _LIST_ORDER + " LIMIT %s"

    with connection.cursor() as cur:
        cur.execute(sql, params)
        raw_rows = cur.fetchall()

    rows = [_row_to_run(r) for r in raw_rows[: filters.limit]]
    has_more = len(raw_rows) > filters.limit
    next_cursor = (
        encode_cursor(rows[-1].requested_at, rows[-1].run_id) if has_more and rows else None
    )
    return RunPage(rows=rows, next_cursor=next_cursor)


def _row_to_run(r: tuple[Any, ...]) -> RunRow:
    return RunRow(
        run_id=r[0],
        state=str(r[1]),
        history_depth_years=int(r[2]),
        requested_at=r[3],
        started_at=r[4],
        ended_at=r[5],
        instruments_named=int(r[6]),
        instruments_written=int(r[7]),
        instruments_failed=int(r[8]),
        failure_reason=r[9],
    )


# ---------------------------------------------------------------------------
# Get run detail
# ---------------------------------------------------------------------------

_RUN_SQL = """
SELECT
    run_id,
    state,
    history_depth_years,
    requested_at,
    started_at,
    ended_at,
    instruments_named,
    instruments_written,
    instruments_failed,
    failure_reason
  FROM acquisition_run
 WHERE run_id = %s
"""

# Instruments for a page are selected by choosing up to limit+1 distinct
# instruments (failure-first, then by symbol/instrument_id), then fetching ALL
# data-type rows for the selected instruments — up to 4 * limit result rows.
# The failure-first ordering key is whether ANY result for the instrument is
# failed/not_found.

_INSTRUMENT_IDS_SQL = """
WITH instrument_failure AS (
    SELECT
        instrument_id,
        bool_or(outcome IN ('failed', 'not_found')) AS has_failure
      FROM run_instrument_result
     WHERE run_id = %s
{outcome_filter}
     GROUP BY instrument_id
)
SELECT f.instrument_id, f.has_failure, i.symbol
  FROM instrument_failure f
  JOIN instrument i USING (instrument_id)
{cursor_where}
 ORDER BY f.has_failure DESC, i.symbol ASC, f.instrument_id ASC
 LIMIT %s
"""

_RESULT_ROWS_SQL = """
SELECT
    r.run_id,
    r.instrument_id,
    r.data_type,
    r.outcome,
    r.reason,
    r.attempts,
    r.completed_at
  FROM run_instrument_result r
 WHERE r.run_id = %s
   AND r.instrument_id = ANY(%s)
{outcome_filter}
"""


def get_run_detail(
    connection: psycopg.Connection,
    run_id: UUID,
    filters: DetailFilters,
) -> RunDetail | RunNotFound:
    """Fetch a run's summary, persisted counts, and paged per-instrument results.

    Returns `RunNotFound` when the run id is unknown.
    Ordering is failure-first then by stable (symbol, instrument_id); up to
    `4 * limit` result rows may be returned for `limit` instruments
    (owner-confirmed 2026-09-17, DAC-E5-S5-5).
    """
    with connection.cursor() as cur:
        cur.execute(_RUN_SQL, (run_id,))
        run_row = cur.fetchone()
    if run_row is None:
        return RunNotFound(run_id=run_id)

    run = _row_to_run(run_row)

    outcome_params: list[object] = []
    if filters.outcome is not None:
        outcome_params.append(filters.outcome)

    outcome_filter_sql = "  AND outcome = %s" if filters.outcome is not None else ""

    cursor_where_sql = ""
    cursor_params: list[object] = []
    if filters.cursor is not None:
        cursor_instr_id, cursor_has_failure, cursor_symbol = decode_detail_cursor(filters.cursor)
        # Continue after the last instrument on the previous page.
        # Failure-first means: if cursor was a failure row, continue among
        # failures first, then all success rows. The tie-breaker is (symbol, id).
        cursor_where_sql = (
            "WHERE (f.has_failure < %s) OR "
            "      (f.has_failure = %s AND (i.symbol > %s OR "
            "       (i.symbol = %s AND f.instrument_id > %s)))"
        )
        cursor_params = [
            cursor_has_failure,
            cursor_has_failure,
            cursor_symbol,
            cursor_symbol,
            cursor_instr_id,
        ]

    ids_sql = _INSTRUMENT_IDS_SQL.format(
        outcome_filter=outcome_filter_sql,
        cursor_where=cursor_where_sql,
    )

    fetch_limit = filters.limit + 1
    ids_params: list[object] = [run_id] + outcome_params + cursor_params + [fetch_limit]

    with connection.cursor() as cur:
        cur.execute(ids_sql, ids_params)
        id_rows = cur.fetchall()

    page_instrument_rows = id_rows[: filters.limit]
    has_more = len(id_rows) > filters.limit
    page_instrument_ids = [row[0] for row in page_instrument_rows]

    results: list[ResultRow] = []
    if page_instrument_ids:
        result_sql = _RESULT_ROWS_SQL.format(
            outcome_filter=("  AND r.outcome = %s" if filters.outcome is not None else "")
        )
        result_params: list[object] = [run_id, page_instrument_ids]
        if filters.outcome is not None:
            result_params.append(filters.outcome)

        with connection.cursor() as cur:
            cur.execute(result_sql, result_params)
            result_rows = cur.fetchall()

        # Order result rows: failure-first by instrument, then stable within
        # instrument. Use the page_instrument_ids order as the primary key.
        instr_order = {iid: idx for idx, iid in enumerate(page_instrument_ids)}
        sorted_results = sorted(
            result_rows, key=lambda r: (instr_order.get(r[1], 9999), r[3], r[2])
        )
        results = [
            ResultRow(
                run_id=r[0],
                instrument_id=int(r[1]),
                data_type=str(r[2]),
                outcome=str(r[3]),
                reason=r[4],
                attempts=int(r[5]),
                completed_at=r[6],
            )
            for r in sorted_results
        ]

    next_cursor: str | None = None
    if has_more and page_instrument_rows:
        last = page_instrument_rows[-1]
        next_cursor = encode_detail_cursor(
            instrument_id=int(last[0]),
            has_failure=bool(last[1]),
            symbol=str(last[2]),
        )

    return RunDetail(run=run, results=results, next_cursor=next_cursor)
