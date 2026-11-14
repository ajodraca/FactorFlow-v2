"""Read-only reads of the data-health-reader (component design 2.4, DEC-0201).

``read_problems`` pages the one problem set by symbol (AC-13, AC-14, AC-16,
DAC-E2-1 to DAC-E2-3, DAC-E2-S1-1 to DAC-E2-S1-4). Precondition, owned by the
caller (``data-health-api`` validates both before the call): ``cursor`` is a
normalised valid symbol or ``None`` and ``limit`` is 1 to 500. The transaction
belongs to the caller's ``with pool.connection()`` block: nothing here ends it.
"""

from typing import Literal, cast

import psycopg

from factorflow.data_health.models import Failure, ProblemPage, ProblemRow
from factorflow.data_health.queries import PROBLEM_ROWS_SQL


def read_problems(conn: psycopg.Connection, *, cursor: str | None, limit: int) -> ProblemPage:
    """One keyset page of followed stocks with a problem, by symbol.

    Fetches ``limit + 1`` stocks: the extra one decides ``next_cursor``, which
    is the last kept symbol only when a further stock exists, so a full final
    page carries none. A row is retryable when any of its failures is ``failed``.
    """
    with conn.cursor() as cur:
        cur.execute(PROBLEM_ROWS_SQL, {"cursor": cursor, "limit_plus_one": limit + 1})
        rows = cur.fetchall()

    by_symbol: dict[str, list[Failure]] = {}
    for symbol, data_type, outcome, reason, attempts, completed_at, run_id in rows:
        by_symbol.setdefault(symbol, []).append(
            Failure(
                data_type,
                cast(Literal["failed", "not_found"], outcome),
                reason,
                attempts,
                completed_at,
                run_id,
            )
        )

    symbols = list(by_symbol)
    kept = symbols[:limit]
    next_cursor = kept[-1] if len(symbols) > limit else None
    return ProblemPage(
        rows=tuple(
            ProblemRow(
                symbol,
                tuple(by_symbol[symbol]),
                retryable=any(f.outcome == "failed" for f in by_symbol[symbol]),
            )
            for symbol in kept
        ),
        next_cursor=next_cursor,
    )
