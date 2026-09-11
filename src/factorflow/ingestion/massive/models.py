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

from datetime import date, datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field

__all__ = [
    "CorporateAction",
    "DailyBar",
    "FinancialStatement",
    "TickerReference",
]


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
    """Placeholder -- fields land in CAP-001-E3-S2 Phase 3."""


class FinancialStatement(BaseModel):
    """Placeholder -- fields land in CAP-001-E3-S2 Phase 3."""


class CorporateAction(BaseModel):
    """Placeholder -- fields land in CAP-001-E3-S2 Phase 3."""
