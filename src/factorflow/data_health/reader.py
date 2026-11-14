"""Read-only reads of the data-health-reader (component design 2.4, DEC-0201).

``read_problems`` pages the one problem set by symbol (AC-13, AC-14, AC-16,
DAC-E2-1 to DAC-E2-3, DAC-E2-S1-1 to DAC-E2-S1-4). Precondition, owned by the
caller (``data-health-api`` validates both before the call): ``cursor`` is a
normalised valid symbol or ``None`` and ``limit`` is 1 to 500. The transaction
belongs to the caller's ``with pool.connection()`` block: nothing here ends it.

``read_attention`` is the cheap aggregate the shell polls (component design 2.3,
2.6, 2.7 and 5; AC-7, AC-8, AC-9, AC-12, AC-21; DAC-E2-6 to DAC-E2-8,
DAC-E2-S2-1 to DAC-E2-S2-4): five fixed statements on the caller's connection, no
call to ``coverage-service``, and the same caller-owned transaction. Its items
carry no tier and no copy (DEC-0200); the three kinds are DEC-0203's, and the
progress ``total`` is ``None`` while ``instruments_named`` is 0 (DEC-0213 f).
"""

from datetime import datetime
from typing import Literal, cast

import psycopg

from factorflow.config.settings import credential_present
from factorflow.data_health.models import (
    Attention,
    AttentionItem,
    Failure,
    LatestDownload,
    LatestTerminalDownload,
    ProblemPage,
    ProblemRow,
    Problems,
    Progress,
)
from factorflow.data_health.queries import (
    FOLLOWED_COUNT_SQL,
    LATEST_DOWNLOAD_SQL,
    LATEST_TERMINAL_SQL,
    PRICES_AS_OF_SQL,
    PROBLEM_COUNT_SQL,
    PROBLEM_ROWS_SQL,
)


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


def _attention_items(
    *,
    problems: Problems,
    latest_terminal: LatestTerminalDownload | None,
    credential_present: bool,
    checked_at: datetime,
) -> tuple[AttentionItem, ...]:
    """The server items of DEC-0203, in component design 2.7's row order.

    Each exists exactly while its cause holds in the store. ``data_problems``
    follows the stock count; ``download_not_complete`` only a latest terminal
    download that is ``failed`` or ``abandoned``; ``credential_missing`` the
    absence of the key. ``run_id`` is set for ``download_not_complete`` alone.
    """
    items: list[AttentionItem] = []
    if problems.stock_count > 0 and problems.newest_completed_at is not None:
        items.append(AttentionItem("data_problems", problems.newest_completed_at, None))
    if latest_terminal is not None and latest_terminal.state in ("failed", "abandoned"):
        items.append(
            AttentionItem("download_not_complete", latest_terminal.ended_at, latest_terminal.run_id)
        )
    if not credential_present:
        items.append(AttentionItem("credential_missing", checked_at, None))
    return tuple(items)


def read_attention(conn: psycopg.Connection) -> Attention:
    """The attention aggregate: five statements, one result, nothing written.

    The latest download and the latest terminal download are two selections, so
    a running download never displaces the last ended one. The caller owns the
    transaction; ``checked_at`` is the first statement's ``now()``.
    """
    with conn.cursor() as cur:
        cur.execute(FOLLOWED_COUNT_SQL)
        followed = cur.fetchone()
        cur.execute(PRICES_AS_OF_SQL)
        prices = cur.fetchone()
        cur.execute(PROBLEM_COUNT_SQL)
        problem_row = cur.fetchone()
        cur.execute(LATEST_DOWNLOAD_SQL)
        download_row = cur.fetchone()
        cur.execute(LATEST_TERMINAL_SQL)
        terminal_row = cur.fetchone()

    assert followed is not None  # an aggregate over a table always returns one row
    assert prices is not None
    assert problem_row is not None
    followed_count, checked_at = followed
    stock_count, symbols, newest_completed_at = problem_row
    problems = Problems(stock_count, tuple(symbols), newest_completed_at)

    latest_download: LatestDownload | None = None
    if download_row is not None:
        run_id, state, requested_at, started_at, ended_at, named, done = download_row
        latest_download = LatestDownload(
            run_id,
            state,
            requested_at,
            started_at,
            ended_at,
            Progress(done, named if named > 0 else None),
        )

    latest_terminal: LatestTerminalDownload | None = None
    if terminal_row is not None:
        latest_terminal = LatestTerminalDownload(*terminal_row)

    present = credential_present()
    return Attention(
        checked_at,
        followed_count,
        prices[0],
        present,
        problems,
        latest_download,
        latest_terminal,
        _attention_items(
            problems=problems,
            latest_terminal=latest_terminal,
            credential_present=present,
            checked_at=checked_at,
        ),
    )
