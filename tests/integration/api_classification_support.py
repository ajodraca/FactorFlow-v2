"""One way to build the application over a migrated, seeded store (CAP-002-E3-S5; task plan T002).

A plain helper module, the pattern of ``reader_seed.py``. Seeding through ``reader_seed``
commits on its own connection, so what it writes is visible to the application's pooled
connections as soon as each helper returns; a test that seeds by any other route must
``conn.commit()`` first.
"""

from collections.abc import Iterator
from contextlib import contextmanager
from datetime import UTC, date, datetime
from decimal import Decimal
from uuid import UUID

import psycopg
import pytest
from fastapi.testclient import TestClient

from factorflow.api.app import create_app
from factorflow.db.migrate_main import MIGRATIONS_DIR
from factorflow.db.migrator import apply_pending, discover
from tests.integration.reader_seed import insert_run, insert_set

T0 = datetime(2026, 10, 15, 21, 0, tzinfo=UTC)
T1 = datetime(2026, 10, 16, 14, 30, tzinfo=UTC)


@contextmanager
def classification_app(
    connection_string: str, monkeypatch: pytest.MonkeyPatch
) -> Iterator[tuple[TestClient, psycopg.Connection]]:
    """``(client, conn)``: the application over a store migrated through every migration, and
    the connection the test seeds and reads back with."""
    conn = psycopg.connect(connection_string)
    try:
        apply_pending(conn, discover(MIGRATIONS_DIR))
        conn.commit()
        monkeypatch.setenv("FACTORFLOW_DATABASE_URL", connection_string)
        with TestClient(create_app(), base_url="http://127.0.0.1:8000") as client:
            yield client, conn
    finally:
        conn.close()


def complete_set(
    conn: psycopg.Connection,
    *,
    started_at: datetime = T0,
    active_instruments: int = 3,
    classification_date: date = date(2026, 10, 15),
    factors: dict[str, tuple[int, bool]] | None = None,
) -> UUID:
    """A complete set on a succeeded run; the three factors default to 40 qualified and ranked."""
    run_id = insert_run(conn, "succeeded", started_at=started_at)
    return insert_set(
        conn,
        run_id,
        "complete",
        started_at=started_at,
        ended_at=started_at.replace(minute=started_at.minute + 5),
        classification_date=classification_date,
        latest_trading_day=classification_date,
        active_instruments=active_instruments,
        factors=factors or {f: (40, True) for f in ("value", "growth", "momentum")},
    )


def later_set(conn: psycopg.Connection, state: str) -> UUID:
    """A newer ``building`` or ``failed`` set on its own run."""
    run_id = insert_run(conn, "running" if state == "building" else "failed", started_at=T1)
    failed = state == "failed"
    return insert_set(
        conn,
        run_id,
        state,
        started_at=T1,
        ended_at=T1 if failed else None,
        failure_reason="boom" if failed else None,
    )


SCORE = (Decimal("1.250000"), Decimal("87.500000"))
