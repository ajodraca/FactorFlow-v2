"""The Massive boundary's four historical reads.

Component design: `component-design-massive-client.md` sections 2.2b (SDK
construction), 2.3 (interface) and 2.5 (endpoint paths). Story:
`CAP-001-E3-S1`.

`MassiveClient` builds one reusable `massive.RESTClient`, overriding the
three SDK defaults section 2.2b identifies as silently wrong for this
capability (`retries`, `pagination`, `trace`), and exposes one operation
per data type rather than a generic provider-path method -- which is what
leaves room for the M3 streaming half to attach here later without
redefining this interface (DAC-E3-14).

Every SDK request -- the first page and every subsequent one -- is
submitted through the caller-supplied `RateLimitGovernor` (CAP-001-E3-S4),
classified by the typed error taxonomy (CAP-001-E3-S3). This module owns
neither pacing nor retry policy; it only adapts the taxonomy's types onto
the governor's `Outcome` enum, the seam `component-design-rate-limit-governor.md`
section 2.3 assigns to this story.
"""

from __future__ import annotations

import json
from collections.abc import Callable
from datetime import date
from typing import Any, TypeVar

from massive import RESTClient
from massive.exceptions import BadResponse
from pydantic import ValidationError
from urllib3 import HTTPResponse

from factorflow.config.settings import MassiveSettings
from factorflow.ingestion.massive import models
from factorflow.ingestion.massive.errors import (
    InstrumentNotFound,
    classify_error_body,
    is_fatal_for_governor,
    is_rate_limited_body,
    wrap_validation_error,
)
from factorflow.ingestion.massive.paging import follow_pages
from factorflow.ingestion.rate_limit import Outcome, RateLimitGovernor

__all__ = ["MassiveClient"]

T = TypeVar("T")


class MassiveClient:
    """Historical reads against Massive. The live feed (M3) attaches here."""

    def __init__(self, settings: MassiveSettings, governor: RateLimitGovernor) -> None:
        self._governor = governor
        self._rest_client = RESTClient(
            api_key=settings.api_key.get_secret_value(),
            base=settings.base_url,  # FACTORFLOW_MASSIVE_BASE_URL; also used by `vx`
            retries=0,  # the governor owns retry alone (section 2.2b)
            connect_timeout=settings.timeout_seconds,
            read_timeout=settings.timeout_seconds,
            pagination=False,  # pages are followed under governor permits
            trace=False,  # request headers carry the credential
        )

    # -- fetch_reference (DAC-E3-S1-4) ------------------------------------

    def fetch_reference(self, symbol: str) -> models.TickerReference:
        """Ticker reference: CIK, composite FIGI, share class FIGI, list and
        delist dates. Raises `InstrumentNotFound` when the provider does not
        recognise the symbol. Uses the single-ticker endpoint only -- the
        list form is not this capability's to call (component design
        section 2.5)."""
        envelope = self._get_one(lambda: self._rest_client.get_ticker_details(symbol, raw=True))
        results = envelope.get("results")
        if results == {} or results == []:
            raise InstrumentNotFound("The provider does not recognise this instrument.")
        return self._validate(models.TickerReference, results)

    # -- fetch_daily_bars (DAC-E3-S1-2, DAC-E3-S1-3) ----------------------

    def fetch_daily_bars(self, symbol: str, start: date, end: date) -> list[models.DailyBar]:
        """Daily aggregates over an inclusive range. Follows paging.

        Requests **unadjusted** bars (`adjusted=False`). Component design
        section 14, open question 3, left this as an owner decision at
        design time -- unadjusted was the design's own stated leaning (it
        suits an append-only point-in-time store per C5, and this component
        acquires corporate actions separately so adjustment can be derived
        at read time). The owner confirmed unadjusted: SDD decision record
        `DEC-0001` in the project's ai-agents SDD harness (a separate repo;
        no `DEC-0001` file exists in this repository).
        """
        rows = follow_pages(
            first_page=lambda: self._through_governor(
                lambda: self._rest_client.get_aggs(
                    symbol,
                    multiplier=1,
                    timespan="day",
                    from_=start.isoformat(),
                    to=end.isoformat(),
                    adjusted=False,
                    raw=True,
                )
            ),
            next_page=self._next_page,
            decode=self._decode,
        )
        return [self._validate(models.DailyBar, row) for row in rows]

    # -- fetch_financials --------------------------------------------------

    def fetch_financials(
        self, symbol: str, start: date, end: date
    ) -> list[models.FinancialStatement]:
        """Company financials. `filing_date` is carried as a descriptive
        attribute and is never the as-of date (C5). Queries all four
        sibling statement endpoints, each constrained by ticker and, for
        the three statements, by period (component design section 2.5;
        the ratios endpoint accepts no period bound)."""
        statements: list[models.FinancialStatement] = []

        for statement_type, sdk_method in (
            ("balance_sheet", self._rest_client.list_financials_balance_sheets),
            ("income_statement", self._rest_client.list_financials_income_statements),
            ("cash_flow_statement", self._rest_client.list_financials_cash_flow_statements),
            ("ratios", self._rest_client.list_financials_ratios),
        ):
            rows = follow_pages(
                first_page=self._financial_page(sdk_method, symbol, start, end),
                next_page=self._next_page,
                decode=self._decode,
            )
            for row in rows:
                statements.append(
                    self._validate(
                        models.FinancialStatement,
                        {**row, "statement_type": statement_type},
                    )
                )

        return statements

    # -- fetch_corporate_actions -------------------------------------------

    def fetch_corporate_actions(
        self, symbol: str, start: date, end: date
    ) -> list[models.CorporateAction]:
        """Splits, dividends, ticker changes and IPOs over a range. Each of
        the four sibling endpoints names its own effective date
        differently; this method supplies `action_type` and `effective_on`
        per row, since neither is on the wire consistently across all four
        (component design section 2.5, models.py `CorporateAction`
        docstring)."""
        actions: list[models.CorporateAction] = []

        actions.extend(
            self._corporate_actions(
                action_type="split",
                effective_date_field="execution_date",
                rows=follow_pages(
                    first_page=lambda: self._through_governor(
                        lambda: self._rest_client.list_stocks_splits(
                            ticker=symbol,
                            execution_date_gte=start.isoformat(),
                            execution_date_lte=end.isoformat(),
                            raw=True,
                        )
                    ),
                    next_page=self._next_page,
                    decode=self._decode,
                ),
            )
        )
        actions.extend(
            self._corporate_actions(
                action_type="dividend",
                effective_date_field="ex_dividend_date",
                rows=follow_pages(
                    first_page=lambda: self._through_governor(
                        lambda: self._rest_client.list_stocks_dividends(
                            ticker=symbol,
                            ex_dividend_date_gte=start.isoformat(),
                            ex_dividend_date_lte=end.isoformat(),
                            raw=True,
                        )
                    ),
                    next_page=self._next_page,
                    decode=self._decode,
                ),
            )
        )
        actions.extend(
            self._corporate_actions(
                action_type="ipo",
                effective_date_field="listing_date",
                rows=follow_pages(
                    first_page=lambda: self._through_governor(
                        lambda: self._rest_client.vx.list_ipos(
                            ticker=symbol,
                            listing_date_gte=start.isoformat(),
                            listing_date_lte=end.isoformat(),
                            raw=True,
                        )
                    ),
                    next_page=self._next_page,
                    decode=self._decode,
                ),
            )
        )

        # Ticker events: no pagination is documented (component design
        # section 2.5), and its response nests rows under
        # `results.events[]` rather than `results` directly. The endpoint
        # takes no date-range parameter (only `ticker` and `types`), so the
        # range is applied client-side against each event's own `date`.
        events_envelope = self._get_one(
            lambda: self._rest_client.get_ticker_events(symbol, types="ticker_change", raw=True)
        )
        all_event_rows = (events_envelope.get("results") or {}).get("events") or []
        event_actions = self._corporate_actions(
            action_type="ticker_change",
            effective_date_field="date",
            rows=all_event_rows,
        )
        actions.extend(action for action in event_actions if start <= action.effective_on <= end)

        return actions

    # -- shared machinery ---------------------------------------------------

    def _corporate_actions(
        self, *, action_type: str, effective_date_field: str, rows: list[dict[str, Any]]
    ) -> list[models.CorporateAction]:
        return [
            self._validate(
                models.CorporateAction,
                {
                    **row,
                    "action_type": action_type,
                    "effective_on": row.get(effective_date_field),
                },
            )
            for row in rows
        ]

    def _financial_page(
        self,
        sdk_method: Callable[..., HTTPResponse],
        symbol: str,
        start: date,
        end: date,
    ) -> Callable[[], HTTPResponse]:
        if sdk_method == self._rest_client.list_financials_ratios:
            # The ratios endpoint selects by `ticker` (singular) and takes no
            # period bound; the SDK rejects the statement endpoints' arguments.
            return lambda: self._through_governor(lambda: sdk_method(ticker=symbol, raw=True))
        return lambda: self._through_governor(
            lambda: sdk_method(
                tickers=symbol,
                period_end_gte=start.isoformat(),
                period_end_lte=end.isoformat(),
                raw=True,
            )
        )

    def _next_page(self, path: str, params: dict[str, str]) -> HTTPResponse:
        """Re-issue a GET against one page's path and query parameters,
        parsed from `next_url` by `paging.follow_pages`. Submitted through
        the governor exactly like the first page (component design section
        2.2b: one permit per page)."""
        return self._through_governor(
            lambda: self._rest_client._get(path=path, params=dict(params), raw=True)
        )

    def _get_one(self, send: Callable[[], HTTPResponse]) -> dict[str, Any]:
        """Issue one ungoverned-shape (non-paged) request through the
        governor and decode its envelope."""
        response = self._through_governor(send)
        return self._decode(response)

    def _through_governor(self, send: Callable[[], HTTPResponse]) -> HTTPResponse:
        def classify(exc: BaseException) -> Outcome:
            if not isinstance(exc, BadResponse):
                return Outcome.RETRYABLE
            if is_rate_limited_body(str(exc)):
                return Outcome.THROTTLED
            error = classify_error_body(str(exc))
            return Outcome.FATAL if is_fatal_for_governor(error) else Outcome.RETRYABLE

        try:
            return self._governor.execute(send, classify)
        except BadResponse as exc:
            raise classify_error_body(str(exc)) from exc

    def _decode(self, response: HTTPResponse) -> dict[str, Any]:
        decoded: dict[str, Any] = json.loads(response.data.decode("utf-8"))
        return decoded

    def _validate(self, model: type[T], raw: Any) -> T:
        try:
            return model.model_validate(raw)  # type: ignore[attr-defined, no-any-return]
        except ValidationError as exc:
            raise wrap_validation_error(exc) from exc
