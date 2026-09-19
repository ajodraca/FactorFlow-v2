"""Migration 0003/0004 application through the production migrator."""

import psycopg
import pytest

from factorflow.db.migrator import apply_pending, discover
from tests.conftest import MIGRATION_0001_PATH


@pytest.mark.postgres
# Implements TC-COMP-015
def test_new_migrations_apply_after_0002_without_rewriting_rows(
    postgres_connection_string: str,
) -> None:
    conn = psycopg.connect(postgres_connection_string)
    try:
        files = discover(MIGRATION_0001_PATH.parent)
        assert apply_pending(conn, files[:2]) == [1, 2]
        with conn.cursor() as cur:
            cur.execute(
                "INSERT INTO instrument (symbol, lifecycle) VALUES ('ABC', 'active') "
                "RETURNING instrument_id"
            )
            instrument_id = cur.fetchone()[0]
            cur.execute(
                """INSERT INTO daily_bar
                (instrument_id, session_date, value_hash, open_price, high_price, low_price,
                 close_price, volume)
                VALUES (%s, '2020-01-02', decode(repeat('ab', 32), 'hex'), 1, 2, 1, 2, 100)""",
                (instrument_id,),
            )
        conn.commit()
        with conn.cursor() as cur:
            cur.execute(
                "SELECT instrument_id, session_date, encode(value_hash, 'hex'), open_price, "
                "high_price, "
                "low_price, close_price, volume FROM daily_bar"
            )
            sentinel = cur.fetchone()
        assert apply_pending(conn, files) == [3, 4]
        with conn.cursor() as cur:
            cur.execute(
                "SELECT version, checksum FROM applied_migrations "
                "WHERE version IN (3, 4) ORDER BY version"
            )
            assert cur.fetchall() == [(3, files[2].checksum), (4, files[3].checksum)]
            cur.execute(
                "SELECT instrument_id, session_date, encode(value_hash, 'hex'), open_price, "
                "high_price, "
                "low_price, close_price, volume FROM daily_bar"
            )
            assert cur.fetchone() == sentinel
        assert apply_pending(conn, files) == []
        with conn.cursor() as cur:
            cur.execute(
                "SELECT instrument_id, session_date, encode(value_hash, 'hex'), open_price, "
                "high_price, low_price, close_price, volume FROM daily_bar"
            )
            assert cur.fetchone() == sentinel
    finally:
        conn.close()
