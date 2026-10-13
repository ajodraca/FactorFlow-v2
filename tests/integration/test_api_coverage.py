"""`GET /api/coverage` against a real PostgreSQL instance (CAP-001-E6-S3).

Component design: `component-design-ingestion-api.md` sections 2.4a (bounds,
omitted range covers everything), 7 (test placement) and 11 (the contract).
The route is a thin surface over `coverage-service`; these tests pin the HTTP
contract the Coverage screen calls.

- TC-COMP-007 (AC-7): per-instrument presence, covered range and last-acquired.
- TC-COMP-008 (AC-8): gap counts, availability with a reason, dates on expansion.
- TC-COMP-017 (AC-17): an empty store is `never_acquired`; a filter matching
  nothing on a populated store is not.
- TC-COMP-054 (DAC-E6-S3-1): unavailable with a reason, counts `null`, not zero.
- TC-COMP-055 (DAC-E6-S3-2): dates behind `expand`, never in a collapsed row.
- TC-COMP-057 (DAC-E6-S3-4): lifecycle filter, the default includes retired.
- TC-COMP-058 (DAC-E6-S3-5): an inverted range is `422`.
- TC-COMP-036 (DAC-E6-10): filters, bounds and cursor paging, and the
  3000-instrument volume read.

TC-COMP-056 (DAC-E6-S3-3, page-size bounds) lives in `test_api_pagination.py`,
the file section 7 names for it.
"""

import hashlib
import uuid
from collections.abc import Iterator
from datetime import UTC, date, datetime
from pathlib import Path

import psycopg
import pytest
from fastapi.testclient import TestClient

from factorflow.api.app import create_app

pytestmark = pytest.mark.postgres

ROW_KEYS = {
    "symbol",
    "lifecycle",
    "data_types",
    "covered_from",
    "covered_to",
    "last_acquired_at",
    "gap_count",
    "depth_short_by_years",
}
TOP_KEYS = {"instruments", "never_acquired", "gap_detection", "next_cursor"}
DATA_TYPES = {"reference", "prices", "fundamentals", "corporate_actions"}
UNAVAILABLE = "fewer_than_two_instruments_with_data"

D2 = date(2024, 1, 2)
D3 = date(2024, 1, 3)
D4 = date(2024, 1, 4)
D5 = date(2024, 1, 5)
D8 = date(2024, 1, 8)
D9 = date(2024, 1, 9)
D10 = date(2024, 1, 10)
WEEK = [D2, D3, D4, D5]

_MIGRATIONS = Path(__file__).resolve().parents[2] / "migrations"


@pytest.fixture
def coverage_env(
    postgres_connection_string: str, monkeypatch: pytest.MonkeyPatch
) -> Iterator[tuple[TestClient, psycopg.Connection]]:
    """A TestClient against a fully-migrated database, and a seeding connection."""
    conn = psycopg.connect(postgres_connection_string)
    for path in sorted(_MIGRATIONS.glob("*.sql")):
        conn.execute(path.read_text())
    conn.commit()
    conn.close()

    monkeypatch.setenv("FACTORFLOW_DATABASE_URL", postgres_connection_string)
    seed_conn = psycopg.connect(postgres_connection_string)
    try:
        with TestClient(create_app(), base_url="http://127.0.0.1:8000") as client:
            yield client, seed_conn
    finally:
        seed_conn.close()


def _instrument(conn: psycopg.Connection, symbol: str, lifecycle: str = "active") -> int:
    with conn.cursor() as cur:
        cur.execute(
            "INSERT INTO instrument (symbol, lifecycle, retired_at) "
            "VALUES (%s, %s, CASE WHEN %s = 'retired' THEN now() END) RETURNING instrument_id",
            (symbol, lifecycle, lifecycle),
        )
        row = cur.fetchone()
    assert row is not None
    conn.commit()
    return int(row[0])


def _segment(
    conn: psycopg.Connection,
    instrument_id: int,
    data_type: str,
    covered_from: date,
    covered_to: date,
) -> None:
    conn.execute(
        "INSERT INTO coverage_segment (instrument_id, data_type, covered_from, covered_to) "
        "VALUES (%s, %s, %s, %s)",
        (instrument_id, data_type, covered_from, covered_to),
    )
    conn.commit()


def _bars(conn: psycopg.Connection, instrument_id: int, dates: list[date]) -> None:
    with conn.cursor() as cur:
        cur.executemany(
            "INSERT INTO daily_bar (instrument_id, session_date, value_hash, open_price, "
            "high_price, low_price, close_price, volume) VALUES (%s, %s, %s, 1, 1, 1, 1, 1)",
            [
                (instrument_id, d, hashlib.sha256(f"{instrument_id}{d}".encode()).digest())
                for d in dates
            ],
        )
    conn.commit()


def _state(
    conn: psycopg.Connection,
    instrument_id: int,
    data_type: str,
    last_acquired_at: datetime,
    last_outcome: str,
) -> None:
    conn.execute(
        "INSERT INTO acquisition_state "
        "(instrument_id, data_type, last_acquired_at, last_run_id, last_outcome) "
        "VALUES (%s, %s, %s, %s, %s)",
        (instrument_id, data_type, last_acquired_at, uuid.uuid4(), last_outcome),
    )
    conn.commit()


def _priced(
    conn: psycopg.Connection,
    symbol: str,
    bars: list[date],
    covered_from: date = D2,
    covered_to: date = D5,
) -> int:
    instrument_id = _instrument(conn, symbol)
    _segment(conn, instrument_id, "prices", covered_from, covered_to)
    _bars(conn, instrument_id, bars)
    return instrument_id


def _by_symbol(body: dict) -> dict[str, dict]:
    return {row["symbol"]: row for row in body["instruments"]}


def _seed_gap_of_three(conn: psycopg.Connection) -> None:
    """A and B hold every session of the week; C lacks 2024-01-04."""
    _priced(conn, "AAPL", WEEK)
    _priced(conn, "BABA", WEEK)
    _priced(conn, "CSCO", [D2, D3, D5])


# Implements TC-COMP-007
# Implements TC-INT-017
def test_coverage_reports_presence_ranges_and_last_acquired(
    coverage_env: tuple[TestClient, psycopg.Connection],
) -> None:
    client, conn = coverage_env
    for symbol in ("AAPL", "MSFT"):
        instrument_id = _instrument(conn, symbol)
        _segment(conn, instrument_id, "reference", D2, D5)
        _segment(conn, instrument_id, "prices", D2, D5)
        _bars(conn, instrument_id, WEEK)
        if symbol == "AAPL":
            _state(
                conn,
                instrument_id,
                "prices",
                datetime(2024, 1, 5, 22, 14, 3, tzinfo=UTC),
                "written",
            )
            _state(
                conn,
                instrument_id,
                "fundamentals",
                datetime(2024, 1, 5, 10, 0, tzinfo=UTC),
                "not_found",
            )

    resp = client.get("/api/coverage")

    assert resp.status_code == 200, resp.text
    body = resp.json()
    assert set(body) == TOP_KEYS
    assert body["never_acquired"] is False
    assert [row["symbol"] for row in body["instruments"]] == ["AAPL", "MSFT"]
    row = body["instruments"][0]
    assert set(row) == ROW_KEYS
    assert set(row["data_types"]) == DATA_TYPES
    assert row["data_types"] == {
        "reference": "present",
        "prices": "present",
        "fundamentals": "absent",
        "corporate_actions": "unknown",
    }
    assert row["covered_from"] == "2024-01-02"
    assert row["covered_to"] == "2024-01-05"
    assert datetime.fromisoformat(row["last_acquired_at"]) == datetime(
        2024, 1, 5, 22, 14, 3, tzinfo=UTC
    )
    assert row["lifecycle"] == "active"


# Implements TC-COMP-008
# Implements TC-INT-017
def test_coverage_reports_gap_counts_and_availability(
    coverage_env: tuple[TestClient, psycopg.Connection],
) -> None:
    client, conn = coverage_env
    _seed_gap_of_three(conn)

    body = client.get("/api/coverage").json()

    assert body["gap_detection"] == {"available": True, "reason": None}
    rows = _by_symbol(body)
    assert rows["AAPL"]["gap_count"] == 0
    assert rows["BABA"]["gap_count"] == 0
    assert rows["CSCO"]["gap_count"] == 1

    resp = client.get("/api/coverage?expand=CSCO")
    assert resp.status_code == 200, resp.text
    assert resp.json()["expanded"] == {"symbol": "CSCO", "gap_dates": ["2024-01-04"]}


# Implements TC-COMP-017
def test_empty_store_is_never_acquired(
    coverage_env: tuple[TestClient, psycopg.Connection],
) -> None:
    client, _ = coverage_env

    resp = client.get("/api/coverage")

    assert resp.status_code == 200, resp.text
    body = resp.json()
    assert body["never_acquired"] is True
    assert body["instruments"] == []
    assert body["next_cursor"] is None
    assert body["gap_detection"] == {"available": False, "reason": UNAVAILABLE}


# Implements TC-COMP-017
def test_filter_matching_nothing_is_not_never_acquired(
    coverage_env: tuple[TestClient, psycopg.Connection],
) -> None:
    client, conn = coverage_env
    _priced(conn, "AAPL", WEEK)

    resp = client.get("/api/coverage?symbol=ZZ")

    assert resp.status_code == 200, resp.text
    body = resp.json()
    assert body["never_acquired"] is False
    assert body["instruments"] == []


# Implements TC-COMP-054
def test_unavailable_detection_reports_reason_and_null_counts(
    coverage_env: tuple[TestClient, psycopg.Connection],
) -> None:
    client, conn = coverage_env
    _priced(conn, "AAPL", [D2, D4, D5])
    other = _instrument(conn, "BABA")
    _segment(conn, other, "fundamentals", D2, D5)

    body = client.get("/api/coverage").json()

    assert body["gap_detection"] == {"available": False, "reason": UNAVAILABLE}
    assert len(body["instruments"]) == 2
    for row in body["instruments"]:
        assert "gap_count" in row
        assert row["gap_count"] is None
        assert row["gap_count"] != 0
    assert body["never_acquired"] is False

    expanded = client.get("/api/coverage?expand=AAPL").json()["expanded"]
    assert expanded["gap_dates"] is None


# Implements TC-COMP-055
def test_gap_dates_only_behind_expansion(
    coverage_env: tuple[TestClient, psycopg.Connection],
) -> None:
    client, conn = coverage_env
    _priced(conn, "AAPL", WEEK)
    _priced(conn, "BABA", [D2, D4])

    body = client.get("/api/coverage").json()
    assert "expanded" not in body
    for row in body["instruments"]:
        assert set(row) == ROW_KEYS
        assert not any(isinstance(value, list) for value in row.values())

    body = client.get("/api/coverage?expand=BABA").json()
    gap_dates = body["expanded"]["gap_dates"]
    assert gap_dates == ["2024-01-03", "2024-01-05"]
    assert len(gap_dates) == _by_symbol(body)["BABA"]["gap_count"] == 2
    for row in body["instruments"]:
        assert not any(isinstance(value, list) for value in row.values())


# Implements TC-COMP-057
# Implements TC-INT-017
def test_lifecycle_filter_and_default_includes_retired(
    coverage_env: tuple[TestClient, psycopg.Connection],
) -> None:
    client, conn = coverage_env
    _priced(conn, "AAPL", WEEK)
    _priced(conn, "MSFT", WEEK)
    assert client.delete("/api/instruments/MSFT").status_code == 200

    rows = _by_symbol(client.get("/api/coverage").json())
    assert set(rows) == {"AAPL", "MSFT"}
    assert rows["MSFT"]["lifecycle"] == "retired"
    assert rows["MSFT"]["covered_from"] == "2024-01-02"
    assert rows["MSFT"]["covered_to"] == "2024-01-05"

    active = client.get("/api/coverage?lifecycle=active").json()
    assert [row["symbol"] for row in active["instruments"]] == ["AAPL"]
    retired = client.get("/api/coverage?lifecycle=retired").json()
    assert [row["symbol"] for row in retired["instruments"]] == ["MSFT"]

    resp = client.get("/api/coverage?lifecycle=archived")
    assert resp.status_code == 422
    assert resp.json()["error"]["code"] == "validation_error"


# Implements TC-COMP-058
# Implements TC-INT-018
def test_inverted_range_is_rejected(
    coverage_env: tuple[TestClient, psycopg.Connection],
) -> None:
    client, conn = coverage_env
    _seed_gap_of_three(conn)

    resp = client.get("/api/coverage?from=2024-01-05&to=2024-01-02")
    assert resp.status_code == 422
    error = resp.json()["error"]
    assert error["code"] == "validation_error"
    assert error["resource"] == "coverage"
    assert "`from`" in error["message"] and "`to`" in error["message"]
    assert error["request_id"]

    assert client.get("/api/coverage?from=2024-01-03&to=2024-01-03").status_code == 200
    assert client.get("/api/coverage?from=2024-13-01").status_code == 422


# Implements TC-COMP-036
# Implements TC-INT-017
def test_symbol_filter_is_a_prefix(
    coverage_env: tuple[TestClient, psycopg.Connection],
) -> None:
    client, conn = coverage_env
    for symbol in ("AAL", "AAPL", "MSFT"):
        _priced(conn, symbol, WEEK)

    body = client.get("/api/coverage?symbol=AA").json()

    assert [row["symbol"] for row in body["instruments"]] == ["AAL", "AAPL"]


# Implements TC-COMP-036
# Implements TC-INT-017
def test_date_bounds_narrow_gaps(
    coverage_env: tuple[TestClient, psycopg.Connection],
) -> None:
    client, conn = coverage_env
    fortnight = [D2, D3, D4, D5, D8, D9, D10]
    _priced(conn, "AAPL", fortnight, covered_to=D10)
    _priced(conn, "BABA", [d for d in fortnight if d not in (D3, D9)], covered_to=D10)

    bounded = client.get("/api/coverage?from=2024-01-02&to=2024-01-05").json()
    assert _by_symbol(bounded)["BABA"]["gap_count"] == 1
    expanded = client.get("/api/coverage?from=2024-01-02&to=2024-01-05&expand=BABA").json()
    assert expanded["expanded"]["gap_dates"] == ["2024-01-03"]
    unbounded = client.get("/api/coverage").json()
    assert _by_symbol(unbounded)["BABA"]["gap_count"] == 2


# Implements TC-COMP-036
# Implements TC-INT-017
def test_cursor_pages_through_every_instrument_once(
    coverage_env: tuple[TestClient, psycopg.Connection],
) -> None:
    client, conn = coverage_env
    symbols = ["AAPL", "BABA", "CSCO", "DELL", "EBAY"]
    for symbol in symbols:
        _priced(conn, symbol, WEEK)

    pages: list[list[str]] = []
    cursor: str | None = None
    while True:
        url = "/api/coverage?limit=2" + (f"&cursor={cursor}" if cursor else "")
        body = client.get(url).json()
        pages.append([row["symbol"] for row in body["instruments"]])
        cursor = body["next_cursor"]
        if cursor is None:
            break

    assert [len(page) for page in pages] == [2, 2, 1]
    assert [symbol for page in pages for symbol in page] == symbols


# Implements TC-COMP-036
# Implements TC-COMP-055
@pytest.mark.slow
def test_volume_read_of_3000_instruments(
    coverage_env: tuple[TestClient, psycopg.Connection],
) -> None:
    client, conn = coverage_env
    conn.execute(
        "INSERT INTO instrument (symbol, lifecycle) "
        "SELECT 'S' || lpad(g::text, 4, '0'), 'active' FROM generate_series(1, 3000) g"
    )
    conn.execute(
        "INSERT INTO coverage_segment (instrument_id, data_type, covered_from, covered_to) "
        "SELECT instrument_id, 'prices', %s, %s FROM instrument",
        (D2, D5),
    )
    conn.commit()
    with conn.cursor() as cur:
        cur.execute("SELECT instrument_id FROM instrument ORDER BY symbol LIMIT 3")
        first_three = [int(row[0]) for row in cur.fetchall()]
    for instrument_id in first_three:
        _bars(conn, instrument_id, WEEK)

    seen: list[str] = []
    pages = 0
    cursor: str | None = None
    while True:
        url = "/api/coverage?limit=500" + (f"&cursor={cursor}" if cursor else "")
        body = client.get(url).json()
        pages += 1
        seen.extend(row["symbol"] for row in body["instruments"])
        cursor = body["next_cursor"]
        if cursor is None:
            break
    assert pages == 6
    assert len(seen) == len(set(seen)) == 3000

    body = client.get("/api/coverage").json()
    assert len(body["instruments"]) == 50
    assert "expanded" not in body
    for row in body["instruments"]:
        assert set(row) == ROW_KEYS
        assert not any(isinstance(value, list) for value in row.values())


# Covers ingestion-api design sections 2.4a and 7 ("Coverage without a range covers everything")
def test_omitted_range_covers_everything(
    coverage_env: tuple[TestClient, psycopg.Connection],
) -> None:
    client, conn = coverage_env
    old = [date(2022, 3, 14), date(2022, 3, 15), date(2022, 3, 16)]
    start, end = date(2022, 3, 14), D4
    _priced(conn, "AAPL", [*old, D2, D3, D4], covered_from=start, covered_to=end)
    _priced(conn, "BABA", [old[0], old[2], D2, D3, D4], covered_from=start, covered_to=end)

    row = _by_symbol(client.get("/api/coverage").json())["BABA"]
    assert row["covered_from"] == "2022-03-14"
    assert row["gap_count"] == 1
    expanded = client.get("/api/coverage?expand=BABA").json()["expanded"]
    assert expanded["gap_dates"] == ["2022-03-15"]


# Covers coverage-service design section 2.4 and AC 7 (shortfall null when met)
def test_depth_shortfall_is_null_when_met(
    coverage_env: tuple[TestClient, psycopg.Connection],
) -> None:
    client, conn = coverage_env
    assert client.put("/api/settings/history-depth", json={"years": 5}).status_code == 200
    _priced(conn, "DEEP", WEEK, covered_from=date(2019, 1, 2), covered_to=D5)
    _priced(conn, "SHAL", WEEK, covered_from=date(2023, 1, 3), covered_to=D5)

    rows = _by_symbol(client.get("/api/coverage").json())

    assert rows["DEEP"]["depth_short_by_years"] is None
    shortfall = rows["SHAL"]["depth_short_by_years"]
    assert isinstance(shortfall, int) and shortfall > 0


# Covers the `expand` contract (task plan Open Gap 1) and SEC-INP-001
def test_expansion_errors_and_normalisation(
    coverage_env: tuple[TestClient, psycopg.Connection],
) -> None:
    client, conn = coverage_env
    _priced(conn, "AAPL", WEEK)
    _priced(conn, "BABA", WEEK)

    resp = client.get("/api/coverage?expand=ZZZZ")
    assert resp.status_code == 404
    error = resp.json()["error"]
    assert error["code"] == "instrument_not_found"
    assert error["resource"] == "coverage"

    resp = client.get("/api/coverage", params={"expand": "$$$"})
    assert resp.status_code == 422
    assert resp.json()["error"]["code"] == "validation_error"

    resp = client.get("/api/coverage?expand=aapl")
    assert resp.status_code == 200, resp.text
    assert resp.json()["expanded"]["symbol"] == "AAPL"
