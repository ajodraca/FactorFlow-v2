"""The classification routes against PostgreSQL (CAP-002-E3-S5; task plan T012).

Design section 7 rows "Classification list shape" to "Sets"; AC-9, AC-14 to AC-18, AC-20 to
AC-23; DAC-E3-7. Claims the CAP-002 integration cases its tests carry a
`# Implements CAP-002 TC-INT-NNN` marker for; overlapping cases without a marker are cited, not
claimed. Each test seeds through `reader_seed` (which commits) and calls the real application.
"""

import base64
import json
from collections.abc import Iterator
from decimal import Decimal

import psycopg
import pytest
from fastapi.testclient import TestClient

from factorflow.classification.constants import FACTORS, INPUT_NAMES
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


# Implements CAP-002 TC-INT-027
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
    block = body["set"]
    assert block["run_started_at"] == "2026-10-15T21:00:00Z"
    assert block["ended_at"] == "2026-10-15T21:05:00Z" and block["active_instruments"] == 3
    assert stock["lifecycle"] == "active" and stock["factors"]["value"]["percentile"] == "87.500000"
    later_set(conn, "building")
    newer = client.get("/api/classifications").json()
    assert newer["set"]["not_current"] is True and newer["later"]["state"] == "building"
    assert newer["later"]["run_started_at"] == "2026-10-16T14:30:00Z"


def _factor_numbers(stock: dict[str, object]) -> dict[str, tuple[object, object]]:
    return {
        factor: (cell["score"], cell["percentile"])  # type: ignore[index]
        for factor, cell in stock["factors"].items()  # type: ignore[attr-defined]
    }


# Implements CAP-002 TC-INT-026
def test_a_stocks_scores_are_the_same_unscoped_and_in_each_universe(app: App) -> None:
    client, conn = app
    set_id = complete_set(conn)
    momentum = (Decimal("0.300000"), Decimal("55.000000"))
    stock = seed_scored_stock(conn, set_id, "AAA", value=SCORE, growth=LOW, momentum=momentum)
    seed_scored_stock(conn, set_id, "BBB", value=LOW, growth=SCORE, momentum=SCORE)
    first = insert_universe(conn, "U1", [stock])
    second = insert_universe(conn, "U2", [stock, insert_instrument(conn, "CCC")])

    reads = [
        client.get("/api/classifications", params=params).json()
        for params in ({}, {"universe_id": str(first)}, {"universe_id": str(second)})
    ]

    numbers = []
    for body in reads:
        row = next(s for s in body["stocks"] if s["symbol"] == "AAA")
        numbers.append(_factor_numbers(row))
    assert numbers[0] == numbers[1] == numbers[2]
    assert numbers[0]["value"] == ("1.250000", "87.500000")
    assert numbers[0]["growth"] == ("-0.500000", "10.000000")
    assert [len(body["stocks"]) for body in reads] == [2, 1, 1]  # the scope changed, not the cells


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


# Implements CAP-002 TC-INT-033
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
    assert bound["match_count"] == 2
    seed_scored_stock(conn, set_id, "DDD", value=LOW)  # classified, percentile 10
    fifty = client.get("/api/classifications", params={"value_percentile_min": "50"}).json()
    assert _symbols(fifty) == ["AAA", "BBB", "CCC"]  # the classified stock below 50 is excluded
    assert fifty["match_count"] == 3


def test_filters_change_the_match_count_identically_on_every_page(app: App) -> None:
    """Design section 7, "Match count is over the whole set": the filtered total is on each page."""
    client, conn = app
    set_id = complete_set(conn, active_instruments=8)
    for index in range(4):
        seed_scored_stock(conn, set_id, f"H{index}", value=SCORE)
    seed_scored_stock(conn, set_id, "HX", value=("input_missing", "book_to_price"))
    seed_scored_stock(conn, set_id, "ZZZ", value=SCORE)
    seed_scored_stock(conn, set_id, "LOW1", value=LOW)
    seed_scored_stock(conn, set_id, "LOW2", value=LOW)
    filters: dict[str, str] = {"value_percentile_min": "50"}
    # HX passes the threshold with an input reason and ZZZ under another prefix, so each
    # variant moves the count away from the threshold alone's 6.
    for extra, count in (({}, 6), ({"hide_incomplete": "true"}, 5), ({"symbol": "h"}, 5)):
        params = {**filters, **extra, "limit": 2}
        first = client.get("/api/classifications", params=params).json()
        second = client.get(
            "/api/classifications", params={**params, "cursor": first["next_cursor"]}
        ).json()
        assert first["match_count"] == second["match_count"] == count, extra
    zero = client.get("/api/classifications", params={"value_score_min": "0"}).json()
    assert _symbols(zero) == ["H0", "H1", "H2", "H3", "HX", "ZZZ"] and zero["match_count"] == 6


# Implements CAP-002 TC-INT-057 (part: the list body)
def test_nothing_classified_says_so(app: App) -> None:
    client, conn = app
    empty = client.get("/api/classifications").json()
    assert empty["never_classified"] is True and empty["set"] is None and empty["later"] is None
    assert empty["match_count"] == 0 and empty["stocks"] == []
    summary = client.get("/api/classifications/summary").json()
    shared = ("never_classified", "set", "later", "factors")
    assert {key: empty[key] for key in shared} == {key: summary[key] for key in shared}
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


def _seed_unranked_growth(conn: psycopg.Connection, set_id: object, symbol: str) -> None:
    """A stock whose growth the engine left unranked ("29 of 30 stocks qualified") and whose
    other factors are scored."""
    stock = insert_instrument(conn, symbol)
    for factor in ("value", "momentum"):
        insert_classification(
            conn,
            set_id,
            stock,
            factor,
            score=SCORE[0],
            percentile=SCORE[1],  # type: ignore[arg-type]
        )
    insert_classification(
        conn,
        set_id,  # type: ignore[arg-type]
        stock,
        "growth",
        "not_classified",
        reason_code="not_enough_stocks",
        reason_detail="29 of 30 stocks qualified",
    )


# Implements CAP-002 TC-INT-036
def test_fewer_than_thirty_qualifying_stocks_show_no_growth_score(app: App) -> None:
    client, conn = app
    set_id = complete_set(
        conn,
        active_instruments=29,
        factors={"value": (40, True), "growth": (29, False), "momentum": (40, True)},
    )
    for index in range(29):
        _seed_unranked_growth(conn, set_id, f"S{index:02d}")

    listed = client.get("/api/classifications", params={"limit": 50}).json()
    summary = client.get("/api/classifications/summary").json()

    assert listed["match_count"] == 29
    for stock in listed["stocks"]:
        growth = stock["factors"]["growth"]
        assert growth["status"] == "not_classified"
        assert growth["reason_code"] == "not_enough_stocks"
        assert growth["score"] is None and growth["percentile"] is None
        assert "29 of 30" in growth["reason_detail"]
        assert stock["factors"]["value"]["status"] == "classified"
        assert stock["factors"]["momentum"]["status"] == "classified"
    for body in (listed, summary):
        assert body["factors"]["growth"]["ranked"] is False
        assert body["factors"]["growth"]["qualified_count"] == 29
        assert body["factors"]["value"]["ranked"] is True


# Implements CAP-002 TC-INT-037
def test_a_retired_stock_is_hidden_unscoped_and_retired_in_its_universe(app: App) -> None:
    client, conn = app
    set_id = complete_set(conn)
    active = seed_scored_stock(conn, set_id, "AAA", value=SCORE)
    retired = ("retired", None)
    gone = seed_scored_stock(
        conn, set_id, "RRR", value=retired, growth=retired, momentum=retired, lifecycle="retired"
    )
    universe_id = insert_universe(conn, "U", [active, gone])

    unscoped = client.get("/api/classifications").json()
    scoped = client.get("/api/classifications", params={"universe_id": str(universe_id)}).json()

    assert _symbols(unscoped) == ["AAA"]
    assert _symbols(scoped) == ["AAA", "RRR"]
    row = scoped["stocks"][1]
    assert row["lifecycle"] == "retired"
    for cell in row["factors"].values():
        assert (cell["status"], cell["reason_code"]) == ("not_classified", "retired")
        assert cell["score"] is None and cell["percentile"] is None


# Implements CAP-002 TC-INT-039
def test_a_sorted_list_pages_with_a_stable_match_count(app: App) -> None:
    client, conn = app
    set_id = complete_set(conn, active_instruments=25)
    for number in range(1, 26):
        seed_scored_stock(
            conn,
            set_id,
            f"S{number:02d}",
            value=(Decimal(number), Decimal(number)),
        )
    seen: list[str] = []
    cursor = None
    sizes: list[int] = []
    while True:
        params = {"sort": "value_percentile", "order": "desc", "limit": 10}
        body = client.get(
            "/api/classifications", params={**params, **({"cursor": cursor} if cursor else {})}
        ).json()
        assert body["match_count"] == 25
        sizes.append(len(body["stocks"]))
        seen += _symbols(body)
        cursor = body["next_cursor"]
        if cursor is None:
            break
    assert sizes == [10, 10, 5]
    assert seen == [f"S{number:02d}" for number in range(25, 0, -1)]


# Implements CAP-002 TC-INT-043
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


# Implements CAP-002 TC-INT-038
# Implements CAP-002 TC-INT-040
# Implements CAP-002 TC-INT-041
def test_compare_reports_unknown_symbols_and_enforces_its_bounds(app: App) -> None:
    client, conn = app
    set_id = complete_set(conn)
    seed_scored_stock(conn, set_id, "AAA", value=SCORE)
    seed_scored_stock(conn, set_id, "BBB", value=SCORE)
    body = client.get("/api/classifications", params={"symbols": "AAA,BBB,NOPE"}).json()
    assert _symbols(body) == ["AAA", "BBB"] and body["unknown_symbols"] == ["NOPE"]
    retired = ("retired", None)
    seed_scored_stock(
        conn, set_id, "OLD", value=retired, growth=retired, momentum=retired, lifecycle="retired"
    )
    kept = client.get("/api/classifications", params={"symbols": "AAA,OLD"}).json()
    assert _symbols(kept) == ["AAA", "OLD"] and kept["unknown_symbols"] == []
    old = kept["stocks"][1]
    assert old["lifecycle"] == "retired"
    assert {cell["status"] for cell in old["factors"].values()} == {"not_classified"}
    assert {cell["reason_code"] for cell in old["factors"].values()} == {"retired"}
    for symbols in ("AAA", "A1,A2,A3,A4,A5,A6,A7"):
        response = client.get("/api/classifications", params={"symbols": symbols})
        assert response.status_code == 422 and "`symbols`" in response.json()["error"]["message"]


# Implements CAP-002 TC-INT-044
# Implements CAP-002 TC-INT-045
def test_the_evidence_shows_inputs_with_their_dates_and_memberships(app: App) -> None:
    client, conn = app
    empty = client.get("/api/classifications/stocks/AAA")
    assert empty.status_code == 404 and empty.json()["error"]["code"] == "instrument_not_found"
    set_id = complete_set(conn)
    stock = seed_scored_stock(conn, set_id, "AAA", value=SCORE)
    names = [name for factor in FACTORS for name in INPUT_NAMES[factor]]
    values = {name: Decimal(index) + Decimal("0.25") for index, name in enumerate(names, start=1)}
    seed_inputs(conn, set_id, stock, values=values)
    insert_universe(conn, "Mine", [stock])
    body = client.get("/api/classifications/stocks/aaa").json()
    assert body["set"]["set_id"] == str(set_id) and len(body["inputs"]) == 8
    stored = {
        row[0]: row[1:]
        for row in conn.execute(
            "SELECT input_name, value, as_of, known_on FROM factor_input "
            "WHERE set_id = %s AND instrument_id = %s",
            (set_id, stock),
        ).fetchall()
    }
    assert len(stored) == 8
    for shown in body["inputs"]:
        value, as_of, known_on = stored[shown["input_name"]]
        assert Decimal(shown["value"]) == value == values[shown["input_name"]]
        assert (shown["as_of"], shown["known_on"]) == (as_of.isoformat(), known_on.isoformat())
    assert {"factor", "input_name", "label", "status", "value", "as_of", "known_on"} <= set(
        body["inputs"][0]
    )
    assert [m["name"] for m in body["memberships"]] == ["Mine"]
    assert set(body["factors"]) == {"value", "growth", "momentum"}


def test_the_evidence_carries_restated_and_detail_and_omits_a_retired_universe(app: App) -> None:
    client, conn = app
    set_id = complete_set(conn)
    stock = seed_scored_stock(conn, set_id, "AAA", value=SCORE, restated=["value"])
    seed_inputs(
        conn, set_id, stock, restated=["book_to_price"], statuses={"earnings_yield": "missing"}
    )
    gone = insert_universe(conn, "Gone", [stock])
    insert_universe(conn, "Live", [stock])
    retire_universe(conn, gone)
    body = client.get("/api/classifications/stocks/AAA").json()
    inputs = {row["input_name"]: row for row in body["inputs"]}
    assert inputs["book_to_price"]["restated_possible"] is True
    assert inputs["earnings_yield"]["restated_possible"] is False
    assert (
        inputs["earnings_yield"]["status"] == "missing" and inputs["earnings_yield"]["detail"] == {}
    )
    assert inputs["fcf_yield"]["value"] == "1.0000000000"
    assert body["factors"]["value"]["restated_possible"] is True
    assert [m["name"] for m in body["memberships"]] == ["Live"]


def test_a_known_stock_before_any_set_has_no_set_factors_or_inputs(app: App) -> None:
    """DEC-0140, design section 7 "Evidence with memberships": 200 with the empty shape."""
    client, conn = app
    stock = insert_instrument(conn, "AAA")
    insert_universe(conn, "Mine", [stock])
    response = client.get("/api/classifications/stocks/AAA")
    assert response.status_code == 200
    body = response.json()
    assert body["set"] is None and body["factors"] == {} and body["inputs"] == []
    assert [m["name"] for m in body["memberships"]] == ["Mine"]


# Implements CAP-002 TC-INT-048 (part: unknown symbol is 404)
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


# Implements CAP-002 TC-INT-046
def test_the_history_lists_the_earlier_complete_sets_newest_first_and_skips_a_failed_one(
    app: App,
) -> None:
    """DEC-0287 (owner): three complete sets and one failed set give two history results, the
    two earlier complete sets. The current set is excluded from the history (DEC-0137), and the
    failed set, which holds rows for the stock too, contributes none. It sits between the two
    earlier sets, so its absence is not explained by its being newest."""
    client, conn = app
    stock = insert_instrument(conn, "AAA")
    earlier = [complete_set(conn, started_at=T0.replace(day=day)) for day in (10, 12)]
    current = complete_set(conn)
    failed = later_set(conn, "failed", started_at=T0.replace(day=11))
    for number, set_id in enumerate([*earlier, current, failed], start=1):
        score = Decimal(9 if set_id == failed else number)
        for factor in FACTORS:
            insert_classification(
                conn, set_id, stock, factor, score=score, percentile=Decimal(number)
            )
    body = client.get("/api/classifications/stocks/AAA/history").json()
    assert [s["set_id"] for s in body["sets"]] == [str(earlier[1]), str(earlier[0])]
    assert [s["factors"]["value"]["score"] for s in body["sets"]] == ["2.000000", "1.000000"]
    assert [s["factors"]["value"]["percentile"] for s in body["sets"]] == ["2.000000", "1.000000"]
    assert str(failed) not in {s["set_id"] for s in body["sets"]}
    assert str(current) not in {s["set_id"] for s in body["sets"]}
    assert body["next_cursor"] is None


# Implements CAP-002 TC-INT-058
def test_the_restatement_mark_is_on_value_and_growth_in_all_four_reads(app: App) -> None:
    client, conn = app
    earlier = complete_set(conn, started_at=T0.replace(day=10))
    current = complete_set(conn)
    marked = ("value", "growth")
    stock = seed_scored_stock(conn, current, "AAA", value=SCORE, restated=marked)
    seed_scored_stock(conn, current, "BBB", value=SCORE)
    for factor in FACTORS:
        insert_classification(
            conn,
            earlier,
            stock,
            factor,
            score=SCORE[0],
            percentile=SCORE[1],
            restated_possible=factor in marked,
        )
    expected = {"value": True, "growth": True, "momentum": False}

    listed = client.get("/api/classifications").json()["stocks"]
    compared = client.get("/api/classifications", params={"symbols": "AAA,BBB"}).json()["stocks"]
    evidence = client.get("/api/classifications/stocks/AAA").json()["factors"]
    history = client.get("/api/classifications/stocks/AAA/history").json()["sets"][0]["factors"]

    for cells in (
        next(r for r in listed if r["symbol"] == "AAA")["factors"],
        next(r for r in compared if r["symbol"] == "AAA")["factors"],
        evidence,
        history,
    ):
        assert {f: cells[f]["restated_possible"] for f in FACTORS} == expected
    for rows in (listed, compared):
        other = next(r for r in rows if r["symbol"] == "BBB")["factors"]
        assert not any(cell["restated_possible"] for cell in other.values())


# Implements CAP-002 TC-INT-048 (part: never-classified stock has no sets)
def test_the_history_carries_the_stored_restated_flag_and_a_new_stock_has_none(app: App) -> None:
    client, conn = app
    earlier = complete_set(conn, started_at=T0.replace(day=10))
    complete_set(conn)
    stock = insert_instrument(conn, "AAA")
    for factor in ("value", "growth", "momentum"):
        insert_classification(
            conn,
            earlier,
            stock,
            factor,
            score=SCORE[0],
            percentile=SCORE[1],
            restated_possible=factor == "growth",
        )
    insert_instrument(conn, "NEW")
    cells = client.get("/api/classifications/stocks/AAA/history").json()["sets"][0]["factors"]
    assert [cells[f]["restated_possible"] for f in ("value", "growth", "momentum")] == [
        False,
        True,
        False,
    ]
    fresh = client.get("/api/classifications/stocks/NEW/history")
    assert fresh.status_code == 200
    assert fresh.json() == {"symbol": "NEW", "sets": [], "next_cursor": None}


# Implements CAP-002 TC-INT-055
# Implements CAP-002 TC-INT-056
def test_the_sets_list_and_detail_agree(app: App) -> None:
    client, conn = app
    earlier = complete_set(conn, started_at=T0.replace(day=10))
    done = complete_set(conn)
    later_set(conn, "failed")
    later_set(conn, "building", started_at=T1.replace(day=20))
    body = client.get("/api/classifications/sets").json()
    assert [s["state"] for s in body["sets"]] == ["building", "failed", "complete", "complete"]
    assert [s["set_id"] for s in body["sets"][2:]] == [str(done), str(earlier)]
    assert all("run_started_at" in s for s in body["sets"])
    failed = next(s for s in body["sets"] if s["state"] == "failed")
    assert failed["failure_reason"] == "boom" and failed["ended_at"] is not None
    detail = client.get(f"/api/classifications/sets/{done}").json()
    assert detail == next(s for s in body["sets"] if s["set_id"] == str(done))
    assert detail["ended_at"] is not None  # the set's produced-at, equal on both reads
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
    insert_instrument(conn, "AAA")
    assert client.get("/api/classifications/stocks/AAA/history?limit=500").status_code == 200


def test_the_default_page_size_is_fifty(app: App) -> None:
    client, conn = app
    set_id = complete_set(conn, active_instruments=51)
    for index in range(51):
        seed_scored_stock(conn, set_id, f"S{index:02d}", value=SCORE)
    body = client.get("/api/classifications").json()
    assert len(body["stocks"]) == 50 and body["match_count"] == 51
    assert body["next_cursor"] is not None


def _forged(cursor: str) -> str:
    payload = json.loads(base64.urlsafe_b64decode(cursor + "=" * (-len(cursor) % 4)))
    del payload["sym"]
    text = json.dumps(payload, separators=(",", ":"))
    return base64.urlsafe_b64encode(text.encode()).decode().rstrip("=")


# Implements CAP-002 TC-INT-042
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
