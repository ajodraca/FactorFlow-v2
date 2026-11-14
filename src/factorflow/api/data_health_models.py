"""Response models of the data-health-api (CAP-003-E2-S4).

Component design `component-design-data-health-api.md` 2.4, mirroring system
design 4.2 field for field plus each check's `exception_count` (DEC-0220), with
the version 1 failure (no `cause`: CAP-003-E8-S7 adds it). The models carry
facts in the domain vocabulary and no sentence or tier (DEC-0200, AC-19,
DAC-E2-12). Nullable counts and dates are `null`, never `0` (DEC-0213,
DAC-E2-11): every field is required and none has a default, so none can be
omitted (DAC-E2-S4-1). Each model's `from_reader` copies the data-health-reader
dataclasses (component design reader 2.2) across and nothing else. A separate
module from `models.py`, as `classification_models.py` is, so no delivered file
is edited.
"""

from datetime import date, datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel

from factorflow.data_health import models as reader


class ProgressResponse(BaseModel):
    done: int
    total: int | None

    @classmethod
    def from_reader(cls, value: reader.Progress) -> "ProgressResponse":
        return cls(done=value.done, total=value.total)


class LatestDownloadResponse(BaseModel):
    run_id: UUID
    state: str
    requested_at: datetime
    started_at: datetime | None
    ended_at: datetime | None
    progress: ProgressResponse

    @classmethod
    def from_reader(cls, value: reader.LatestDownload) -> "LatestDownloadResponse":
        return cls(
            run_id=value.run_id,
            state=value.state,
            requested_at=value.requested_at,
            started_at=value.started_at,
            ended_at=value.ended_at,
            progress=ProgressResponse.from_reader(value.progress),
        )


class LatestTerminalDownloadResponse(BaseModel):
    run_id: UUID
    state: str
    ended_at: datetime
    failure_reason: str | None

    @classmethod
    def from_reader(cls, value: reader.LatestTerminalDownload) -> "LatestTerminalDownloadResponse":
        return cls(
            run_id=value.run_id,
            state=value.state,
            ended_at=value.ended_at,
            failure_reason=value.failure_reason,
        )


class ProblemsResponse(BaseModel):
    stock_count: int
    symbols: list[str]
    newest_completed_at: datetime | None

    @classmethod
    def from_reader(cls, value: reader.Problems) -> "ProblemsResponse":
        return cls(
            stock_count=value.stock_count,
            symbols=list(value.symbols),
            newest_completed_at=value.newest_completed_at,
        )


class AttentionItemResponse(BaseModel):
    kind: Literal["data_problems", "download_not_complete", "credential_missing"]
    recorded_at: datetime
    run_id: UUID | None

    @classmethod
    def from_reader(cls, value: reader.AttentionItem) -> "AttentionItemResponse":
        return cls(kind=value.kind, recorded_at=value.recorded_at, run_id=value.run_id)


class AttentionResponse(BaseModel):
    checked_at: datetime
    followed_count: int
    prices_as_of: date | None
    credential_present: bool
    problems: ProblemsResponse
    latest_download: LatestDownloadResponse | None
    latest_terminal_download: LatestTerminalDownloadResponse | None
    items: list[AttentionItemResponse]

    @classmethod
    def from_reader(cls, value: reader.Attention) -> "AttentionResponse":
        return cls(
            checked_at=value.checked_at,
            followed_count=value.followed_count,
            prices_as_of=value.prices_as_of,
            credential_present=value.credential_present,
            problems=ProblemsResponse.from_reader(value.problems),
            latest_download=(
                LatestDownloadResponse.from_reader(value.latest_download)
                if value.latest_download is not None
                else None
            ),
            latest_terminal_download=(
                LatestTerminalDownloadResponse.from_reader(value.latest_terminal_download)
                if value.latest_terminal_download is not None
                else None
            ),
            items=[AttentionItemResponse.from_reader(item) for item in value.items],
        )


class FailureResponse(BaseModel):
    data_type: str
    outcome: Literal["failed", "not_found"]
    reason: str | None
    attempts: int
    completed_at: datetime
    run_id: UUID

    @classmethod
    def from_reader(cls, value: reader.Failure) -> "FailureResponse":
        return cls(
            data_type=value.data_type,
            outcome=value.outcome,
            reason=value.reason,
            attempts=value.attempts,
            completed_at=value.completed_at,
            run_id=value.run_id,
        )


class ProblemRowResponse(BaseModel):
    symbol: str
    failures: list[FailureResponse]
    retryable: bool

    @classmethod
    def from_reader(cls, value: reader.ProblemRow) -> "ProblemRowResponse":
        return cls(
            symbol=value.symbol,
            failures=[FailureResponse.from_reader(failure) for failure in value.failures],
            retryable=value.retryable,
        )


class ProblemPageResponse(BaseModel):
    rows: list[ProblemRowResponse]
    next_cursor: str | None

    @classmethod
    def from_reader(cls, value: reader.ProblemPage) -> "ProblemPageResponse":
        return cls(
            rows=[ProblemRowResponse.from_reader(row) for row in value.rows],
            next_cursor=value.next_cursor,
        )


class GapDetectionResponse(BaseModel):
    available: bool
    reason: str | None

    @classmethod
    def from_reader(cls, value: reader.GapDetectionState) -> "GapDetectionResponse":
        return cls(available=value.available, reason=value.reason)


class DailyPricesCheckResponse(BaseModel):
    status: Literal["ok", "exceptions", "not_determinable"]
    absent_count: int
    gap_stock_count: int | None
    behind_count: int
    latest_session: date | None
    gap_detection: GapDetectionResponse
    exception_count: int
    exception_symbols: list[str]

    @classmethod
    def from_reader(cls, value: reader.DailyPricesCheck) -> "DailyPricesCheckResponse":
        return cls(
            status=value.status,
            absent_count=value.absent_count,
            gap_stock_count=value.gap_stock_count,
            behind_count=value.behind_count,
            latest_session=value.latest_session,
            gap_detection=GapDetectionResponse.from_reader(value.gap_detection),
            exception_count=value.exception_count,
            exception_symbols=list(value.exception_symbols),
        )


class CompanyFinancialsCheckResponse(BaseModel):
    status: Literal["ok", "exceptions"]
    absent_count: int
    problem_count: int
    as_of: datetime | None
    exception_count: int
    exception_symbols: list[str]

    @classmethod
    def from_reader(cls, value: reader.CompanyFinancialsCheck) -> "CompanyFinancialsCheckResponse":
        return cls(
            status=value.status,
            absent_count=value.absent_count,
            problem_count=value.problem_count,
            as_of=value.as_of,
            exception_count=value.exception_count,
            exception_symbols=list(value.exception_symbols),
        )


class ChecksResponse(BaseModel):
    daily_prices: DailyPricesCheckResponse | None
    company_financials: CompanyFinancialsCheckResponse | None


class DataHealthResponse(BaseModel):
    checked_at: datetime
    never_acquired: bool
    followed_count: int
    affected_count: int
    checks: ChecksResponse
    problems: ProblemPageResponse

    @classmethod
    def from_reader(cls, value: reader.DataHealth) -> "DataHealthResponse":
        # `checks` is always an object; its two members are null together
        # exactly when `never_acquired` (system design 4.2).
        return cls(
            checked_at=value.checked_at,
            never_acquired=value.never_acquired,
            followed_count=value.followed_count,
            affected_count=value.affected_count,
            checks=ChecksResponse(
                daily_prices=(
                    DailyPricesCheckResponse.from_reader(value.daily_prices)
                    if value.daily_prices is not None
                    else None
                ),
                company_financials=(
                    CompanyFinancialsCheckResponse.from_reader(value.company_financials)
                    if value.company_financials is not None
                    else None
                ),
            ),
            problems=ProblemPageResponse.from_reader(value.problems),
        )
