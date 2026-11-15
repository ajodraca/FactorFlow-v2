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

``read_data_health`` is the Data health read (component design 2.5, 3 and 5;
DEC-0201, DEC-0213, DEC-0220; AC-11, AC-12, AC-21, AC-24; DAC-E2-4, DAC-E2-5,
DAC-E2-15, DAC-E2-S3-1 to DAC-E2-S3-3). It pages ``coverage-service`` unchanged
to a null cursor, folds each page into running counts that keep at most five
exception symbols per check, and leaves the transaction to the caller. A
``ValueError`` from ``read_coverage`` is never caught here.
"""

from collections.abc import Mapping
from dataclasses import dataclass, field
from datetime import date, datetime
from typing import Final, Literal, cast

import psycopg

from factorflow.config.settings import credential_present
from factorflow.coverage.service import MAX_LIMIT, CoverageView, Presence, read_coverage
from factorflow.data_health.models import (
    Attention,
    AttentionItem,
    CompanyFinancialsCheck,
    DailyPricesCheck,
    DataHealth,
    Failure,
    GapDetectionState,
    LatestDownload,
    LatestTerminalDownload,
    ProblemPage,
    ProblemRow,
    Problems,
    Progress,
)
from factorflow.data_health.queries import (
    DATA_HEALTH_HEAD_SQL,
    FOLLOWED_COUNT_SQL,
    FUNDAMENTALS_STATE_SQL,
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


_EXCEPTION_SYMBOLS_KEPT: Final = 5
# The first problem page of component design 2.2; the value equals the API's
# default page size, kept local so the reader does not import the API layer.
_FIRST_PAGE_LIMIT: Final = 50

_UNSEEN = (Presence.ABSENT, Presence.UNKNOWN)


@dataclass
class _Union:
    """Distinct stocks in any group of one check: a count and the first five symbols."""

    count: int = 0
    symbols: list[str] = field(default_factory=list)

    def add(self, symbol: str) -> None:
        self.count += 1
        if len(self.symbols) < _EXCEPTION_SYMBOLS_KEPT:
            self.symbols.append(symbol)


@dataclass
class _ChecksFold:
    """Running counts of both checks over coverage pages, in ascending symbol order."""

    latest_session: date | None
    prices_absent: int = 0
    prices_behind: int = 0
    prices_gaps: int = 0
    gaps_available: bool = True
    gaps_reason: str | None = None
    prices_union: _Union = field(default_factory=_Union)
    financials_absent: int = 0
    financials_problems: int = 0
    as_of: datetime | None = None
    financials_union: _Union = field(default_factory=_Union)

    def add_page(
        self, view: CoverageView, fundamentals: Mapping[str, tuple[str, datetime]]
    ) -> None:
        if not view.gap_detection.available and self.gaps_available:
            self.gaps_available = False
            self.gaps_reason = view.gap_detection.reason
        for stock in view.instruments:
            absent = stock.presence["prices"] in _UNSEEN
            behind = (
                stock.covered_to is not None
                and self.latest_session is not None
                and stock.covered_to < self.latest_session
            )
            gap = stock.gaps.missing_days is not None and stock.gaps.missing_days > 0
            self.prices_absent += absent
            self.prices_behind += behind
            self.prices_gaps += gap
            if absent or behind or gap:
                self.prices_union.add(stock.symbol)

            outcome, acquired_at = fundamentals.get(stock.symbol, (None, None))
            f_absent = stock.presence["fundamentals"] in _UNSEEN
            f_problem = outcome in ("failed", "not_found")
            self.financials_absent += f_absent
            self.financials_problems += f_problem
            if f_absent or f_problem:
                self.financials_union.add(stock.symbol)
            if outcome == "written" and acquired_at is not None:
                if self.as_of is None or acquired_at > self.as_of:
                    self.as_of = acquired_at

    def daily_prices(self) -> DailyPricesCheck:
        gap_stock_count = self.prices_gaps if self.gaps_available else None
        if self.prices_absent + self.prices_behind + (gap_stock_count or 0) > 0:
            status: Literal["ok", "exceptions", "not_determinable"] = "exceptions"
        elif not self.gaps_available:
            status = "not_determinable"
        else:
            status = "ok"
        return DailyPricesCheck(
            status,
            self.prices_absent,
            gap_stock_count,
            self.prices_behind,
            self.latest_session,
            GapDetectionState(self.gaps_available, self.gaps_reason),
            self.prices_union.count,
            tuple(self.prices_union.symbols),
        )

    def company_financials(self) -> CompanyFinancialsCheck:
        exceptions = self.financials_absent + self.financials_problems > 0
        return CompanyFinancialsCheck(
            "exceptions" if exceptions else "ok",
            self.financials_absent,
            self.financials_problems,
            self.as_of,
            self.financials_union.count,
            tuple(self.financials_union.symbols),
        )


def _fundamentals_state(
    conn: psycopg.Connection, symbols: list[str]
) -> dict[str, tuple[str, datetime]]:
    """Each symbol's fundamentals ``last_outcome`` and ``last_acquired_at``."""
    if not symbols:
        return {}
    with conn.cursor() as cur:
        cur.execute(FUNDAMENTALS_STATE_SQL, {"symbols": symbols})
        return {symbol: (outcome, acquired_at) for symbol, outcome, acquired_at in cur.fetchall()}


def read_data_health(conn: psycopg.Connection) -> DataHealth:
    """The Data health aggregate: both checks, the verdict counts and the first problem page.

    One pass over ``coverage-service``'s active-stock pages (500 each, to a null
    cursor), so memory holds one page and five symbols per check whatever the
    roster size. Before anything was acquired both checks are ``None``, never
    zero counts (AC-21). ``affected_count`` is the statement behind
    ``Problems.stock_count`` (DEC-0201). The caller owns the transaction.
    """
    with conn.cursor() as cur:
        cur.execute(DATA_HEALTH_HEAD_SQL)
        head = cur.fetchone()
    assert head is not None  # an aggregate over a table always returns one row
    checked_at, followed_count, latest_session = head

    view = read_coverage(conn, lifecycle="active", cursor=None, limit=MAX_LIMIT)
    never_acquired = view.never_acquired
    fold = _ChecksFold(latest_session=latest_session)
    if not never_acquired:
        while True:
            fold.add_page(view, _fundamentals_state(conn, [i.symbol for i in view.instruments]))
            if view.next_cursor is None:
                break
            view = read_coverage(conn, lifecycle="active", cursor=view.next_cursor, limit=MAX_LIMIT)

    with conn.cursor() as cur:
        cur.execute(PROBLEM_COUNT_SQL)
        count_row = cur.fetchone()
    assert count_row is not None
    affected_count = count_row[0]

    problems = read_problems(conn, cursor=None, limit=_FIRST_PAGE_LIMIT)
    return DataHealth(
        checked_at,
        never_acquired,
        followed_count,
        affected_count,
        None if never_acquired else fold.daily_prices(),
        None if never_acquired else fold.company_financials(),
        problems,
    )
