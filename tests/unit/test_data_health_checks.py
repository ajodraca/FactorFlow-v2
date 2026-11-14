"""Unit tests: the Daily prices and Company financials checks fold (CAP-003-E2-S3).

The fold in ``reader.py`` is driven with hand-built ``coverage-service`` values
and no database.

- TC-COMP-035 (DAC-E2-4; AC-11, AC-24): the Daily prices status and the null gap count.
- TC-COMP-047 (DAC-E2-S3-1, DAC-E2-5; AC-11): counting rules and exception unions.
- DAC-E2-S3-3: the union keeps at most five symbols.
"""

from datetime import UTC, date, datetime, timedelta

import pytest

from factorflow.coverage.service import CoverageView, GapDetection, InstrumentCoverage, Presence
from factorflow.data_health.models import (
    CompanyFinancialsCheck,
    DailyPricesCheck,
    GapDetectionState,
)
from factorflow.data_health.reader import _ChecksFold, _Union

D2, D3, D4, D5 = (date(2024, 1, day) for day in (2, 3, 4, 5))
T1 = datetime(2026, 10, 20, 21, 0, tzinfo=UTC)
T2 = T1 + timedelta(hours=1)
T3 = T1 + timedelta(hours=2)
# Written as a literal so the expected value is independent of the code under test.
REASON = "fewer_than_two_instruments_with_data"


def _stock(
    symbol: str,
    *,
    prices: Presence = Presence.PRESENT,
    fundamentals: Presence = Presence.PRESENT,
    covered_to: date | None = D5,
    missing_days: int | None = 0,
    gaps_available: bool = True,
) -> InstrumentCoverage:
    return InstrumentCoverage(
        symbol=symbol,
        lifecycle="active",
        presence={
            "reference": Presence.PRESENT,
            "prices": prices,
            "fundamentals": fundamentals,
            "corporate_actions": Presence.PRESENT,
        },
        covered_from=D2 if covered_to is not None else None,
        covered_to=covered_to,
        last_acquired_at=None,
        depth_shortfall_years=None,
        gaps=GapDetection(
            gaps_available,
            None if gaps_available else REASON,
            missing_days if gaps_available else None,
        ),
    )


def _unknown(symbol: str, *, gaps_available: bool = True) -> InstrumentCoverage:
    return _stock(
        symbol,
        prices=Presence.UNKNOWN,
        fundamentals=Presence.UNKNOWN,
        covered_to=None,
        missing_days=None,
        gaps_available=gaps_available,
    )


def _absent(symbol: str, *, gaps_available: bool = True) -> InstrumentCoverage:
    return _stock(
        symbol,
        prices=Presence.ABSENT,
        covered_to=None,
        missing_days=None,
        gaps_available=gaps_available,
    )


def _view(
    stocks: list[InstrumentCoverage], *, available: bool = True, next_cursor: str | None = None
) -> CoverageView:
    return CoverageView(
        never_acquired=False,
        gap_detection=GapDetection(
            available, None if available else REASON, 0 if available else None
        ),
        instruments=stocks,
        next_cursor=next_cursor,
    )


def _fold(
    pages: list[CoverageView],
    fundamentals: list[dict[str, tuple[str, datetime]]] | None = None,
    *,
    latest_session: date | None = D5,
) -> _ChecksFold:
    fold = _ChecksFold(latest_session=latest_session)
    for index, page in enumerate(pages):
        fold.add_page(page, fundamentals[index] if fundamentals else {})
    return fold


# Implements TC-COMP-035
@pytest.mark.parametrize(
    ("view", "expected"),
    [
        pytest.param(
            _view([_stock("AAA"), _absent("BBB")]),
            DailyPricesCheck("exceptions", 1, 0, 0, D5, GapDetectionState(True, None), 1, ("BBB",)),
            id="a-absent-only",
        ),
        pytest.param(
            _view([_stock("AAA"), _stock("CCC", covered_to=D4)]),
            DailyPricesCheck("exceptions", 0, 0, 1, D5, GapDetectionState(True, None), 1, ("CCC",)),
            id="b-behind-only",
        ),
        pytest.param(
            _view([_stock("AAA", missing_days=2), _stock("BBB")]),
            DailyPricesCheck("exceptions", 0, 1, 0, D5, GapDetectionState(True, None), 1, ("AAA",)),
            id="c-gaps-only",
        ),
        pytest.param(
            _view([_stock("AAA", gaps_available=False)], available=False),
            DailyPricesCheck(
                "not_determinable", 0, None, 0, D5, GapDetectionState(False, REASON), 0, ()
            ),
            id="d-not-determinable",
        ),
        pytest.param(
            _view([_stock("AAA"), _stock("BBB")]),
            DailyPricesCheck("ok", 0, 0, 0, D5, GapDetectionState(True, None), 0, ()),
            id="e-ok",
        ),
        pytest.param(
            _view(
                [_stock("AAA", gaps_available=False), _absent("BBB", gaps_available=False)],
                available=False,
            ),
            DailyPricesCheck(
                "exceptions", 1, None, 0, D5, GapDetectionState(False, REASON), 1, ("BBB",)
            ),
            id="f-unavailable-and-absent",
        ),
    ],
)
def test_daily_prices_status_and_null_gap_count(
    view: CoverageView, expected: DailyPricesCheck
) -> None:
    assert _fold([view]).daily_prices() == expected


# Implements TC-COMP-047
def test_unknown_presence_counts_as_absent_not_behind() -> None:
    fold = _fold([_view([_stock("AAA"), _unknown("UNK")])])

    assert fold.daily_prices() == DailyPricesCheck(
        "exceptions", 1, 0, 0, D5, GapDetectionState(True, None), 1, ("UNK",)
    )
    assert fold.company_financials() == CompanyFinancialsCheck(
        "exceptions", 1, 0, None, 1, ("UNK",)
    )


# Implements TC-COMP-047
def test_absent_and_failed_is_in_both_counts_and_once_in_the_union() -> None:
    fold = _fold(
        [_view([_stock("FLD", fundamentals=Presence.ABSENT)])],
        [{"FLD": ("failed", T1)}],
    )

    assert fold.company_financials() == CompanyFinancialsCheck(
        "exceptions", 1, 1, None, 1, ("FLD",)
    )


# Implements TC-COMP-047
def test_not_found_is_a_problem_and_written_is_not() -> None:
    fold = _fold(
        [_view([_stock("AAA"), _stock("NFD")])],
        [{"AAA": ("written", T1), "NFD": ("not_found", T2)}],
    )

    assert fold.company_financials() == CompanyFinancialsCheck("exceptions", 0, 1, T1, 1, ("NFD",))


# Implements TC-COMP-047
def test_gaps_and_behind_is_one_stock_in_the_union() -> None:
    fold = _fold([_view([_stock("AAA"), _stock("GBH", covered_to=D4, missing_days=1)])])

    assert fold.daily_prices() == DailyPricesCheck(
        "exceptions", 0, 1, 1, D5, GapDetectionState(True, None), 1, ("GBH",)
    )


# Implements TC-COMP-047
def test_more_than_five_exceptions_across_a_page_boundary_keep_the_first_five() -> None:
    fold = _fold(
        [
            _view([_unknown(s) for s in ("AAA", "BBB", "CCC", "DDD")], next_cursor="DDD"),
            _view([_unknown(s) for s in ("EEE", "FFF", "GGG")]),
        ]
    )
    first_five = ("AAA", "BBB", "CCC", "DDD", "EEE")

    assert fold.daily_prices().exception_symbols == first_five
    assert fold.daily_prices().exception_count == 7
    assert fold.company_financials().exception_symbols == first_five
    assert fold.company_financials().exception_count == 7


def test_union_keeps_at_most_five_symbols() -> None:
    union = _Union()

    for number in range(1, 3001):
        union.add(f"S{number:04d}")
        assert len(union.symbols) <= 5

    assert union.count == 3000
    assert union.symbols == ["S0001", "S0002", "S0003", "S0004", "S0005"]


def test_financials_as_of_is_the_latest_written_across_pages() -> None:
    fold = _fold(
        [
            _view([_stock("AAA"), _stock("BBB")], next_cursor="BBB"),
            _view([_stock("CCC")]),
        ],
        [{"AAA": ("written", T2), "BBB": ("failed", T3)}, {"CCC": ("written", T1)}],
    )

    check = fold.company_financials()
    assert check.as_of == T2
    assert check.problem_count == 1


def test_gap_availability_is_the_conjunction_over_pages() -> None:
    fold = _fold(
        [
            _view([_stock("AAA")], next_cursor="AAA"),
            _view([_stock("BBB", gaps_available=False)], available=False),
        ]
    )

    check = fold.daily_prices()
    assert check.gap_stock_count is None
    assert check.gap_detection == GapDetectionState(False, REASON)
    assert check.status == "not_determinable"


def test_no_prices_anywhere_leaves_latest_session_null() -> None:
    fold = _fold(
        [_view([_unknown("AAA", gaps_available=False)], available=False)], latest_session=None
    )

    assert fold.daily_prices() == DailyPricesCheck(
        "exceptions", 1, None, 0, None, GapDetectionState(False, REASON), 1, ("AAA",)
    )
