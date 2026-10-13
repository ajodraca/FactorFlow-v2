"""Page size defaults and caps (component-design-ingestion-api.md sections 2.4a, 7).

CAP-001-E6-S3, TC-COMP-056 (DAC-E6-S3-3): a `limit` beyond the canonical bound
is rejected with `422`, never silently clamped.
"""

import hashlib
from collections.abc import Iterator
from datetime import date

import psycopg
import pytest
from fastapi.testclient import TestClient

from factorflow.api.app import create_app
from factorflow.api.bounds import DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE
from factorflow.db.migrate_main import MIGRATIONS_DIR

pytestmark = pytest.mark.postgres

_MIGRATIONS = MIGRATIONS_DIR


@pytest.fixture
def pagination_client(
    postgres_connection_string: str, monkeypatch: pytest.MonkeyPatch
) -> Iterator[TestClient]:
    """A TestClient against a fully-migrated database holding 51 priced instruments."""
    conn = psycopg.connect(postgres_connection_string)
    for path in sorted(_MIGRATIONS.glob("*.sql")):
        conn.execute(path.read_text())
    conn.execute(
        "INSERT INTO instrument (symbol, lifecycle) "
        "SELECT 'P' || lpad(g::text, 3, '0'), 'active' FROM generate_series(1, 51) g"
    )
    conn.execute(
        "INSERT INTO coverage_segment (instrument_id, data_type, covered_from, covered_to) "
        "SELECT instrument_id, 'prices', %s, %s FROM instrument",
        (date(2024, 1, 2), date(2024, 1, 5)),
    )
    session = date(2024, 1, 2)
    conn.execute(
        "INSERT INTO daily_bar (instrument_id, session_date, value_hash, open_price, "
        "high_price, low_price, close_price, volume) "
        "SELECT instrument_id, %s, %s, 1, 1, 1, 1, 1 FROM instrument ORDER BY symbol LIMIT 1",
        (session, hashlib.sha256(str(session).encode()).digest()),
    )
    conn.commit()
    conn.close()

    monkeypatch.setenv("FACTORFLOW_DATABASE_URL", postgres_connection_string)
    with TestClient(create_app(), base_url="http://127.0.0.1:8000") as client:
        yield client


# Implements TC-COMP-056
# Implements TC-INT-019
def test_coverage_page_size_defaults_and_caps(pagination_client: TestClient) -> None:
    client = pagination_client

    default = client.get("/api/coverage")
    assert default.status_code == 200, default.text
    assert len(default.json()["instruments"]) == DEFAULT_PAGE_SIZE
    assert default.json()["next_cursor"] is not None

    maximum = client.get(f"/api/coverage?limit={MAX_PAGE_SIZE}")
    assert maximum.status_code == 200, maximum.text
    assert len(maximum.json()["instruments"]) == 51

    over = client.get(f"/api/coverage?limit={MAX_PAGE_SIZE + 1}")
    assert over.status_code != 200
    assert over.status_code == 422
    assert over.json()["error"]["code"] == "validation_error"
    assert over.json()["error"]["resource"] == "coverage"

    assert client.get("/api/coverage?limit=0").status_code == 422
