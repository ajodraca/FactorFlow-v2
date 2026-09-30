"""The trading-day set and gap derivation.

Implements ``component-design-coverage-service.md`` sections 2.2 (gaps are
computed last, and only after the availability check), 2.3 (the statement) and
3 (constraints). The provider supplies no historical trading calendar, so a
trading day is any date on which any instrument has a daily bar in the range,
and a gap is such a date inside an instrument's own ``prices`` covered range
for which that instrument has no bar. Only ``prices`` are checked: quarterly
fundamentals and sporadic corporate actions carry no per-day expectation.

Two limits are stated rather than hidden:

- Detection is unavailable when fewer than two instruments hold bars in the
  range. It is reported as unavailable with a reason, never as zero gaps.
- A market-wide outage is undetectable: a day every instrument lacks never
  enters the trading-day set, so it is nobody's gap.

Satisfies AC-8, DAC-E6-2 through DAC-E6-6 and DAC-E6-S2-1 through DAC-E6-S2-6
(CAP-001-E6-S2). Statements are ``.sql`` files under ``sql/``, loaded at import
and executed with bound parameters only; database errors propagate
(OPS-ERR-001).
"""

from dataclasses import dataclass
from datetime import date
from pathlib import Path
from typing import Final

import psycopg

_SQL_DIR = Path(__file__).parent / "sql"
GAPS_SQL: Final = (_SQL_DIR / "gaps.sql").read_text()
GAP_RANGE_SQL: Final = (_SQL_DIR / "gap_range.sql").read_text()

UNAVAILABLE_REASON: Final = "fewer_than_two_instruments_with_data"


@dataclass(frozen=True)
class GapResult:
    available: bool
    from_date: date | None
    to_date: date | None
    missing: dict[int, list[date]]


def detect_gaps(
    conn: psycopg.Connection,
    *,
    from_date: date | None = None,
    to_date: date | None = None,
) -> GapResult:
    """Detect missing trading days per instrument over the resolved range.

    An omitted bound resolves to the widest ``prices`` coverage (design 2.3).
    ``missing`` maps ``instrument_id`` to its missing dates in ascending order,
    and holds only instruments with at least one gap. Raises ``ValueError``
    when ``from_date > to_date`` (SEC-INP-001).
    """
    if from_date is not None and to_date is not None and from_date > to_date:
        raise ValueError(f"from_date {from_date} is after to_date {to_date}")

    with conn.cursor() as cur:
        cur.execute(GAP_RANGE_SQL, {"from_date": from_date, "to_date": to_date})
        row = cur.fetchone()
        assert row is not None
        resolved_from, resolved_to, available = row
        if not available:
            return GapResult(False, resolved_from, resolved_to, {})

        cur.execute(GAPS_SQL, {"from_date": resolved_from, "to_date": resolved_to})
        missing: dict[int, list[date]] = {}
        for instrument_id, missing_date in cur.fetchall():
            missing.setdefault(instrument_id, []).append(missing_date)

    return GapResult(True, resolved_from, resolved_to, missing)
