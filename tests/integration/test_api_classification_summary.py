"""The summary read through the application (CAP-002-E3-S5; task plan T013).

Design section 7 rows "Summary shape and current count" and "Summary currency and emptiness";
AC-12, AC-13, AC-20 to AC-22; DAC-E3-11. Overlaps TC-INT-035, 050, 051, 057 (cited, not claimed).
"""

from collections.abc import Iterator

import psycopg
import pytest
from fastapi.testclient import TestClient

from tests.integration.api_classification_support import (
    SCORE,
    classification_app,
    complete_set,
    later_set,
)
from tests.integration.reader_seed import seed_inputs, seed_scored_stock

pytestmark = pytest.mark.postgres


@pytest.fixture
def app(
    postgres_connection_string: str, monkeypatch: pytest.MonkeyPatch
) -> Iterator[tuple[TestClient, psycopg.Connection]]:
    with classification_app(postgres_connection_string, monkeypatch) as pair:
        yield pair


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


def test_a_newer_set_is_carried_as_later_and_equals_the_list_read(
    app: tuple[TestClient, psycopg.Connection],
) -> None:
    """DAC-E3-11: `set` and `later` are equal objects on the summary and the list."""
    client, conn = app
    set_id = complete_set(conn)
    seed_scored_stock(conn, set_id, "AAA", value=SCORE)
    for state in ("building", "failed"):
        later_set(conn, state)
        summary = client.get("/api/classifications/summary").json()
        listed = client.get("/api/classifications").json()
        assert summary["set"]["not_current"] is True
        assert summary["later"]["state"] == state
        assert summary["set"] == listed["set"]
        assert summary["later"] == listed["later"]


def test_before_any_complete_set_the_summary_says_nothing_is_classified(
    app: tuple[TestClient, psycopg.Connection],
) -> None:
    """DEC-0140: the zero record, with the same keys as the list read."""
    client, conn = app
    empty = client.get("/api/classifications/summary").json()
    assert empty["never_classified"] is True
    assert empty["set"] is None and empty["stocks_current"] is None and empty["later"] is None
    later_set(conn, "building")
    building = client.get("/api/classifications/summary").json()
    assert building["never_classified"] is True and building["later"]["state"] == "building"
    assert building["factors"] == client.get("/api/classifications").json()["factors"]
