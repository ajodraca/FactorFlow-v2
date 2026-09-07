"""Implements TC-COMP-296, TC-COMP-322 / DAC-E1-5, DAC-E1-S2-8.

The advisory lock serializes two concurrently-starting containers, and stays
held for the duration of a long migration. Two `apply_pending` calls start
concurrently (threads) against one empty store; each version is applied
exactly once and both calls exit `0` (return successfully, no exception).
"""

from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

import psycopg
import pytest

from factorflow.db.migrator import apply_pending, discover

pytestmark = pytest.mark.postgres

REPO_ROOT = Path(__file__).resolve().parents[2]
FIXTURES_OK_DIR = REPO_ROOT / "tests" / "fixtures" / "migrations_ok"


def test_two_concurrent_migrators_each_apply_every_version_exactly_once(
    postgres_connection_string: str,
) -> None:
    files = discover(FIXTURES_OK_DIR)

    def _run() -> list[int]:
        with psycopg.connect(postgres_connection_string) as conn:
            applied = apply_pending(conn, files)
            conn.commit()
            return applied

    with ThreadPoolExecutor(max_workers=2) as pool:
        future_a = pool.submit(_run)
        future_b = pool.submit(_run)
        result_a = future_a.result()
        result_b = future_b.result()

    # Exactly one of the two racing calls applies each version; the other,
    # serialised behind the advisory lock, finds the schema already current.
    combined = sorted(result_a + result_b)
    assert combined == [1, 2]

    with psycopg.connect(postgres_connection_string) as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT version FROM applied_migrations ORDER BY version")
            versions = [row[0] for row in cur.fetchall()]
    assert versions == [1, 2]
