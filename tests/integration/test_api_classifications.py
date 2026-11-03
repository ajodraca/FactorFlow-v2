"""The classification routes against PostgreSQL (CAP-002-E3-S5; task plan T012).

Design section 7 rows "Classification list shape" to "Sets"; AC-9, AC-14 to AC-18, AC-20 to
AC-23; DAC-E3-7. Overlaps TC-INT-027, 033, 037 to 048, 055 to 058 (cited, not claimed). Each test
seeds through `reader_seed` (which commits) and calls the real application.
"""

import base64
import json
from collections.abc import Iterator
from decimal import Decimal

import psycopg
import pytest
from fastapi.testclient import TestClient

from tests.integration.api_classification_support import (
    SCORE,
    T0,
    T1,
    classification_app,
    complete_set,
    later_set,
)
from tests.integration.reader_seed import (
    insert_classification,
    insert_instrument,
    insert_run,
    insert_set,
    insert_universe,
    retire_universe,
    seed_inputs,
    seed_scored_stock,
)

pytestmark = pytest.mark.postgres

App = tuple[TestClient, psycopg.Connection]
LOW = (Decimal("-0.500000"), Decimal("10.000000"))


@pytest.fixture
def app(postgres_connection_string: str, monkeypatch: pytest.MonkeyPatch) -> Iterator[App]:
    with classification_app(postgres_connection_string, monkeypatch) as pair:
        yield pair


def _symbols(body: dict[str, object]) -> list[str]:
    return [stock["symbol"] for stock in body["stocks"]]  # type: ignore[attr-defined]


def test_the_list_carries_the_set_the_factors_and_string_scores(app: App) -> None:
    client, conn = app
    set_id = complete_set(conn)
    seed_scored_stock(conn, set_id, "AAA", value=SCORE, name="Alpha Inc")
    body = client.get("/api/classifications").json()
    assert body["set"]["set_id"] == str(set_id) and body["set"]["not_current"] is False
    assert body["later"] is None and body["factors"]["value"]["min_peer_set_size"] == 30
    assert body["match_count"] == 1 and body["next_cursor"] is None
    stock = body["stocks"][0]
    assert (stock["symbol"], stock["name"]) == ("AAA", "Alpha Inc")
    assert stock["factors"]["value"]["score"] == "1.250000"
    later_set(conn, "building")
    newer = client.get("/api/classifications").json()
    assert newer["set"]["not_current"] is True and newer["later"]["state"] == "building"


def test_the_match_count_covers_the_whole_set_on_every_page(app: App) -> None:
    client, conn = app
    set_id = complete_set(conn, active_instruments=7)
    for index in range(7):
        seed_scored_stock(conn, set_id, f"S{index}", value=SCORE)
    seen: list[str] = []
    cursor = None
    pages = 0
    while True:
        params = {"limit": 3, **({"cursor": cursor} if cursor else {})}
        body = client.get("/api/classifications", params=params).json()
        assert body["match_count"] == 7
        seen += _symbols(body)
        pages += 1
        cursor = body["next_cursor"]
        if cursor is None:
            break
    assert pages == 3 and sorted(seen) == sorted(set(seen)) and len(seen) == 7


def test_thresholds_and_hide_incomplete_follow_the_documented_rule(app: App) -> None:
    client, conn = app
    set_id = complete_set(conn)
    seed_scored_stock(conn, set_id, "AAA", value=SCORE)
    seed_scored_stock(conn, set_id, "BBB", value=("input_missing", "book_to_price"))
    seed_scored_stock(conn, set_id, "CCC", value=("not_enough_stocks", None))
    assert _symbols(client.get("/api/classifications").json()) == ["AAA", "BBB", "CCC"]
    hidden = client.get("/api/classifications", params={"hide_incomplete": "true"}).json()
    assert _symbols(hidden) == ["AAA", "CCC"]
    bound = client.get("/api/classifications", params={"value_percentile_min": "90"}).json()
    assert "AAA" not in _symbols(bound)
    assert {"BBB", "CCC"} <= set(_symbols(bound))


def test_nothing_classified_says_so(app: App) -> None:
    client, conn = app
    empty = client.get("/api/classifications").json()
    assert empty["never_classified"] is True and empty["set"] is None and empty["later"] is None
    assert empty["match_count"] == 0 and empty["stocks"] == []
    later_set(conn, "building")
    assert client.get("/api/classifications").json()["later"]["state"] == "building"


def test_sort_orders_and_bad_input_is_422(app: App) -> None:
    client, conn = app
    set_id = complete_set(conn)
    seed_scored_stock(conn, set_id, "AAA", value=LOW)
    seed_scored_stock(conn, set_id, "BBB", value=SCORE)
    seed_scored_stock(conn, set_id, "CCC", value=("not_enough_stocks", None))
    body = client.get("/api/classifications", params={"sort": "value_score", "order": "desc"})
    assert _symbols(body.json()) == ["BBB", "AAA", "CCC"]
    assert client.get("/api/classifications", params={"sort": "other"}).status_code == 422
    assert (
        client.get("/api/classifications", params={"value_percentile_min": "101"}).status_code
        == 422
    )


def test_a_universe_scopes_the_list_and_an_unknown_one_is_404(app: App) -> None:
    client, conn = app
    set_id = complete_set(conn)
    inside = seed_scored_stock(conn, set_id, "AAA", value=SCORE)
    seed_scored_stock(conn, set_id, "BBB", value=SCORE)
    retired = seed_scored_stock(conn, set_id, "OLD", value=SCORE, lifecycle="retired")
    universe_id = insert_universe(conn, "Mine", [inside, retired])
    scoped = client.get("/api/classifications", params={"universe_id": str(universe_id)}).json()
    assert _symbols(scoped) == ["AAA", "OLD"]
    assert "OLD" not in _symbols(client.get("/api/classifications").json())
    retire_universe(conn, universe_id)
    assert (
        client.get("/api/classifications", params={"universe_id": str(universe_id)}).status_code
        == 200
    )
    missing = client.get(
        "/api/classifications", params={"universe_id": "00000000-0000-0000-0000-000000000000"}
    )
    assert missing.status_code == 404 and missing.json()["error"]["code"] == "universe_not_found"


def test_compare_reports_unknown_symbols_and_enforces_its_bounds(app: App) -> None:
    client, conn = app
    set_id = complete_set(conn)
    seed_scored_stock(conn, set_id, "AAA", value=SCORE)
    seed_scored_stock(conn, set_id, "BBB", value=SCORE)
    body = client.get("/api/classifications", params={"symbols": "AAA,BBB,NOPE"}).json()
    assert _symbols(body) == ["AAA", "BBB"] and body["unknown_symbols"] == ["NOPE"]
    for symbols in ("AAA", "A1,A2,A3,A4,A5,A6,A7"):
        response = client.get("/api/classifications", params={"symbols": symbols})
        assert response.status_code == 422 and "`symbols`" in response.json()["error"]["message"]


def test_the_evidence_shows_inputs_with_their_dates_and_memberships(app: App) -> None:
    client, conn = app
    empty = client.get("/api/classifications/stocks/AAA")
    assert empty.status_code == 404 and empty.json()["error"]["code"] == "instrument_not_found"
    set_id = complete_set(conn)
    stock = seed_scored_stock(conn, set_id, "AAA", value=SCORE)
    seed_inputs(conn, set_id, stock)
    insert_universe(conn, "Mine", [stock])
    body = client.get("/api/classifications/stocks/aaa").json()
    assert body["set"]["set_id"] == str(set_id) and len(body["inputs"]) == 8
    assert {"factor", "input_name", "label", "status", "value", "as_of", "known_on"} <= set(
        body["inputs"][0]
    )
    assert [m["name"] for m in body["memberships"]] == ["Mine"]
    assert set(body["factors"]) == {"value", "growth", "momentum"}


def test_the_history_lists_earlier_sets_newest_first_without_the_current_one(app: App) -> None:
    client, conn = app
    first = complete_set(conn, started_at=T0.replace(day=10))
    second = complete_set(conn, started_at=T0.replace(day=12))
    current = complete_set(conn, started_at=T0)
    stock = insert_instrument(conn, "AAA")
    for set_id in (first, second, current):
        for factor in ("value", "growth", "momentum"):
            insert_classification(conn, set_id, stock, factor, score=SCORE[0], percentile=SCORE[1])
    body = client.get("/api/classifications/stocks/AAA/history").json()
    assert body["symbol"] == "AAA"
    assert [s["set_id"] for s in body["sets"]] == [str(second), str(first)]
    assert body["sets"][0]["factors"]["value"]["score"] == "1.250000"
    assert client.get("/api/classifications/stocks/NOPE/history").status_code == 404


def test_the_sets_list_and_detail_agree(app: App) -> None:
    client, conn = app
    done = complete_set(conn)
    later_set(conn, "failed")
    run = insert_run(conn, "running", started_at=T1.replace(day=20))
    insert_set(conn, run, "building", started_at=T1.replace(day=20))
    body = client.get("/api/classifications/sets").json()
    assert [s["state"] for s in body["sets"]][-1] == "complete"
    assert all("run_started_at" in s for s in body["sets"])
    failed = next(s for s in body["sets"] if s["state"] == "failed")
    assert failed["failure_reason"] == "boom" and failed["ended_at"] is not None
    detail = client.get(f"/api/classifications/sets/{done}").json()
    assert detail == next(s for s in body["sets"] if s["set_id"] == str(done))
    missing = client.get("/api/classifications/sets/00000000-0000-0000-0000-000000000000")
    assert missing.status_code == 404
    assert missing.json()["error"]["code"] == "classification_set_not_found"


def test_page_bounds(app: App) -> None:
    client, conn = app
    complete_set(conn)
    for path in ("/api/classifications", "/api/classifications/sets"):
        assert client.get(path, params={"limit": 500}).status_code == 200
        assert client.get(path, params={"limit": 501}).status_code == 422
    assert client.get("/api/classifications/stocks/AAA/history?limit=501").status_code == 422


def _forged(cursor: str) -> str:
    payload = json.loads(base64.urlsafe_b64decode(cursor + "=" * (-len(cursor) % 4)))
    del payload["sym"]
    text = json.dumps(payload, separators=(",", ":"))
    return base64.urlsafe_b64encode(text.encode()).decode().rstrip("=")


def test_an_altered_cursor_is_invalid_and_one_for_an_older_set_is_stale(app: App) -> None:
    client, conn = app
    set_id = complete_set(conn, active_instruments=3)
    for symbol in ("AAA", "BBB", "CCC"):
        seed_scored_stock(conn, set_id, symbol, value=SCORE)
    cursor = client.get("/api/classifications", params={"limit": 1}).json()["next_cursor"]
    altered = client.get("/api/classifications", params={"cursor": _forged(cursor)})
    assert altered.status_code == 422 and altered.json()["error"]["code"] == "cursor_invalid"
    complete_set(conn, started_at=T1)
    stale = client.get("/api/classifications", params={"cursor": cursor})
    assert stale.status_code == 422 and stale.json()["error"]["code"] == "cursor_stale"
