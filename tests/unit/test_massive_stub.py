"""Unit tests: the e2e stub provider's status codes for CAP-002's guarded cases.

`tests/e2e/support/massive_stub.py` must answer the way the product reads a
provider (CAP-002-e2e-tests-automation-tasks T002; automation review v3
AR-011; DEC-0047): a 404 for a stock the provider holds no fundamentals for, a
503 for a withheld stock's statements, and price bars from 300 days ago for a
recently listed stock. It also checks the quarterly statements the stub serves
under the resolved payload keys (T014; DEC-0295). It calls `provider_response`
directly: no socket, no container.
"""

from __future__ import annotations

import importlib.util
import types
from collections.abc import Iterator
from datetime import UTC, date, datetime, timedelta
from pathlib import Path

import pytest

from factorflow.classification.line_items import LINE_ITEMS

REPO_ROOT = Path(__file__).resolve().parents[2]
STUB = REPO_ROOT / "tests/e2e/support/massive_stub.py"

STATEMENT_PATHS = (
    "/stocks/financials/v1/balance-sheets",
    "/stocks/financials/v1/income-statements",
    "/stocks/financials/v1/cash-flow-statements",
)
START = "2023-11-06"


def _load_stub() -> types.ModuleType:
    spec = importlib.util.spec_from_file_location("massive_stub", STUB)
    assert spec is not None and spec.loader is not None
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


@pytest.fixture
def stub() -> Iterator[types.ModuleType]:
    module = _load_stub()
    yield module
    module.STATE.reset()


def _statement(stub: types.ModuleType, path: str, symbol: str) -> int:
    status, _ = stub.provider_response(path, {"ticker": [symbol], "period_end.gte": [START]})
    return int(status)


def _aggs(stub: types.ModuleType, symbol: str, start: str, end: str) -> tuple[int, list[date]]:
    status, body = stub.provider_response(f"/v2/aggs/ticker/{symbol}/range/1/day/{start}/{end}", {})
    days = [datetime.fromtimestamp(bar["t"] / 1000, tz=UTC).date() for bar in body["results"]]
    return int(status), days


@pytest.mark.parametrize("path", STATEMENT_PATHS)
def test_a_nof_stock_answers_not_found_on_every_statement_path(
    stub: types.ModuleType, path: str
) -> None:
    status, body = stub.provider_response(path, {"ticker": ["NOFCCC"]})

    assert status == 404
    assert body == stub.NOT_FOUND


def test_a_nof_stock_answers_its_other_data_types(stub: types.ModuleType) -> None:
    reference, _ = stub.provider_response("/v3/reference/tickers/NOFCCC", {})
    bars, days = _aggs(stub, "NOFCCC", START, "2024-01-31")

    assert reference == 200
    assert bars == 200
    assert days


def test_a_stock_with_statements_answers_them(stub: types.ModuleType) -> None:
    status, body = stub.provider_response(STATEMENT_PATHS[0], {"ticker": ["BBB"]})

    assert status == 200
    assert len(body["results"]) >= 8


@pytest.mark.parametrize("path", STATEMENT_PATHS)
def test_a_withheld_stock_answers_unavailable_on_its_statement_paths(
    stub: types.ModuleType, path: str
) -> None:
    stub.STATE.withhold("BBB")

    status, body = stub.provider_response(path, {"ticker": ["BBB"]})

    assert status == 503
    assert body == stub.UNAVAILABLE


def test_withholding_one_stock_leaves_its_other_data_and_other_stocks_alone(
    stub: types.ModuleType,
) -> None:
    stub.STATE.withhold("BBB")

    reference, _ = stub.provider_response("/v3/reference/tickers/BBB", {})
    bars, _ = _aggs(stub, "BBB", START, "2024-01-31")

    assert reference == 200
    assert bars == 200
    assert _statement(stub, STATEMENT_PATHS[1], "F00") == 200


def test_restore_ends_the_withholding(stub: types.ModuleType) -> None:
    stub.STATE.withhold("BBB")
    stub.STATE.restore("BBB")

    assert _statement(stub, STATEMENT_PATHS[1], "BBB") == 200


def test_reset_ends_every_withholding(stub: types.ModuleType) -> None:
    stub.STATE.withhold("BBB")
    stub.STATE.reset()

    assert _statement(stub, STATEMENT_PATHS[1], "BBB") == 200


def test_a_new_stock_has_prices_from_300_days_ago_only(stub: types.ModuleType) -> None:
    today = date.today()
    start = (today - timedelta(days=3 * 365)).isoformat()

    status, days = _aggs(stub, "NEWAAA", start, today.isoformat())
    _, older = _aggs(stub, "F00", start, today.isoformat())

    assert status == 200
    assert min(days) >= today - timedelta(days=300)
    assert min(days) <= today - timedelta(days=296)
    assert max(days) == max(older)
    assert min(older) <= date.fromisoformat(start) + timedelta(days=3)


def test_a_new_stock_answers_its_statements(stub: types.ModuleType) -> None:
    assert _statement(stub, STATEMENT_PATHS[0], "NEWAAA") == 200


def test_the_no_fundamentals_mode_is_gone(stub: types.ModuleType) -> None:
    with pytest.raises(ValueError, match="unknown mode"):
        stub.STATE.set_mode("no-fundamentals")


# --- T014: quarterly statements under the resolved keys (DEC-0295) -----------------------

TYPES = dict(
    zip(STATEMENT_PATHS, ("balance_sheet", "income_statement", "cash_flow_statement"), strict=True)
)


def _rows(stub: types.ModuleType, path: str, symbol: str, gte: str, lte: str) -> list[dict]:
    status, body = stub.provider_response(
        path, {"ticker": [symbol], "period_end.gte": [gte], "period_end.lte": [lte]}
    )
    assert status == 200
    rows: list[dict] = body["results"]
    return rows


@pytest.mark.parametrize("path", STATEMENT_PATHS)
def test_each_statement_carries_its_types_resolved_keys(stub: types.ModuleType, path: str) -> None:
    statement_type = TYPES[path]
    keys = {i.payload_key for i in LINE_ITEMS.values() if i.statement_type == statement_type}

    rows = _rows(stub, path, "F00", "2023-11-07", "2026-11-07")

    for row in rows:
        assert row["statement_type"] == statement_type
        assert row["timeframe"] == "quarterly"
        assert keys <= row.keys()
        assert not (row.keys() & ({i.payload_key for i in LINE_ITEMS.values()} - keys))


def test_a_three_year_window_holds_eight_consecutive_filed_quarters(
    stub: types.ModuleType,
) -> None:
    rows = _rows(stub, STATEMENT_PATHS[1], "F00", "2023-11-07", "2026-11-07")
    ends = [date.fromisoformat(row["period_end"]) for row in rows]

    assert len(ends) >= 8
    assert ends[-1] >= date(2026, 11, 7) - timedelta(days=183)
    assert all(
        later - earlier <= timedelta(days=92)
        for earlier, later in zip(ends, ends[1:], strict=False)
    )
    assert all(date.fromisoformat(row["filing_date"]) <= date(2026, 11, 7) for row in rows)
    assert [row["fiscal_quarter"] for row in rows[:4]] == [
        (end.month - 1) // 3 + 1 for end in ends[:4]
    ]


def test_values_are_positive_growing_and_differ_by_symbol(stub: types.ModuleType) -> None:
    income = {
        symbol: _rows(stub, STATEMENT_PATHS[1], symbol, "2023-11-07", "2026-11-07")
        for symbol in ("F00", "F01")
    }
    cash = _rows(stub, STATEMENT_PATHS[2], "F00", "2023-11-07", "2026-11-07")
    revenue = [row["revenue"] for row in income["F00"]]

    assert all(value > 0 for value in revenue)
    assert revenue == sorted(revenue) and len(set(revenue)) == len(revenue)
    assert income["F00"][-1]["revenue"] != income["F01"][-1]["revenue"]
    assert all(row["purchase_of_property_plant_and_equipment"] < 0 for row in cash)
    assert all(row["net_cash_from_operating_activities"] > 0 for row in cash)


def test_repeated_requests_agree(stub: types.ModuleType) -> None:
    first = _rows(stub, STATEMENT_PATHS[0], "BBB", "2023-11-07", "2026-11-07")

    assert _rows(stub, STATEMENT_PATHS[0], "BBB", "2023-11-07", "2026-11-07") == first
