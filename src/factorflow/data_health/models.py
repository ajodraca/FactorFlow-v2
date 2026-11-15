"""Frozen models of the data-health-reader (component design 2.2, system design 4.2).

The models carry facts in the domain vocabulary and no sentence or tier
(DEC-0200): the words the owner reads are composed above this module.
Version 1 shape: ``Failure`` has no ``cause`` (CAP-003-E8-S6 adds it).
"""

from dataclasses import dataclass
from datetime import date, datetime
from typing import Literal
from uuid import UUID


@dataclass(frozen=True)
class Progress:
    done: int
    total: int | None  # None while instruments_named is 0 (DEC-0213 f)


@dataclass(frozen=True)
class LatestDownload:
    run_id: UUID
    # requested | running | cancelling | succeeded | partial | failed | cancelled | abandoned
    state: str
    requested_at: datetime
    started_at: datetime | None
    ended_at: datetime | None
    progress: Progress


@dataclass(frozen=True)
class LatestTerminalDownload:
    run_id: UUID
    state: str  # succeeded | partial | failed | cancelled | abandoned, as recorded
    ended_at: datetime
    failure_reason: str | None


@dataclass(frozen=True)
class Problems:
    stock_count: int
    symbols: tuple[str, ...]  # first three by symbol
    newest_completed_at: datetime | None


@dataclass(frozen=True)
class AttentionItem:
    kind: Literal["data_problems", "download_not_complete", "credential_missing"]
    recorded_at: datetime
    run_id: UUID | None  # set only for download_not_complete


@dataclass(frozen=True)
class Attention:
    checked_at: datetime
    followed_count: int
    prices_as_of: date | None
    credential_present: bool
    problems: Problems
    latest_download: LatestDownload | None
    latest_terminal_download: LatestTerminalDownload | None
    items: tuple[AttentionItem, ...]


@dataclass(frozen=True)
class Failure:
    data_type: str  # reference | prices | fundamentals | corporate_actions
    outcome: Literal["failed", "not_found"]
    reason: str | None
    attempts: int
    completed_at: datetime
    run_id: UUID


@dataclass(frozen=True)
class ProblemRow:
    symbol: str
    failures: tuple[Failure, ...]
    retryable: bool  # any failure failed (AC-14)


@dataclass(frozen=True)
class ProblemPage:
    rows: tuple[ProblemRow, ...]
    next_cursor: str | None


@dataclass(frozen=True)
class GapDetectionState:
    available: bool
    reason: str | None


@dataclass(frozen=True)
class DailyPricesCheck:
    status: Literal["ok", "exceptions", "not_determinable"]
    absent_count: int
    gap_stock_count: int | None  # None when gap detection is unavailable (DEC-0213 c)
    behind_count: int
    latest_session: date | None
    gap_detection: GapDetectionState
    exception_count: int  # distinct stocks in the union (DEC-0220)
    exception_symbols: tuple[str, ...]  # first five by symbol


@dataclass(frozen=True)
class CompanyFinancialsCheck:
    status: Literal["ok", "exceptions"]
    absent_count: int
    problem_count: int
    as_of: datetime | None
    exception_count: int  # distinct stocks in the union (DEC-0220)
    exception_symbols: tuple[str, ...]


@dataclass(frozen=True)
class DataHealth:
    checked_at: datetime
    never_acquired: bool
    followed_count: int
    affected_count: int  # equals Problems.stock_count, one set (DEC-0201)
    daily_prices: DailyPricesCheck | None  # None exactly when never_acquired
    company_financials: CompanyFinancialsCheck | None
    problems: ProblemPage  # first page of 50
