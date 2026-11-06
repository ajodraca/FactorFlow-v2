"""The summary read through the application (CAP-002-E3-S5; task plan T013).

Design section 7 rows "Summary shape and current count" and "Summary currency and emptiness";
AC-12, AC-13, AC-20 to AC-22; DAC-E3-11. Claims the CAP-002 integration cases TC-INT-035, 050, 051
and 057 through the `# Implements CAP-002 TC-INT-NNN` markers on its tests.
"""

from collections.abc import Iterator
from decimal import Decimal

import psycopg
import pytest
from fastapi.testclient import TestClient

from tests.integration.api_classification_support import (
    SCORE,
    classification_app,
    complete_set,
    later_set,
)
from tests.integration.reader_seed import insert_classification, seed_inputs, seed_scored_stock

pytestmark = pytest.mark.postgres


@pytest.fixture
def app(
    postgres_connection_string: str, monkeypatch: pytest.MonkeyPatch
) -> Iterator[tuple[TestClient, psycopg.Connection]]:
    with classification_app(postgres_connection_string, monkeypatch) as pair:
        yield pair


# Implements CAP-002 TC-INT-035
def test_the_summary_counts_the_current_stocks(
    app: tuple[TestClient, psycopg.Connection],
) -> None:
    """A missing or outdated input makes a stock not current; `not_computable` does not."""
    client, conn = app
    set_id = complete_set(conn, active_instruments=3)
    for symbol, status in (("AAA", "present"), ("BBB", "missing"), ("CCC", "not_computable")):
        stock = seed_scored_stock(conn, set_id, symbol, value=SCORE)
        seed_inputs(conn, set_id, stock, statuses={"book_to_price": status})
    body = client.get("/api/classifications/summary").json()
    assert body["stocks_current"] == {"current_count": 2, "followed_count": 3}
    assert body["never_classified"] is False
    assert "stocks" not in body


# Implements CAP-002 TC-INT-035
def test_an_outdated_input_makes_a_stock_not_current_and_followed_is_the_set_count(
    app: tuple[TestClient, psycopg.Connection],
) -> None:
    """T013 (1): `outdated` and `missing` count against a stock; `followed_count` is the set's
    `active_instruments`, which need not equal the number of stored stock rows."""
    client, conn = app
    set_id = complete_set(conn, active_instruments=5)
    for symbol, status in (("AAA", "present"), ("BBB", "outdated")):
        stock = seed_scored_stock(conn, set_id, symbol, value=SCORE)
        seed_inputs(conn, set_id, stock, statuses={"book_to_price": status})
    body = client.get("/api/classifications/summary").json()
    assert body["stocks_current"] == {"current_count": 1, "followed_count": 5}


# Implements CAP-002 TC-INT-050
# Implements CAP-002 TC-INT-051
@pytest.mark.parametrize("state", ["building", "failed"])
def test_a_newer_set_is_carried_as_later_and_equals_the_list_read(
    app: tuple[TestClient, psycopg.Connection], state: str
) -> None:
    """DAC-E3-11, T013 (2): `set` and `later` are equal objects on the summary and the list.
    Each state is its own test, so the newer set is the only candidate for `later`."""
    client, conn = app
    set_id = complete_set(conn)
    stock = seed_scored_stock(conn, set_id, "AAA", value=SCORE)
    later = later_set(conn, state)
    for factor in ("value", "growth", "momentum"):  # rows the previous set must not show
        insert_classification(
            conn, later, stock, factor, score=Decimal("9.000000"), percentile=Decimal("99.000000")
        )
    summary = client.get("/api/classifications/summary").json()
    listed = client.get("/api/classifications").json()
    assert summary["set"]["not_current"] is True
    assert summary["later"]["state"] == state
    assert listed["set"]["set_id"] == str(set_id)
    assert [row["symbol"] for row in listed["stocks"]] == ["AAA"]
    cells = listed["stocks"][0]["factors"]
    assert cells["value"]["score"] == "1.250000"  # the previous set's row, not the later set's
    assert "9.000000" not in {c["score"] for c in cells.values()}
    if state == "failed":
        assert summary["later"]["failure_reason"] == "boom"
    assert summary["set"] == listed["set"]
    assert summary["later"] == listed["later"]


# Implements CAP-002 TC-INT-057 (part: the summary body, with the list body's keys)
def test_before_any_complete_set_the_summary_says_nothing_is_classified(
    app: tuple[TestClient, psycopg.Connection],
) -> None:
    """DEC-0140, T013 (3): the zero record, with the same keys as the list read."""
    client, conn = app
    empty = client.get("/api/classifications/summary").json()
    listed_empty = client.get("/api/classifications").json()
    shared = ("never_classified", "set", "later", "factors")
    assert set(shared) <= set(empty) and set(shared) <= set(listed_empty)
    assert {key: empty[key] for key in shared} == {key: listed_empty[key] for key in shared}
    assert empty["never_classified"] is True
    assert empty["set"] is None and empty["stocks_current"] is None and empty["later"] is None
    later_set(conn, "building")
    building = client.get("/api/classifications/summary").json()
    assert building["never_classified"] is True and building["later"]["state"] == "building"
    assert building["factors"] == client.get("/api/classifications").json()["factors"]


def test_a_failed_first_set_leaves_the_summary_never_classified(
    app: tuple[TestClient, psycopg.Connection],
) -> None:
    """T013 (3): a `failed` first set is carried as `later`, and nothing is classified."""
    client, conn = app
    later_set(conn, "failed")
    body = client.get("/api/classifications/summary").json()
    assert body["never_classified"] is True and body["set"] is None
    assert body["later"]["state"] == "failed" and body["later"]["failure_reason"] == "boom"
    assert body["later"] == client.get("/api/classifications").json()["later"]
