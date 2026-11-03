"""Pydantic request and response models of the classification API.

Component design: `component-design-classification-api.md` sections 2.4 (request
bounds and validation) and 2.7 (response shapes); DEC-0085 (the filter a universe
is saved from is the reader's `Thresholds`, converted field for field) and DEC-0070
(the compare bounds). CAP-002-E1-S6 creates this module with the universes models;
CAP-002-E3-S5 appends the classification models and imports `Thresholds`,
`FactorCellResponse` and `SetBlock` from here.

Every request model forbids unknown keys. Validation messages name the field and
never include a submitted value (the delivered validation handler echoes only
each error's `loc`). Scores, percentiles and stored bounds are `Decimal` and
serialise as decimal strings at stored precision (Pydantic's JSON mode).
"""

from collections.abc import Iterable
from datetime import date, datetime
from decimal import Decimal
from typing import Any, Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, ValidationInfo, field_validator

from factorflow.api import classification_bounds
from factorflow.api.bounds import DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE, MAX_SYMBOLS_PER_REQUEST
from factorflow.classification import reader
from factorflow.instruments.symbols import SYMBOL_PATTERN, is_valid, normalise

_SYMBOL_SHAPE = SYMBOL_PATTERN.pattern

# Pydantic refuses a non-finite Decimal by default, so a score bound is finite as it stands.
_PERCENTILE = Field(default=None, ge=0, le=100)


def _normalised_name(name: str) -> str:
    """The trimmed name: non-empty, and within `MAX_UNIVERSE_NAME_LENGTH` once it is set."""
    trimmed = name.strip()
    if not trimmed:
        raise ValueError("the name must not be empty")
    limit = classification_bounds.MAX_UNIVERSE_NAME_LENGTH
    if limit is not None and len(trimmed) > limit:
        raise ValueError(f"the name must be at most {limit} characters")
    return trimmed


def _normalised_symbols(symbols: list[str]) -> list[str]:
    """Each entry trimmed and upper-cased, then shape-checked; duplicates are the service's."""
    normalised = [normalise(symbol) for symbol in symbols]
    if not all(is_valid(symbol) for symbol in normalised):
        raise ValueError(f"every symbol must match {_SYMBOL_SHAPE} after upper-casing")
    return normalised


class Thresholds(BaseModel):
    """The filter: twelve optional bounds, `hide_incomplete` and the symbol prefix.

    Mirrors `factorflow.classification.reader.Thresholds` (design 2.4; DEC-0076,
    DEC-0085); `to_reader` converts it field for field.
    """

    model_config = ConfigDict(extra="forbid")

    value_score_min: Decimal | None = None
    value_score_max: Decimal | None = None
    value_percentile_min: Decimal | None = _PERCENTILE
    value_percentile_max: Decimal | None = _PERCENTILE
    growth_score_min: Decimal | None = None
    growth_score_max: Decimal | None = None
    growth_percentile_min: Decimal | None = _PERCENTILE
    growth_percentile_max: Decimal | None = _PERCENTILE
    momentum_score_min: Decimal | None = None
    momentum_score_max: Decimal | None = None
    momentum_percentile_min: Decimal | None = _PERCENTILE
    momentum_percentile_max: Decimal | None = _PERCENTILE
    # Lax on purpose: CAP-002-E3-S5 parses the same model from query strings ("true").
    hide_incomplete: bool = False
    symbol: str | None = None

    @field_validator("symbol")
    @classmethod
    def _symbol_prefix(cls, value: str | None) -> str | None:
        if value is None:
            return None
        prefix = normalise(value)
        if not is_valid(prefix):
            raise ValueError(f"the symbol prefix must match {_SYMBOL_SHAPE} after upper-casing")
        return prefix

    def to_reader(self) -> reader.Thresholds:
        """The reader's `Thresholds`: only the bounds that are set, under their field names."""
        bounds = {
            name: value
            for name, value in self.model_dump(exclude={"hide_incomplete", "symbol"}).items()
            if value is not None
        }
        return reader.Thresholds(
            bounds=bounds, hide_incomplete=self.hide_incomplete, symbol=self.symbol
        )


class CreateUniverseRequest(BaseModel):
    """`POST /api/universes`: `{name, symbols}` by hand, or `{name, filter, set_id}`.

    Exactly one of `symbols` and `filter`, decided with `is None` so `symbols: []`
    is the by-hand branch and reaches the service's `EmptyUniverse` (design 8 AC-3).
    `set_id` goes with, and only with, `filter`. Both rules are field validators so
    each error names its field; they read earlier fields from `info.data`, so the
    declaration order `name`, `symbols`, `filter`, `set_id` is load-bearing.
    """

    model_config = ConfigDict(extra="forbid")

    name: str
    symbols: list[str] | None = Field(default=None, max_length=MAX_SYMBOLS_PER_REQUEST)
    filter: Thresholds | None = Field(default=None, validate_default=True)
    set_id: UUID | None = Field(default=None, validate_default=True)

    _name = field_validator("name")(_normalised_name)

    @field_validator("symbols")
    @classmethod
    def _symbols(cls, value: list[str] | None) -> list[str] | None:
        return None if value is None else _normalised_symbols(value)

    @field_validator("filter")
    @classmethod
    def _exactly_one_source(
        cls, value: Thresholds | None, info: ValidationInfo
    ) -> Thresholds | None:
        if "symbols" not in info.data:  # `symbols` itself failed and is already reported
            return value
        if (info.data["symbols"] is None) == (value is None):
            raise ValueError("exactly one of `symbols` and `filter` must be given")
        return value

    @field_validator("set_id")
    @classmethod
    def _set_id_with_filter(cls, value: UUID | None, info: ValidationInfo) -> UUID | None:
        if "filter" not in info.data:  # `filter` failed and is already reported
            return value
        if info.data["filter"] is not None and value is None:
            raise ValueError("`set_id` is required with `filter`")
        if info.data["filter"] is None and value is not None:
            raise ValueError("`set_id` is accepted only with `filter`")
        return value


class RenameUniverseRequest(BaseModel):
    """`PATCH /api/universes/{id}`."""

    model_config = ConfigDict(extra="forbid")

    name: str

    _name = field_validator("name")(_normalised_name)


class AddMembersRequest(BaseModel):
    """`POST /api/universes/{id}/members`: 1 to `MAX_SYMBOLS_PER_REQUEST` symbols."""

    model_config = ConfigDict(extra="forbid")

    symbols: list[str] = Field(min_length=1, max_length=MAX_SYMBOLS_PER_REQUEST)

    @field_validator("symbols")
    @classmethod
    def _symbols(cls, value: list[str]) -> list[str]:
        return _normalised_symbols(value)


# --- responses (design 2.7) --------------------------------------------------------------


class FactorCellResponse(BaseModel):
    status: str
    score: Decimal | None
    percentile: Decimal | None
    reason_code: str | None
    reason_input: str | None
    reason_detail: str | None
    restated_possible: bool

    @classmethod
    def from_reader(cls, cell: reader.FactorCell) -> "FactorCellResponse":
        return cls(
            status=cell.status,
            score=cell.score,
            percentile=cell.percentile,
            reason_code=cell.reason_code,
            reason_input=cell.reason_input,
            reason_detail=cell.reason_detail,
            restated_possible=cell.restated_possible,
        )


class FactorsResponse(BaseModel):
    value: FactorCellResponse
    growth: FactorCellResponse
    momentum: FactorCellResponse

    @classmethod
    def from_reader(cls, cells: dict[str, reader.FactorCell]) -> "FactorsResponse":
        return cls(
            value=FactorCellResponse.from_reader(cells["value"]),
            growth=FactorCellResponse.from_reader(cells["growth"]),
            momentum=FactorCellResponse.from_reader(cells["momentum"]),
        )


class SetBlock(BaseModel):
    """The current-set block the list, summary, evidence and universe reads share."""

    set_id: UUID
    classification_date: date
    run_id: UUID
    run_started_at: datetime
    run_outcome: str
    state: str
    started_at: datetime
    ended_at: datetime
    latest_trading_day: date
    active_instruments: int
    not_current: bool

    @classmethod
    def from_reader(cls, current: reader.CurrentSet) -> "SetBlock":
        return cls(
            set_id=current.set_id,
            classification_date=current.classification_date,
            run_id=current.run_id,
            run_started_at=current.run_started_at,
            run_outcome=current.run_outcome,
            state=current.state,
            started_at=current.started_at,
            ended_at=current.ended_at,
            latest_trading_day=current.latest_trading_day,
            active_instruments=current.active_instruments,
            not_current=current.not_current,
        )


class OriginResponse(BaseModel):
    """How the universe was made; every field but `kind` is null for `by_hand`."""

    kind: str
    set_id: UUID | None
    classification_date: date | None
    thresholds: dict[str, Decimal] | None
    hide_incomplete: bool | None
    symbol: str | None


class MemberResponse(BaseModel):
    """A member: `symbol`, `lifecycle`, `member_since` from the service's `Member`; `name` and
    `factors` from the reader's row for it, both null when the reader has none (DEC-0097)."""

    symbol: str
    name: str | None
    lifecycle: str
    member_since: datetime
    factors: FactorsResponse | None


class UniverseResponse(BaseModel):
    universe_id: UUID
    name: str
    lifecycle: str
    created_at: datetime
    retired_at: datetime | None
    member_count: int
    as_of: date
    as_of_before_creation: bool
    origin: OriginResponse
    members: list[MemberResponse]
    set: SetBlock | None


class UniverseListItem(BaseModel):
    universe_id: UUID
    name: str
    lifecycle: str
    member_count: int
    created_at: datetime
    retired_at: datetime | None


class UniverseListResponse(BaseModel):
    universes: list[UniverseListItem]
    active_count: int
    retired_count: int
    next_cursor: str | None


class UniverseEventResponse(BaseModel):
    """One event; `filter_provenance` is the stored jsonb, unchanged (DEC-0093 amendment)."""

    event_id: int
    event_type: str
    name: str | None
    symbol: str | None
    recorded_at: datetime
    recorded_on: date
    filter_provenance: dict[str, Any] | None


class UniverseEventsResponse(BaseModel):
    events: list[UniverseEventResponse]
    next_cursor: str | None


class AddMembersResponse(BaseModel):
    added: list[str]
    already_member: list[str]


class RemoveMemberResponse(BaseModel):
    removed_at: datetime


class RetireUniverseResponse(BaseModel):
    lifecycle: Literal["retired"]
    retired_at: datetime


# --- classification reads (CAP-002-E3-S5; design 2.4 and 2.7) -----------------------------


def _cell_response(cell: reader.FactorCell) -> FactorCellResponse:
    """The seven fields of a reader cell, field for field."""
    return FactorCellResponse.from_reader(cell)


def _factors_response(cells: dict[str, reader.FactorCell]) -> FactorsResponse:
    return FactorsResponse.from_reader(cells)


def _set_block(current: reader.CurrentSet) -> SetBlock:
    """The eleven `SetBlock` fields of a reader set; its `factors` are not part of the block."""
    return SetBlock.from_reader(current)


_SortKey = Literal[
    "symbol",
    "value_score",
    "growth_score",
    "momentum_score",
    "value_percentile",
    "growth_percentile",
    "momentum_percentile",
]
_BOUND_NAMES = tuple(
    f"{factor}_{metric}_{end}"
    for factor in reader.FACTORS
    for metric in ("score", "percentile")
    for end in ("min", "max")
)
_SCORE = Field(default=None)  # a finite Decimal: Pydantic refuses NaN and infinity by default
_PERCENTILE_BOUND = Field(default=None, ge=0, le=100)


class ClassificationListQuery(BaseModel):
    """`GET /api/classifications` query (design 2.4; DEC-0070, DEC-0141).

    Flat, because a query-parameter model cannot nest: the twelve bounds are listed here and
    `to_filters` builds the reader's `Thresholds` from the ones the request named.
    """

    model_config = ConfigDict(extra="forbid")

    universe_id: UUID | None = None
    symbols: list[str] | None = None
    symbol: str | None = None
    sort: _SortKey = "symbol"
    order: Literal["asc", "desc"] = "asc"
    value_score_min: Decimal | None = _SCORE
    value_score_max: Decimal | None = _SCORE
    value_percentile_min: Decimal | None = _PERCENTILE_BOUND
    value_percentile_max: Decimal | None = _PERCENTILE_BOUND
    growth_score_min: Decimal | None = _SCORE
    growth_score_max: Decimal | None = _SCORE
    growth_percentile_min: Decimal | None = _PERCENTILE_BOUND
    growth_percentile_max: Decimal | None = _PERCENTILE_BOUND
    momentum_score_min: Decimal | None = _SCORE
    momentum_score_max: Decimal | None = _SCORE
    momentum_percentile_min: Decimal | None = _PERCENTILE_BOUND
    momentum_percentile_max: Decimal | None = _PERCENTILE_BOUND
    hide_incomplete: bool = False
    limit: int = Field(DEFAULT_PAGE_SIZE, gt=0, le=MAX_PAGE_SIZE)
    cursor: str | None = None

    @field_validator("symbols", mode="before")
    @classmethod
    def _compare_symbols(cls, value: object) -> list[str] | None:
        if value is None:
            return None
        entries = [value] if isinstance(value, str) else value
        if not isinstance(entries, list):
            raise ValueError("symbols must be a list of symbols")
        symbols: list[str] = []
        for entry in entries:
            for part in str(entry).split(","):
                symbol = normalise(part)
                if symbol and symbol not in symbols:
                    symbols.append(symbol)
        if not all(is_valid(symbol) for symbol in symbols):
            raise ValueError(f"every symbol must match {_SYMBOL_SHAPE} after upper-casing")
        low, high = (
            classification_bounds.MIN_COMPARE_SYMBOLS,
            classification_bounds.MAX_COMPARE_SYMBOLS,
        )
        if not low <= len(symbols) <= high:
            raise ValueError(f"compare takes {low} to {high} distinct symbols")
        return symbols

    @field_validator("symbol")
    @classmethod
    def _symbol_prefix(cls, value: str | None) -> str | None:
        if value is None:
            return None
        prefix = normalise(value)
        if not is_valid(prefix):
            raise ValueError(f"the symbol prefix must match {_SYMBOL_SHAPE} after upper-casing")
        return prefix

    def to_filters(self) -> reader.ListFilters:
        """The reader's filters: only the bounds the request named, as `Decimal`."""
        bounds = {
            name: value for name in _BOUND_NAMES if (value := getattr(self, name)) is not None
        }
        return reader.ListFilters(
            universe_id=self.universe_id,
            sort=self.sort,
            order=self.order,
            thresholds=reader.Thresholds(
                bounds=bounds, hide_incomplete=self.hide_incomplete, symbol=self.symbol
            ),
            limit=self.limit,
            cursor=self.cursor,
        )

    def compare_conflicts(self, named: Iterable[str] | None = None) -> list[str]:
        """What the request named besides `symbols` and `limit`: compare takes symbols alone.

        `named` is the query-string names, for a request FastAPI built the model from: it fills
        some defaults in, so `model_fields_set` there is not what the request named.
        """
        names = (
            self.model_fields_set if named is None else set(named) & set(type(self).model_fields)
        )
        return sorted(names - {"symbols", "limit"})


class FactorSummaryResponse(BaseModel):
    qualified_count: int
    ranked: bool
    min_peer_set_size: int


class LaterBlock(BaseModel):
    """The newer building or failed set; one shape on the list and the summary (DEC-0082)."""

    set_id: UUID
    state: str
    started_at: datetime
    ended_at: datetime | None
    failure_reason: str | None
    run_id: UUID
    run_started_at: datetime


class StockRowResponse(BaseModel):
    symbol: str
    name: str | None
    lifecycle: str
    factors: FactorsResponse


class StocksCurrentResponse(BaseModel):
    current_count: int
    followed_count: int


def _factor_summaries(
    current: reader.CurrentSet | None,
) -> dict[str, FactorSummaryResponse]:
    """The set's counts, or the zero record while no set is complete (DEC-0140)."""
    if current is None:
        return {
            name: FactorSummaryResponse(
                qualified_count=0, ranked=False, min_peer_set_size=reader.MIN_PEER_SET_SIZE
            )
            for name in reader.FACTORS
        }
    return _summaries(current.factors)


def _summaries(factors: dict[str, reader.FactorSummary]) -> dict[str, FactorSummaryResponse]:
    return {
        name: FactorSummaryResponse(
            qualified_count=summary.qualified_count,
            ranked=summary.ranked,
            min_peer_set_size=summary.min_peer_set_size,
        )
        for name, summary in factors.items()
    }


def _later_block(later: reader.LaterSet | None) -> LaterBlock | None:
    if later is None:
        return None
    return LaterBlock(
        set_id=later.set_id,
        state=later.state,
        started_at=later.started_at,
        ended_at=later.ended_at,
        failure_reason=later.failure_reason,
        run_id=later.run_id,
        run_started_at=later.run_started_at,
    )


class _SetBlocks(BaseModel):
    """`set`, `never_classified`, `later` and `factors`: built once so the list and the summary
    cannot drift (DAC-E3-11)."""

    set: SetBlock | None
    never_classified: bool
    later: LaterBlock | None
    factors: dict[str, FactorSummaryResponse]

    @staticmethod
    def parts(
        current: reader.CurrentSet | None, never_classified: bool, later: reader.LaterSet | None
    ) -> dict[str, Any]:
        return {
            "set": None if current is None else _set_block(current),
            "never_classified": never_classified,
            "later": _later_block(later),
            "factors": _factor_summaries(current),
        }


class ClassificationListResponse(_SetBlocks):
    match_count: int
    stocks: list[StockRowResponse]
    unknown_symbols: list[str]
    next_cursor: str | None

    @classmethod
    def from_reader(cls, page: reader.ClassificationPage) -> "ClassificationListResponse":
        return cls(
            **cls.parts(page.set, page.never_classified, page.later),
            match_count=page.match_count,
            stocks=[
                StockRowResponse(
                    symbol=stock.symbol,
                    name=stock.name,
                    lifecycle=stock.lifecycle,
                    factors=_factors_response(stock.factors),
                )
                for stock in page.stocks
            ],
            unknown_symbols=page.unknown_symbols,
            next_cursor=page.next_cursor,
        )


class ClassificationSummaryResponse(_SetBlocks):
    stocks_current: StocksCurrentResponse | None

    @classmethod
    def from_reader(cls, summary: reader.Summary) -> "ClassificationSummaryResponse":
        current = summary.stocks_current
        return cls(
            **cls.parts(summary.set, summary.never_classified, summary.later),
            stocks_current=None
            if current is None
            else StocksCurrentResponse(
                current_count=current.current_count, followed_count=current.followed_count
            ),
        )


class InputRowResponse(BaseModel):
    factor: str
    input_name: str
    label: str
    status: str
    value: Decimal | None
    as_of: date | None
    known_on: date | None
    restated_possible: bool
    detail: dict[str, Any] | None


class MembershipResponse(BaseModel):
    universe_id: UUID
    name: str


class StockEvidenceResponse(BaseModel):
    set: SetBlock | None
    symbol: str
    name: str | None
    lifecycle: str
    factors: dict[str, FactorCellResponse]
    inputs: list[InputRowResponse]
    memberships: list[MembershipResponse]

    @classmethod
    def from_reader(cls, evidence: reader.StockEvidence) -> "StockEvidenceResponse":
        return cls(
            set=None if evidence.set is None else _set_block(evidence.set),
            symbol=evidence.symbol,
            name=evidence.name,
            lifecycle=evidence.lifecycle,
            factors={name: _cell_response(cell) for name, cell in evidence.factors.items()},
            inputs=[
                InputRowResponse(
                    factor=row.factor,
                    input_name=row.input_name,
                    label=row.label,
                    status=row.status,
                    value=row.value,
                    as_of=row.as_of,
                    known_on=row.known_on,
                    restated_possible=row.restated_possible,
                    detail=row.detail,
                )
                for row in evidence.inputs
            ],
            memberships=[
                MembershipResponse(universe_id=m.universe_id, name=m.name)
                for m in evidence.memberships
            ],
        )


class HistorySetResponse(BaseModel):
    set_id: UUID
    classification_date: date
    run_id: UUID
    run_outcome: str
    ended_at: datetime
    factors: FactorsResponse

    @classmethod
    def from_reader(cls, row: reader.HistoryRow) -> "HistorySetResponse":
        return cls(
            set_id=row.set_id,
            classification_date=row.classification_date,
            run_id=row.run_id,
            run_outcome=row.run_outcome,
            ended_at=row.ended_at,
            factors=_factors_response(row.factors),
        )


class StockHistoryResponse(BaseModel):
    symbol: str
    sets: list[HistorySetResponse]
    next_cursor: str | None

    @classmethod
    def from_reader(
        cls, symbol: str, rows: list[reader.HistoryRow], next_cursor: str | None
    ) -> "StockHistoryResponse":
        return cls(
            symbol=symbol,
            sets=[HistorySetResponse.from_reader(row) for row in rows],
            next_cursor=next_cursor,
        )


class SetResponse(BaseModel):
    set_id: UUID
    state: str
    classification_date: date
    run_id: UUID
    run_started_at: datetime | None
    run_outcome: str
    started_at: datetime
    ended_at: datetime | None
    failure_reason: str | None
    latest_trading_day: date | None
    active_instruments: int | None
    factors: dict[str, FactorSummaryResponse]

    @classmethod
    def from_reader(cls, row: reader.SetRow) -> "SetResponse":
        return cls(
            set_id=row.set_id,
            state=row.state,
            classification_date=row.classification_date,
            run_id=row.run_id,
            run_started_at=row.run_started_at,
            run_outcome=row.run_outcome,
            started_at=row.started_at,
            ended_at=row.ended_at,
            failure_reason=row.failure_reason,
            latest_trading_day=row.latest_trading_day,
            active_instruments=row.active_instruments,
            factors=_summaries(row.factors),
        )


class SetListResponse(BaseModel):
    sets: list[SetResponse]
    next_cursor: str | None

    @classmethod
    def from_reader(cls, rows: list[reader.SetRow], next_cursor: str | None) -> "SetListResponse":
        return cls(sets=[SetResponse.from_reader(row) for row in rows], next_cursor=next_cursor)
