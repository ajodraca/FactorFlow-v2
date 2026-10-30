"""The classification read side: the current set, the later attempt and the summary.

Implements ``component-design-classification-reader.md`` sections 2.1 (placement), 2.3
(interface), 2.4 (current set, currency and the summary) and 7 (testing) for CAP-002-E3-S1.

- The current set is the latest set in state ``complete``; ``later`` is the most recent set
  started after it, or the most recent set while none is complete; ``not_current`` is true
  exactly when ``later`` is not None (AC-20, AC-21; DAC-E3-1; DAC-E3-S1-1, DAC-E3-S1-2).
- Before any set is complete the reads carry ``never_classified`` with ``set`` None, in the same
  shape as every other state (AC-22; DAC-E3-11; DAC-E3-S1-3).
- A stock is current when none of its ``factor_input`` rows in the current set is ``missing`` or
  ``outdated``; ``not_computable`` does not count against currency. The summary carries counts
  only, never a stock row (AC-13; DAC-E3-10; DAC-E3-S1-4, DAC-E3-S1-5).
- Every value returned is a stored row; nothing is recomputed here (STD-UI-15; DAC-E3-S1-6).

``read_set_blocks`` is the one definition of the ``set`` and ``later`` blocks that the summary,
the list read and the API reuse (task plan Open Gap 3; SA-DUP-001). Statements are ``.sql`` files
under ``sql/``, loaded at import and executed with bound parameters only. The reader takes the
caller's connection, writes nothing and never commits; database errors propagate (OPS-ERR-001).
"""

from dataclasses import dataclass
from datetime import date, datetime
from pathlib import Path
from typing import Any, Final
from uuid import UUID

import psycopg

from factorflow.classification.constants import FACTORS, MIN_PEER_SET_SIZE

__all__ = [
    "CURRENT_SET_SQL",
    "FACTORS",
    "MIN_PEER_SET_SIZE",
    "SUMMARY_SQL",
    "CurrentSet",
    "FactorSummary",
    "LaterSet",
    "StocksCurrent",
    "Summary",
    "current_set",
    "read_set_blocks",
    "summary",
]

_SQL_DIR = Path(__file__).parent / "sql"
CURRENT_SET_SQL: Final = (_SQL_DIR / "current_set.sql").read_text()
SUMMARY_SQL: Final = (_SQL_DIR / "summary.sql").read_text()


@dataclass(frozen=True)
class LaterSet:
    """The most recent set newer than the current one, or the most recent while none is complete;
    one shape on the list and the summary (DEC-0082)."""

    set_id: UUID
    state: str  # building | failed
    run_id: UUID
    run_started_at: datetime  # acquisition_run.started_at (DEC-0083)
    started_at: datetime
    ended_at: datetime | None
    failure_reason: str | None


@dataclass(frozen=True)
class FactorSummary:
    qualified_count: int
    ranked: bool
    min_peer_set_size: int  # 30, AC-14


@dataclass(frozen=True)
class CurrentSet:
    set_id: UUID
    classification_date: date
    run_id: UUID
    run_started_at: datetime  # acquisition_run.started_at (DEC-0083)
    run_outcome: str  # succeeded | partial, from acquisition_run.state
    state: str  # complete
    started_at: datetime
    ended_at: datetime  # the as-of line's "Scores from {date} {time}"
    latest_trading_day: date
    active_instruments: int  # followed_count
    factors: dict[str, FactorSummary]
    not_current: bool  # true exactly when `later` is not None (DEC-0082)


@dataclass(frozen=True)
class StocksCurrent:
    current_count: int  # stocks with no factor_input row missing or outdated (AC-12, AC-13)
    followed_count: int  # the set's active_instruments


@dataclass(frozen=True)
class Summary:
    set: CurrentSet | None  # the latest complete set, or None
    never_classified: bool  # true exactly when set is None
    later: LaterSet | None  # the newer building or failed set, or the latest while none is complete
    stocks_current: StocksCurrent | None


def read_set_blocks(conn: psycopg.Connection) -> tuple[CurrentSet | None, LaterSet | None]:
    """The ``set`` and ``later`` blocks every classification read carries, from one statement."""
    with conn.cursor() as cur:
        cur.execute(CURRENT_SET_SQL)
        row = cur.fetchone()
        names = [column.name for column in cur.description] if cur.description else []
    if row is None:
        return None, None
    columns = dict(zip(names, row, strict=True))
    later = _row_to_later(columns) if columns["later_set_id"] is not None else None
    current = (
        _row_to_current(columns, not_current=later is not None)
        if columns["set_id"] is not None
        else None
    )
    return current, later


def current_set(conn: psycopg.Connection) -> CurrentSet | None:
    """The latest complete set, or None before any set is complete (AC-22)."""
    return read_set_blocks(conn)[0]


def summary(conn: psycopg.Connection) -> Summary:
    """The current set with its ``later``, plus the current-stock count; no stock rows."""
    current, later = read_set_blocks(conn)
    if current is None:
        return Summary(set=None, never_classified=True, later=later, stocks_current=None)
    with conn.cursor() as cur:
        cur.execute(SUMMARY_SQL, {"set_id": current.set_id})
        row = cur.fetchone()
    if row is None:  # an ungrouped aggregate always returns one row
        raise RuntimeError("summary.sql returned no row")
    stocks_current = StocksCurrent(
        current_count=int(row[0]), followed_count=current.active_instruments
    )
    return Summary(set=current, never_classified=False, later=later, stocks_current=stocks_current)


def _row_to_later(c: dict[str, Any]) -> LaterSet:
    return LaterSet(
        set_id=c["later_set_id"],
        state=str(c["later_state"]),
        run_id=c["later_run_id"],
        run_started_at=c["later_run_started_at"],
        started_at=c["later_started_at"],
        ended_at=c["later_ended_at"],
        failure_reason=c["later_failure_reason"],
    )


def _row_to_current(c: dict[str, Any], *, not_current: bool) -> CurrentSet:
    stored = c["factors"]
    return CurrentSet(
        set_id=c["set_id"],
        classification_date=c["classification_date"],
        run_id=c["run_id"],
        run_started_at=c["run_started_at"],
        run_outcome=str(c["run_outcome"]),
        state=str(c["state"]),
        started_at=c["started_at"],
        ended_at=c["ended_at"],
        latest_trading_day=c["latest_trading_day"],
        active_instruments=int(c["active_instruments"]),
        factors={
            f: FactorSummary(
                qualified_count=int(stored[f]["qualified_count"]),
                ranked=bool(stored[f]["ranked"]),
                min_peer_set_size=MIN_PEER_SET_SIZE,
            )
            for f in FACTORS
        },
        not_current=not_current,
    )
