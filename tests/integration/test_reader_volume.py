"""The reader at 3000 stocks: correct at volume and served from indexed set rows (CAP-002-E3-S4).

Proves DAC-E3-S4-4 (TC-COMP-153; AC-18) and design section 7 row "Volume": the list under each of
the seven sorts in both directions, the count, the thresholds with and without
``hide_incomplete``, the summary, history and the set list against a full-size store. "Within the
test's budget" is structural (DEC-0135, PROVISIONAL): with the planner forced off sequential scans
each statement's plan reads the set tables through an index keyed on the set, and never the older
set's rows. Elapsed time is printed as a diagnostic and no bound is asserted: no read-latency
target exists (reader design sections 5 and 14 Q1; precedent TC-COMP-190 in
``test_runner_volume.py``).
"""

import json
import time
from collections.abc import Iterator
from datetime import UTC, date, datetime, timedelta
from decimal import Decimal
from typing import Any
from uuid import UUID

import psycopg
import pytest

from factorflow.api.bounds import MAX_PAGE_SIZE
from factorflow.classification import reader
from factorflow.classification.constants import FACTORS
from tests.integration.reader_seed import (
    analyze_classification_tables,
    bulk_seed_scored_stocks,
    insert_classification,
    insert_run,
    insert_set,
)

pytestmark = [pytest.mark.postgres, pytest.mark.slow]

STOCKS = 3000
T0 = datetime(2026, 9, 1, 22, 30, tzinfo=UTC)
COUNTS = {f: (2700, True) for f in FACTORS}


def _complete_set(conn: psycopg.Connection, started_at: datetime) -> UUID:
    run_id = insert_run(conn, "succeeded", started_at=started_at - timedelta(hours=1))
    return insert_set(
        conn,
        run_id,
        "complete",
        started_at=started_at,
        ended_at=started_at + timedelta(minutes=5),
        classification_date=started_at.date(),
        latest_trading_day=started_at.date(),
        active_instruments=STOCKS,
        factors=COUNTS,
    )


def _seed_two_full_sets(conn: psycopg.Connection) -> tuple[UUID, UUID]:
    """An older complete set and the current one, the same 3000 stocks in each with different
    scores, so a read of the wrong set is observable."""
    older = _complete_set(conn, T0)
    bulk_seed_scored_stocks(conn, older, STOCKS, score_shift=Decimal(100))
    current = _complete_set(conn, T0 + timedelta(days=1))
    bulk_seed_scored_stocks(conn, current, STOCKS)
    analyze_classification_tables(conn)
    return older, current


class RecordingConnection:
    """Delegates to a real connection and records each statement with its parameters."""

    def __init__(self, conn: psycopg.Connection) -> None:
        self._conn = conn
        self.executed: list[tuple[str, Any]] = []

    def cursor(self) -> "RecordingCursor":
        return RecordingCursor(self._conn.cursor(), self.executed)


class RecordingCursor:
    def __init__(self, cursor: psycopg.Cursor[Any], executed: list[tuple[str, Any]]) -> None:
        self._cursor = cursor
        self._executed = executed

    def __enter__(self) -> "RecordingCursor":
        return self

    def __exit__(self, *exc: object) -> None:
        self._cursor.close()

    def execute(self, query: str, params: Any = None) -> "RecordingCursor":
        self._executed.append((query, params))
        self._cursor.execute(query, params)
        return self

    def __getattr__(self, name: str) -> Any:
        return getattr(self._cursor, name)


def _plan(conn: psycopg.Connection, query: str, params: Any) -> dict[str, Any]:
    """The statement's plan with sequential scans priced out, inside a transaction undone after."""
    with conn.transaction(force_rollback=True), conn.cursor() as cur:
        cur.execute("SET LOCAL enable_seqscan = off")
        cur.execute("EXPLAIN (FORMAT JSON) " + query, params)
        row = cur.fetchone()
    assert row is not None
    document = row[0] if not isinstance(row[0], str) else json.loads(row[0])
    plan: dict[str, Any] = document[0]["Plan"]
    return plan


def _nodes(plan: dict[str, Any]) -> Iterator[dict[str, Any]]:
    yield plan
    for child in plan.get("Plans", []):
        yield from _nodes(child)


def _seq_scanned(plan: dict[str, Any]) -> set[str]:
    return {n["Relation Name"] for n in _nodes(plan) if n["Node Type"] == "Seq Scan"}


def _assert_classification_reads_keyed_on(plan: dict[str, Any], column: str) -> int:
    """Every ``factor_classification`` access has an index condition naming ``column``."""
    accesses = 0
    for node in _nodes(plan):
        if node.get("Relation Name") != "factor_classification":
            continue
        accesses += 1
        if node["Node Type"] == "Bitmap Heap Scan":
            conditions = [
                child.get("Index Cond", "")
                for child in _nodes(node)
                if child["Node Type"] == "Bitmap Index Scan"
            ]
        else:
            assert node["Node Type"] in ("Index Scan", "Index Only Scan"), node["Node Type"]
            conditions = [node.get("Index Cond", "")]
        assert conditions and all(column in c for c in conditions), node
    return accesses


def _stored(conn: psycopg.Connection, set_id: UUID) -> list[dict[str, Any]]:
    """The seeded current-set values, read back from the tables, never from the statement under
    test: symbol, each factor's score, percentile and reason, and whether an input is stale."""
    rows = conn.execute(
        "SELECT i.instrument_id, i.symbol, c.factor, c.score, c.percentile, c.reason_code "
        "FROM factor_classification c JOIN instrument i USING (instrument_id) "
        "WHERE c.set_id = %s",
        (set_id,),
    ).fetchall()
    stale = {
        r[0]
        for r in conn.execute(
            "SELECT DISTINCT instrument_id FROM factor_input "
            "WHERE set_id = %s AND status IN ('missing', 'outdated')",
            (set_id,),
        ).fetchall()
    }
    stocks: dict[int, dict[str, Any]] = {}
    for instrument_id, symbol, factor, score, percentile, reason in rows:
        stock = stocks.setdefault(
            instrument_id, {"symbol": symbol, "stale": instrument_id in stale}
        )
        stock[f"{factor}_score"] = score
        stock[f"{factor}_percentile"] = percentile
        stock[f"{factor}_reason"] = reason
    return list(stocks.values())


def _expected_order(stocks: list[dict[str, Any]], sort: str, order: str) -> list[str]:
    """Classified before ``not_classified`` on the sort factor in both directions, ties by
    symbol ascending (STD-UI-4; design 2.5)."""
    if sort == "symbol":
        return sorted((s["symbol"] for s in stocks), reverse=order == "desc")
    keyed = [s for s in stocks if s[sort] is not None]
    unkeyed = [s for s in stocks if s[sort] is None]
    keyed.sort(key=lambda s: s["symbol"])
    keyed.sort(key=lambda s: s[sort], reverse=order == "desc")
    return [s["symbol"] for s in keyed] + sorted(s["symbol"] for s in unkeyed)


def _pages(conn: Any, filters: reader.ListFilters) -> list[reader.ClassificationPage]:
    pages = []
    cursor = None
    while True:
        page = reader.list_classifications(conn, _with_cursor(filters, cursor))
        pages.append(page)
        cursor = page.next_cursor
        if cursor is None:
            return pages


def _with_cursor(filters: reader.ListFilters, cursor: str | None) -> reader.ListFilters:
    return reader.ListFilters(
        sort=filters.sort,
        order=filters.order,
        thresholds=filters.thresholds,
        limit=filters.limit,
        cursor=cursor,
    )


# Implements TC-COMP-153
def test_list_sort_and_count_at_3000_stocks_are_correct_and_indexed(
    migrated_run_schema_connection: psycopg.Connection,
) -> None:
    """DAC-E3-S4-4: every sort, both directions, paged at the largest page: the count is 3000
    on every page, the pages hold each stock once in the expected order, every cell is the
    current set's, and each statement reads the set tables through an index keyed on the set and
    never the older set's rows (DEC-0135)."""
    conn = migrated_run_schema_connection
    older, current = _seed_two_full_sets(conn)
    stocks = _stored(conn, current)
    assert len(stocks) == STOCKS
    by_symbol = {s["symbol"]: s for s in stocks}

    started = time.perf_counter()
    for sort in reader.SORT_ALLOWLIST:
        for order in ("asc", "desc"):
            recording = RecordingConnection(conn)
            filters = reader.ListFilters(sort=sort, order=order, limit=MAX_PAGE_SIZE)
            pages = _pages(recording, filters)

            assert len(pages) == STOCKS // MAX_PAGE_SIZE, (sort, order)
            assert {page.match_count for page in pages} == {STOCKS}, (sort, order)
            symbols = [row.symbol for page in pages for row in page.stocks]
            assert symbols == _expected_order(stocks, sort, order), (sort, order)
            for page in (pages[0], pages[-1]):
                for row in page.stocks:
                    seeded = by_symbol[row.symbol]
                    for factor in FACTORS:
                        assert row.factors[factor].score == seeded[f"{factor}_score"]
                        assert row.factors[factor].percentile == seeded[f"{factor}_percentile"]

            for query, params in recording.executed:
                plan = _plan(conn, query, params)
                text = json.dumps(plan)
                scanned = _seq_scanned(plan)
                assert "factor_classification" not in scanned, (sort, order, scanned)
                assert "classification_set" not in scanned, (sort, order, scanned)
                if sort == "symbol":
                    assert "instrument" not in scanned, (sort, order, scanned)
                assert str(older) not in text, (sort, order)
                if "factor_classification" in query:  # the list statement itself
                    assert _assert_classification_reads_keyed_on(plan, "set_id") > 0
                    assert str(current) in text  # the bound set is the one the plan reads
    elapsed = time.perf_counter() - started
    print(f"\nTC-COMP-153: 14 full passes over {STOCKS} stocks in {elapsed:.2f}s (diagnostic only)")


def test_thresholds_summary_history_and_sets_at_3000_stocks(
    migrated_run_schema_connection: psycopg.Connection,
) -> None:
    """Design section 7 row "Volume" (DAC-E3-S4-4): thresholds, ``hide_incomplete`` and a prefix
    give the expected count on the first and last pages; the summary counts only; history over
    20 earlier sets and the set list over 21 read through their indexes and history touches no
    ``factor_input``."""
    conn = migrated_run_schema_connection
    older, current = _seed_two_full_sets(conn)
    stocks = _stored(conn, current)
    bound = Decimal(80)

    def kept(stock: dict[str, Any], hide: bool, prefix: str | None) -> bool:
        if prefix is not None and not stock["symbol"].startswith(prefix):
            return False
        reasons = [stock[f"{f}_reason"] for f in FACTORS]
        if hide and any(r in reader.INPUT_REASONS for r in reasons):
            return False
        percentile = stock["value_percentile"]
        return percentile is None or percentile >= bound

    for hide in (False, True):
        for prefix in (None, "S1"):
            thresholds = reader.Thresholds(
                bounds={"value_percentile_min": bound}, hide_incomplete=hide, symbol=prefix
            )
            expected = sum(kept(s, hide, prefix) for s in stocks)
            filters = reader.ListFilters(
                sort="value_percentile", thresholds=thresholds, limit=MAX_PAGE_SIZE
            )
            pages = _pages(conn, filters)
            assert 0 < expected < STOCKS
            assert pages[0].match_count == pages[-1].match_count == expected, (hide, prefix)
            assert sum(len(p.stocks) for p in pages) == expected

    recording = RecordingConnection(conn)
    summary = reader.summary(recording)  # type: ignore[arg-type]
    assert summary.stocks_current is not None
    assert summary.stocks_current.followed_count == STOCKS
    assert summary.stocks_current.current_count == sum(not s["stale"] for s in stocks)
    query, params = recording.executed[-1]
    with conn.cursor() as cur:
        cur.execute(query, params)
        assert len(cur.fetchall()) == 1  # counts only, never a stock row

    # One stock with rows in 19 more earlier sets: 20 earlier sets, 21 sets in all.
    instrument_id = conn.execute("SELECT instrument_id FROM instrument WHERE symbol = 'S0001'")
    row = instrument_id.fetchone()
    assert row is not None
    for day in range(19):
        set_id = _complete_set(conn, T0 - timedelta(days=day + 1))
        for factor in FACTORS:
            insert_classification(
                conn, set_id, row[0], factor, score=Decimal(day), percentile=Decimal(1)
            )
    analyze_classification_tables(conn)

    recording = RecordingConnection(conn)
    history, history_cursor = reader.stock_history(recording, "S0001", limit=50, cursor=None)  # type: ignore[arg-type]
    assert (len(history), history_cursor) == (20, None)
    assert history[0].set_id == older
    history_query, history_params = recording.executed[-1]
    assert history_query == reader.HISTORY_SQL
    plan = _plan(conn, history_query, history_params)
    assert "factor_classification" not in _seq_scanned(plan)
    assert "idx_factor_classification_instrument" in json.dumps(plan)
    # A keyed probe, not a full scan of the same index (review v1 IR-005).
    assert _assert_classification_reads_keyed_on(plan, "instrument_id") > 0
    assert "factor_input" not in json.dumps(plan)

    recording = RecordingConnection(conn)
    sets, sets_cursor = reader.list_sets(recording, limit=50, cursor=None)  # type: ignore[arg-type]
    assert (len(sets), sets_cursor) == (21, None)
    assert sets[0].set_id == current
    sets_query, sets_params = recording.executed[-1]
    assert sets_query == reader.SETS_SQL
    plan = _plan(conn, sets_query, sets_params)
    assert "classification_set" not in _seq_scanned(plan)
    indexes = {
        n.get("Index Name") for n in _nodes(plan) if n.get("Relation Name") == "classification_set"
    }
    assert indexes & {"idx_classification_set_started", "classification_set_pkey"}, indexes
    assert date(2026, 9, 2) == sets[0].classification_date
