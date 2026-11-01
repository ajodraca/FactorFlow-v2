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

from datetime import date, datetime
from decimal import Decimal
from typing import Any, Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, ValidationInfo, field_validator

from factorflow.api import classification_bounds
from factorflow.api.bounds import MAX_SYMBOLS_PER_REQUEST
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
