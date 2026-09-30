"""The coverage read API: what the store actually holds, per instrument.

Implements ``component-design-coverage-service.md`` sections 2.2 (derivation
order), 2.4 (the pinned interface) and 2.5 (never-acquired as its own query).
Coverage is derived at read time from ``coverage_segment``, the observation
tables, ``acquisition_state``, ``owner_setting`` and ``instrument``; nothing is
stored as an asserted summary, so no range can read as complete that was not
written (AC-12, DAC-E6-1). The statements are ``.sql`` files under ``sql/``,
loaded at import and executed with bound parameters only. This module issues
no ``INSERT``, ``UPDATE`` or ``DELETE``.

Satisfies AC-7, AC-12, AC-17, AC-21, DAC-E2-6, DAC-E6-1, DAC-E6-7 and
DAC-E6-S1-1 through DAC-E6-S1-7 (CAP-001-E6-S1). Gap detection is
CAP-001-E6-S2's; until it lands, populated reads carry a "not computed"
placeholder in their gap fields (see ``read_coverage``).
"""

import math
from dataclasses import dataclass
from datetime import date, datetime
from enum import StrEnum
from pathlib import Path
from typing import Final

import psycopg

from factorflow.instruments.settings import read_history_depth
from factorflow.instruments.symbols import normalise

_SQL_DIR = Path(__file__).parent / "sql"
_COVERAGE_SQL: Final = (_SQL_DIR / "coverage.sql").read_text()
_NEVER_ACQUIRED_SQL: Final = (_SQL_DIR / "never_acquired.sql").read_text()

UNAVAILABLE_REASON: Final = "fewer_than_two_instruments_with_data"
DATA_TYPES: Final = ("reference", "prices", "fundamentals", "corporate_actions")
LIFECYCLES: Final = frozenset({"active", "retired"})
MAX_LIMIT: Final = 500
_DAYS_PER_YEAR: Final = 365


class Presence(StrEnum):
    PRESENT = "present"
    ABSENT = "absent"
    UNKNOWN = "unknown"


@dataclass(frozen=True)
class GapDetection:
    available: bool
    reason: str | None
    missing_days: int | None


@dataclass(frozen=True)
class InstrumentCoverage:
    symbol: str
    lifecycle: str
    presence: dict[str, Presence]
    covered_from: date | None
    covered_to: date | None
    last_acquired_at: datetime | None
    depth_shortfall_years: int | None
    gaps: GapDetection


@dataclass(frozen=True)
class CoverageView:
    never_acquired: bool
    gap_detection: GapDetection
    instruments: list[InstrumentCoverage]
    next_cursor: str | None


_NOT_COMPUTED: Final = GapDetection(available=True, reason=None, missing_days=None)


def _depth_shortfall_years(
    covered_from: date | None, covered_to: date | None, stated_years: int | None
) -> int | None:
    """Whole years short of the stated depth, rounded up; None when met or unknowable."""
    if stated_years is None or covered_from is None or covered_to is None:
        return None
    actual_days = (covered_to - covered_from).days + 1
    stated_days = stated_years * _DAYS_PER_YEAR
    if actual_days >= stated_days:
        return None
    return math.ceil((stated_days - actual_days) / _DAYS_PER_YEAR)


def read_coverage(
    conn: psycopg.Connection,
    *,
    symbol: str | None = None,
    lifecycle: str | None = None,
    from_date: date | None = None,
    to_date: date | None = None,
    cursor: str | None = None,
    limit: int = 50,
) -> CoverageView:
    """Read one symbol-keyset page of coverage.

    Raises ``ValueError`` when ``from_date > to_date``, ``lifecycle`` is not
    ``active`` or ``retired``, or ``limit`` is outside 1..500 (SEC-INP-001). A
    database error propagates rather than being rendered as empty coverage
    (OPS-ERR-001). ``never_acquired`` comes from its own query over every
    observation table, so a filter matching nothing on a populated store is
    not reported as never acquired (AC-17, DAC-E6-S1-2). ``next_cursor`` is the
    page's last symbol when more instruments follow it, otherwise ``None``.

    Owner-confirmed choices (2026-09-29, CAP-001-E6-S1-tasks Open Gaps 1-3):

    - ``depth_shortfall_years`` is ``ceil((stated*365 - covered_days) / 365)``
      with ``covered_days`` counted inclusively, and ``None`` when the depth is
      met or no depth is stated, never zero.
    - ``covered_from`` / ``covered_to`` are the instrument's ``prices`` range,
      ``None`` without a prices segment; per-type presence is reported apart.
    - On a populated read every gap field is the "not computed" placeholder
      ``GapDetection(available=True, reason=None, missing_days=None)``, which
      CAP-001-E6-S2 replaces. The never-acquired branch reports detection as
      unavailable with ``UNAVAILABLE_REASON``.
    """
    if from_date is not None and to_date is not None and from_date > to_date:
        raise ValueError(f"from_date {from_date} is after to_date {to_date}")
    if lifecycle is not None and lifecycle not in LIFECYCLES:
        raise ValueError(f"unknown lifecycle {lifecycle!r}")
    if not 1 <= limit <= MAX_LIMIT:
        raise ValueError(f"limit must be between 1 and {MAX_LIMIT}, got {limit}")

    with conn.cursor() as cur:
        cur.execute(_NEVER_ACQUIRED_SQL)
        row = cur.fetchone()
        assert row is not None
        if row[0]:
            return CoverageView(
                never_acquired=True,
                gap_detection=GapDetection(
                    available=False, reason=UNAVAILABLE_REASON, missing_days=None
                ),
                instruments=[],
                next_cursor=None,
            )

        depth = read_history_depth(conn)
        stated_years = depth.years if depth is not None else None

        cur.execute(
            _COVERAGE_SQL,
            {
                "symbol_prefix": normalise(symbol) if symbol is not None else None,
                "lifecycle": lifecycle,
                "from_date": from_date,
                "to_date": to_date,
                "cursor_symbol": cursor,
                "limit": limit + 1,
            },
        )
        rows = cur.fetchall()

    by_instrument: dict[int, list[tuple[object, ...]]] = {}
    for result_row in rows:
        by_instrument.setdefault(result_row[0], []).append(result_row)

    instruments = [_instrument_coverage(group, stated_years) for group in by_instrument.values()]
    next_cursor = None
    if len(instruments) > limit:
        instruments = instruments[:limit]
        next_cursor = instruments[-1].symbol

    return CoverageView(
        never_acquired=False,
        gap_detection=_NOT_COMPUTED,
        instruments=instruments,
        next_cursor=next_cursor,
    )


def _instrument_coverage(
    rows: list[tuple[object, ...]], stated_years: int | None
) -> InstrumentCoverage:
    _, symbol, lifecycle = rows[0][:3]
    by_type = {row[3]: row for row in rows}
    presence: dict[str, Presence] = {}
    acquired_at: list[datetime] = []
    for data_type in DATA_TYPES:
        _, _, _, _, seg_from, _, outcome, last_acquired_at = by_type[data_type]
        if seg_from is not None:
            presence[data_type] = Presence.PRESENT
        elif outcome is not None:
            presence[data_type] = Presence.ABSENT
        else:
            presence[data_type] = Presence.UNKNOWN
        if isinstance(last_acquired_at, datetime):
            acquired_at.append(last_acquired_at)

    prices = by_type["prices"]
    covered_from = prices[4] if isinstance(prices[4], date) else None
    covered_to = prices[5] if isinstance(prices[5], date) else None
    return InstrumentCoverage(
        symbol=str(symbol),
        lifecycle=str(lifecycle),
        presence=presence,
        covered_from=covered_from,
        covered_to=covered_to,
        last_acquired_at=max(acquired_at, default=None),
        depth_shortfall_years=_depth_shortfall_years(covered_from, covered_to, stated_years),
        gaps=_NOT_COMPUTED,
    )
