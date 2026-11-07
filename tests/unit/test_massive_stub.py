"""Unit tests: the e2e stub provider's status codes for CAP-002's guarded cases.

`tests/e2e/support/massive_stub.py` must answer the way the product reads a
provider (CAP-002-e2e-tests-automation-tasks T002; automation review v3
AR-011; DEC-0047): a 404 for a stock the provider holds no fundamentals for, a
503 for a withheld stock's statements, and price bars from 300 days ago for a
recently listed stock. TC-E2E-001, 009 and 010 are skipped while the payload
keys are unresolved (DEC-0285), so this checks the stub on its own. It calls
`provider_response` directly: no socket, no container.
"""

from __future__ import annotations

import importlib.util
import types
from collections.abc import Iterator
from datetime import UTC, date, datetime, timedelta
from pathlib import Path

import pytest

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
    assert len(body["results"]) == 1


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
