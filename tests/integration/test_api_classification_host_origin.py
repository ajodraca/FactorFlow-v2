"""The Host and Origin middleware guard the universes routes (CAP-002-E1-S6; task plan T013).

Component design `component-design-classification-api.md` sections 2.3 and 4; DAC-E1-S6-5.
A real store behind `create_app()`: a refused request changes nothing, and the same request
from the API's own origin succeeds, so the refusal is the middleware's and not validation.
The universes cases are this story's; CAP-002-E3-S5 appends the classification cases.
"""

from collections.abc import Iterator
from typing import Any

import psycopg
import pytest
from fastapi.testclient import TestClient

from factorflow.api.app import create_app
from factorflow.db.migrate_main import MIGRATIONS_DIR
from factorflow.db.migrator import apply_pending, discover
from tests.integration.test_universe_create import count_events, seed_instrument

pytestmark = pytest.mark.postgres

FOREIGN = "https://evil.example"
OWN = "http://127.0.0.1:8000"


@pytest.fixture
def database(postgres_connection_string: str) -> str:
    connection = psycopg.connect(postgres_connection_string)
    try:
        apply_pending(connection, discover(MIGRATIONS_DIR))
        connection.commit()
    finally:
        connection.close()
    return postgres_connection_string


@pytest.fixture
def conn(database: str) -> Iterator[psycopg.Connection]:
    connection = psycopg.connect(database, autocommit=True)
    try:
        yield connection
    finally:
        connection.close()


@pytest.fixture
def client(database: str, monkeypatch: pytest.MonkeyPatch) -> Iterator[TestClient]:
    monkeypatch.setenv("FACTORFLOW_DATABASE_URL", database)
    with TestClient(create_app(), base_url="http://127.0.0.1:8000") as test_client:
        yield test_client


def count_universes(conn: psycopg.Connection) -> int:
    row = conn.execute("SELECT count(*) FROM universe").fetchone()
    assert row is not None
    return int(row[0])


def refused(response: Any, status: int, code: str) -> None:
    assert response.status_code == status, response.text
    assert response.json()["error"]["code"] == code
    assert response.headers["X-Request-Id"]


def test_a_foreign_origin_cannot_create(client: TestClient, conn: psycopg.Connection) -> None:
    seed_instrument(conn, "AAA")
    body = {"name": "Mine", "symbols": ["AAA"]}

    for origin in (FOREIGN, "null"):
        refused(
            client.post("/api/universes", json=body, headers={"Origin": origin}),
            403,
            "origin_not_allowed",
        )
    assert count_universes(conn) == 0

    created = client.post("/api/universes", json=body, headers={"Origin": OWN})
    assert created.status_code == 201
    assert count_universes(conn) == 1


def test_a_foreign_host_cannot_read(client: TestClient, conn: psycopg.Connection) -> None:
    seed_instrument(conn, "AAA")
    universe_id = client.post("/api/universes", json={"name": "Mine", "symbols": ["AAA"]}).json()[
        "universe_id"
    ]

    for path in ("/api/universes", f"/api/universes/{universe_id}"):
        refused(client.get(path, headers={"Host": "evil.example:8000"}), 400, "host_not_allowed")
        assert client.get(path).status_code == 200


def test_a_foreign_origin_cannot_change_a_universe(
    client: TestClient, conn: psycopg.Connection
) -> None:
    for symbol in ("AAA", "BBB", "CCC"):
        seed_instrument(conn, symbol)
    universe_id = client.post(
        "/api/universes", json={"name": "Mine", "symbols": ["AAA", "BBB"]}
    ).json()["universe_id"]
    path = f"/api/universes/{universe_id}"
    writes: list[tuple[str, str, dict[str, Any] | None, int]] = [
        ("PATCH", path, {"name": "New"}, 200),
        ("POST", f"{path}/members", {"symbols": ["CCC"]}, 200),
        ("DELETE", f"{path}/members/BBB", None, 200),
        ("DELETE", path, None, 200),
    ]
    for method, url, body, _ in writes:
        before = count_events(conn)
        refused(
            client.request(method, url, json=body, headers={"Origin": FOREIGN}),
            403,
            "origin_not_allowed",
        )
        assert count_events(conn) == before

    for method, url, body, status in writes:
        response = client.request(method, url, json=body, headers={"Origin": OWN})
        assert response.status_code == status, response.text
