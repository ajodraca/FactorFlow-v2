"""Pydantic response models for Massive's four historical data shapes.

Component design: `component-design-massive-client.md` sections 2.3, 2.5;
`component-design-market-data-store.md` section 2.3 (the persistence
contract these models are named for).

Massive's wire field names -- `t`, `o`, `h`, `l`, `c`, `filing_date` and the
rest -- stay inside this module. Every `Field(alias=...)` below is the one
place a wire name is allowed to appear (DAC-E3-12); every attribute name is
the product's own vocabulary, and that is what a caller of `massive-client`
sees.

None of these models owns `observed_on`, `run_id`, or `recorded_at`. Those
belong to the observation writer and the run lifecycle (CAP-001-E4); a
provider-parsed value earns no as-of date just by being parsed.
"""

from datetime import UTC, date, datetime
from decimal import Decimal
from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

__all__ = [
    "CorporateAction",
    "DailyBar",
    "FinancialStatement",
    "TickerReference",
]


def _coerce_extra_numeric_fields_to_decimal(
    known_fields: set[str], data: dict[str, Any]
) -> dict[str, Any]:
    """Convert every field not already declared on the model from `int` or
    `float` to `Decimal`, via `str()` rather than a direct `float`
    conversion, so no binary rounding enters a value that will be recorded
    permanently (DAC-E3-S2-3). Shared by every model here that retains
    provider-specific, undeclared line items in its JSONB payload."""
    coerced = dict(data)
    for key, value in data.items():
        if key in known_fields or isinstance(value, bool):
            continue
        if isinstance(value, int | float):
            coerced[key] = Decimal(str(value))
    return coerced


class TickerReference(BaseModel):
    """Massive's ticker-reference read, named for `instrument_reference`.

    Source: `component-design-massive-client.md` section 2.5, `GET
    /v3/reference/tickers/{ticker}`.

    `cik`, `composite_figi` and `share_class_figi` are required: AC-3 rests
    instrument identity on them rather than on the ticker, so a response
    missing one of them is not a usable reference record. `is_active` and
    `company_name` are required for the same reason -- an unnamed record
    with no known activity state is not a reference. `list_date`,
    `delisted_utc`, `primary_exchange`, `security_type` and `currency_name`
    are optional: `delisted_utc` in particular is genuinely absent for an
    active instrument, which is the property the component design's testing
    section relies on (section 7, "a delisted instrument's `list_date` and
    `delisted_utc` survive").
    """

    model_config = ConfigDict(populate_by_name=True)

    cik: str = Field(alias="cik")
    composite_figi: str = Field(alias="composite_figi")
    share_class_figi: str = Field(alias="share_class_figi")
    is_active: bool = Field(alias="active")
    company_name: str = Field(alias="name")
    list_date: date | None = Field(alias="list_date", default=None)
    delisted_utc: datetime | None = Field(alias="delisted_utc", default=None)
    primary_exchange: str | None = Field(alias="primary_exchange", default=None)
    security_type: str | None = Field(alias="type", default=None)
    currency_name: str | None = Field(alias="currency_name", default=None)

    def value_payload(self) -> dict[str, Any]:
        """A JSON-round-trippable value payload for `instrument_reference`'s
        `payload` column, and for the append-only hash CAP-001-E4 computes
        over it. This model owns no `observed_on`, `run_id` or
        `recorded_at`, so none can appear here."""
        return self.model_dump(mode="json")


class DailyBar(BaseModel):
    """A daily aggregate bar, named for `daily_bar`.

    Source: `component-design-massive-client.md` section 2.5, `GET
    /v2/aggs/ticker/{ticker}/range/1/day/{from}/{to}`.

    Every field Massive's daily-aggregate response documents is required
    (DAC-E3-S2-1): `t`, `o`, `h`, `l`, `c`, `v`, `vw` and `n` are all
    present on every bar the endpoint returns, so a response missing one of
    them is not a usable bar (DAC-E3-S2-4). `otc` is the one genuinely
    optional field -- most sessions are not OTC, and its absence must
    remain `None`, distinguishable from an explicit `False`
    (DAC-E3-S2-5).

    `t` is Unix milliseconds and is converted to `session_date` through a
    timezone-aware UTC conversion (DAC-E3-S2-2): a naive local-time
    conversion would shift the date near midnight depending on the host's
    timezone, which would silently corrupt the `daily_bar` natural key.
    """

    model_config = ConfigDict(populate_by_name=True)

    session_date: date = Field(alias="t")
    open_price: Decimal = Field(alias="o")
    high_price: Decimal = Field(alias="h")
    low_price: Decimal = Field(alias="l")
    close_price: Decimal = Field(alias="c")
    volume: Decimal = Field(alias="v")
    vwap: Decimal = Field(alias="vw")
    transaction_count: int = Field(alias="n")
    is_otc: bool | None = Field(alias="otc", default=None)

    @field_validator("session_date", mode="before")
    @classmethod
    def _millis_to_utc_session_date(cls, value: Any) -> Any:
        """Convert Unix milliseconds to a UTC calendar date before Pydantic's
        own `date` coercion runs, so the conversion is always
        timezone-aware UTC rather than the host's local timezone."""
        if isinstance(value, int | float):
            return datetime.fromtimestamp(value / 1000, tz=UTC).date()
        return value

    def value_payload(self) -> dict[str, Any]:
        """A JSON-round-trippable value payload for `daily_bar`'s `payload`
        column, and for the append-only hash CAP-001-E4 computes over it.
        This model owns no `observed_on`, `run_id` or `recorded_at`, so
        none can appear here."""
        return self.model_dump(mode="json")


class FinancialStatement(BaseModel):
    """A company financial statement, named for `fundamental_observation`.

    Source: `component-design-massive-client.md` section 2.5, the four
    sibling `GET /stocks/financials/v1/...` endpoints (balance sheets,
    income statements, cash-flow statements and ratios).

    `cik`, `tickers`, `fiscal_period_end`, `provider_filing_date`,
    `fiscal_year` and `timeframe` are all required: the component design
    states each result carries them, so a response missing one is not a
    usable statement (DAC-E3-S2-4). `fiscal_quarter` is optional --
    `timeframe` distinguishes `annual` from `quarterly` filings, and an
    annual filing carries no quarter; its absence must remain `None`, not
    a substituted value (DAC-E3-S2-5).

    `statement_type` discriminates which of the four sibling endpoints a
    record came from (`fundamental_observation.statement_type`, part of
    its natural key). Massive does not return it on the wire -- it is
    known from which endpoint was called -- so this is the one field the
    caller (CAP-001-E3-S1's client) supplies rather than one carried by
    the response body; it remains required because the persistence
    contract requires it.

    `provider_filing_date` is **descriptive only** (C5, AC-5): it is the
    most recent filing including the period and conflates restatements of
    the same period, so it must never be read or used as the observation
    date. `observed_on` belongs to the observation writer alone
    (CAP-001-E4) and is not a field of this model.

    Every statement-specific line item (total assets, a given ratio, and
    so on) varies by `statement_type` and is not enumerated by the
    component design, so this model accepts them as additional data
    rather than declaring one field per possible line item. They are
    coerced to `Decimal` (DAC-E3-S2-3) and retained verbatim in
    `value_payload()` for the writer's JSONB payload and hash.
    """

    model_config = ConfigDict(populate_by_name=True, extra="allow")

    cik: str = Field(alias="cik")
    tickers: list[str] = Field(alias="tickers")
    fiscal_period_end: date = Field(alias="period_end")
    provider_filing_date: date = Field(alias="filing_date")
    fiscal_year: int = Field(alias="fiscal_year")
    fiscal_quarter: int | None = Field(alias="fiscal_quarter", default=None)
    timeframe: str = Field(alias="timeframe")
    statement_type: str = Field(alias="statement_type")

    @model_validator(mode="before")
    @classmethod
    def _coerce_statement_values_to_decimal(cls, data: Any) -> Any:
        """Convert every extra (statement-specific) numeric line item to
        `Decimal` via its string representation, never via `float`
        directly, so no binary rounding enters a value that will be
        recorded permanently."""
        if not isinstance(data, dict):
            return data
        return _coerce_extra_numeric_fields_to_decimal(set(cls.model_fields), data)

    def value_payload(self) -> dict[str, Any]:
        """A JSON-round-trippable value payload for
        `fundamental_observation`'s `payload` column, and for the
        append-only hash CAP-001-E4 computes over it. This model owns no
        `observed_on`, `run_id` or `recorded_at`, so none can appear
        here."""
        return self.model_dump(mode="json")


class CorporateAction(BaseModel):
    """One corporate action -- a split, dividend, ticker change, or IPO --
    named for `corporate_action`.

    Source: `component-design-massive-client.md` section 2.5, the four
    corporate-action endpoints (`GET /stocks/v1/splits`,
    `GET /stocks/v1/dividends`, `GET /vX/reference/ipos` and
    `GET /vX/reference/tickers/{id}/events`).

    Per the component design's Notes, `CorporateAction` is **one** product
    model keyed by `action_type` and `effective_on` -- `corporate_action`'s
    natural key -- rather than four separate storage shapes for the four
    provider endpoint variants. Each endpoint names its own effective date
    differently (a split's `execution_date`, a dividend's
    `ex_dividend_date`, a ticker event's `date`, an IPO's `listing_date`)
    and none of the four responses names an `action_type` field at all --
    it is known from which endpoint was called. Both are therefore
    supplied by the caller (CAP-001-E3-S1's client) alongside the raw
    response, the same pattern `FinancialStatement.statement_type` uses,
    rather than aliased from one wire key that does not exist across all
    four shapes.

    `action_type` is constrained to the DDL's four known values
    (`corporate_action_type_known`); an unrecognised value fails
    validation rather than being written. Every other, endpoint-specific
    field (`split_from`, `cash_amount`, `historical_adjustment_factor`,
    and so on) is retained as additional data, coerced to `Decimal`
    (DAC-E3-S2-3) and carried into `value_payload()` for the writer's
    JSONB payload and hash.
    """

    model_config = ConfigDict(populate_by_name=True, extra="allow")

    action_type: Literal["split", "dividend", "ticker_change", "ipo"] = Field(alias="action_type")
    effective_on: date = Field(alias="effective_on")

    @model_validator(mode="before")
    @classmethod
    def _coerce_action_values_to_decimal(cls, data: Any) -> Any:
        """Convert every extra (endpoint-specific) numeric field to
        `Decimal` via its string representation, never via `float`
        directly, so no binary rounding enters a value that will be
        recorded permanently."""
        if not isinstance(data, dict):
            return data
        return _coerce_extra_numeric_fields_to_decimal(set(cls.model_fields), data)

    def value_payload(self) -> dict[str, Any]:
        """A JSON-round-trippable value payload for `corporate_action`'s
        `payload` column, and for the append-only hash CAP-001-E4 computes
        over it. This model owns no `observed_on`, `run_id` or
        `recorded_at`, so none can appear here."""
        return self.model_dump(mode="json")
