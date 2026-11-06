"""The evidence read over a set the engine built (CAP-002 integration plan, T013).

The API suites seed ``classification_set`` rows directly, so they prove the routes and the
reader and never the build. Each test here builds a set with the real stages
(``engine.build``) from acquired rows, then reads it through the real application. The line
items carry their test keys (DEC-0286): these tests prove engine and API behaviour over test
keys, not the real provider payload keys.
"""

from collections.abc import Iterator
from datetime import date, timedelta
from decimal import Decimal
from typing import Any
from uuid import UUID

import psycopg
import pytest
from fastapi.testclient import TestClient

from factorflow.classification import engine
from factorflow.classification.constants import INPUT_LABELS, INPUT_NAMES
from tests.integration.api_classification_support import classification_app
from tests.integration.engine_inputs_support import (
    add_bar,
    add_building_set,
    add_instrument,
    add_quarters,
    add_run,
    install_test_line_items,
    migrate_through_classification,
)
from tests.integration.engine_proof_support import populate_volume

pytestmark = pytest.mark.postgres

FLOOR = 30  # the peer-set floor; a factor ranks only from this many qualifying stocks
LAST_SESSION = date(2026, 11, 13)  # a Friday; the roster's classification date


@pytest.fixture
def conn(postgres_connection_string: str) -> Iterator[psycopg.Connection]:
    connection = migrate_through_classification(postgres_connection_string)
    try:
        yield connection
    finally:
        connection.close()


def build_set(conn: psycopg.Connection, classification_date: date) -> UUID:
    """Build a set dated ``classification_date`` with the real stages and floor."""
    set_id = add_building_set(conn, add_run(conn), classification_date)
    result = engine.build(conn, set_id, 120)
    assert result.state == "complete", result.failure_reason
    return set_id


def add_stock(
    conn: psycopg.Connection,
    symbol: str,
    latest_period_end: date,
    latest_trading_day: date,
    quarters: int = 8,
) -> int:
    """An active stock with one bar on ``latest_trading_day`` and ``quarters`` quarterly
    statements of each type, the newest ending ``latest_period_end``."""
    stock = add_instrument(conn, symbol)
    add_bar(conn, stock, latest_trading_day)
    values: list[dict[str, Any]] = [
        {
            "book_equity": Decimal(500),
            "shares_outstanding": Decimal(100),
            "net_income": Decimal(10 + k),
            "diluted_eps": Decimal(1 + k),
            "revenue": Decimal(100 + k),
            "operating_cash_flow": Decimal(30),
            "capital_expenditure": Decimal(-5),
        }
        for k in range(quarters)
    ]
    add_quarters(conn, stock, latest_period_end, quarters, values)
    return stock


def evidence(client: TestClient, symbol: str) -> dict[str, Any]:
    response = client.get(f"/api/classifications/stocks/{symbol}")
    assert response.status_code == 200, response.text
    body: dict[str, Any] = response.json()
    return body


def add_roster(conn: psycopg.Connection, count: int, last_session: date) -> list[int]:
    """``count`` active stocks holding every input; the line items must already be installed."""
    ids, _ = populate_volume(conn, count, last_session=last_session)
    return ids


# Implements CAP-002 TC-INT-025
def test_evidence_lists_the_eight_inputs_from_a_build(
    conn: psycopg.Connection, postgres_connection_string: str, monkeypatch: pytest.MonkeyPatch
) -> None:
    install_test_line_items(monkeypatch)
    add_roster(conn, FLOOR, LAST_SESSION)
    set_id = build_set(conn, LAST_SESSION)

    with classification_app(postgres_connection_string, monkeypatch) as (client, _reader):
        body = evidence(client, "V00005")

    assert body["set"]["set_id"] == str(set_id)
    inputs = body["inputs"]
    assert len(inputs) == 8
    grouped = {
        factor: [i["input_name"] for i in inputs if i["factor"] == factor] for factor in INPUT_NAMES
    }
    assert grouped == {factor: list(names) for factor, names in INPUT_NAMES.items()}
    for row in inputs:
        assert row["status"] == "present", row
        assert row["value"] is not None
        assert row["as_of"] is not None and row["known_on"] is not None
    assert {f: c["status"] for f, c in body["factors"].items()} == {
        "value": "classified",
        "growth": "classified",
        "momentum": "classified",
    }


# Implements CAP-002 TC-INT-032
def test_a_missing_value_input_is_named_and_the_other_factors_still_score(
    conn: psycopg.Connection, postgres_connection_string: str, monkeypatch: pytest.MonkeyPatch
) -> None:
    install_test_line_items(monkeypatch)
    # One stock above the floor, so the 30 others still rank value without the victim.
    ids = add_roster(conn, FLOOR + 1, LAST_SESSION)
    victim = ids[0]  # test setup on the throwaway store: this stock files no cash-flow statement
    conn.execute(
        "DELETE FROM fundamental_observation "
        "WHERE instrument_id = %s AND statement_type = 'cash_flow_statement'",
        (victim,),
    )
    conn.commit()
    build_set(conn, LAST_SESSION)

    with classification_app(postgres_connection_string, monkeypatch) as (client, _reader):
        body = evidence(client, "V00001")

    value = body["factors"]["value"]
    assert (value["status"], value["reason_code"]) == ("not_classified", "input_missing")
    assert value["reason_input"] == "fcf_yield"
    assert value["score"] is None and value["percentile"] is None
    assert INPUT_LABELS["fcf_yield"] in value["reason_detail"]
    by_name = {row["input_name"]: row for row in body["inputs"]}
    assert by_name["fcf_yield"]["status"] == "missing" and by_name["fcf_yield"]["value"] is None
    for factor in ("growth", "momentum"):
        cell = body["factors"][factor]
        assert cell["status"] == "classified", cell
        assert cell["score"] is not None and cell["percentile"] is not None


# Implements CAP-002 TC-INT-034
def test_a_fundamental_one_day_past_six_months_is_outdated_and_exactly_six_months_is_present(
    conn: psycopg.Connection, postgres_connection_string: str, monkeypatch: pytest.MonkeyPatch
) -> None:
    install_test_line_items(monkeypatch)
    classification_date = LAST_SESSION
    exactly_six_months = date(2026, 5, 13)  # the classification date less 6 months
    add_roster(conn, FLOOR, LAST_SESSION)  # fresh peers, so the factors can rank
    add_stock(conn, "AAA", exactly_six_months - timedelta(days=1), LAST_SESSION)
    add_stock(conn, "BBB", exactly_six_months, LAST_SESSION)
    build_set(conn, classification_date)

    with classification_app(postgres_connection_string, monkeypatch) as (client, _reader):
        outdated = evidence(client, "AAA")
        present = evidence(client, "BBB")

    fundamentals = ("book_to_price", "earnings_yield", "fcf_yield", "revenue_growth", "eps_growth")
    rows = {row["input_name"]: row for row in outdated["inputs"]}
    for name in fundamentals:
        assert rows[name]["status"] == "outdated", name
    for factor in ("value", "growth"):
        cell = outdated["factors"][factor]
        assert (cell["status"], cell["reason_code"]) == ("not_classified", "input_outdated")
        assert cell["reason_input"] in INPUT_NAMES[factor]
        assert INPUT_LABELS[cell["reason_input"]] in cell["reason_detail"]
    rows = {row["input_name"]: row for row in present["inputs"]}
    for name in fundamentals:
        assert rows[name]["status"] == "present", name
    for factor in ("value", "growth"):
        assert present["factors"][factor]["status"] == "classified", factor
