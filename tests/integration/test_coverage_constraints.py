"""PostgreSQL coverage-state constraints."""

from datetime import date
from uuid import uuid4

import psycopg
import pytest

from tests.conftest import MIGRATION_0001_PATH, MIGRATION_0002_PATH, MIGRATION_0003_PATH


@pytest.mark.postgres
# Implements TC-COMP-007, TC-COMP-012
def test_coverage_schema_rejects_bad_ranges_and_keeps_attempt_state(
    postgres_connection_string: str,
) -> None:
    conn = psycopg.connect(postgres_connection_string)
    try:
        with conn.cursor() as cur:
            for path in (MIGRATION_0001_PATH, MIGRATION_0002_PATH, MIGRATION_0003_PATH):
                cur.execute(path.read_text())
            cur.execute(
                "SELECT column_name FROM information_schema.columns "
                "WHERE table_name = 'coverage_segment' ORDER BY ordinal_position"
            )
            assert [row[0] for row in cur.fetchall()] == [
                "coverage_segment_id",
                "instrument_id",
                "data_type",
                "covered_from",
                "covered_to",
            ]
            cur.execute(
                "SELECT column_name FROM information_schema.columns "
                "WHERE table_name = 'acquisition_state' ORDER BY ordinal_position"
            )
            assert [row[0] for row in cur.fetchall()] == [
                "instrument_id",
                "data_type",
                "last_acquired_at",
                "last_run_id",
                "last_outcome",
            ]
            cur.execute(
                "INSERT INTO instrument (symbol, lifecycle) "
                "VALUES ('ABC', 'active') RETURNING instrument_id"
            )
            instrument_id = cur.fetchone()[0]
            coverage_sql = """INSERT INTO coverage_segment
                (instrument_id, data_type, covered_from, covered_to) VALUES (%s, %s, %s, %s)"""
            for data_type in ("reference", "prices", "fundamentals"):
                cur.execute(
                    coverage_sql, (instrument_id, data_type, date(2020, 1, 1), date(2020, 1, 2))
                )
            cur.execute(
                "INSERT INTO instrument (symbol, lifecycle) VALUES ('DEF', 'active') "
                "RETURNING instrument_id"
            )
            corporate_actions_instrument_id = cur.fetchone()[0]
            cur.execute(
                coverage_sql,
                (
                    corporate_actions_instrument_id,
                    "corporate_actions",
                    date(2020, 1, 1),
                    date(2020, 1, 2),
                ),
            )
            conn.commit()
            with pytest.raises(psycopg.errors.CheckViolation) as unknown:
                cur.execute(
                    coverage_sql, (instrument_id, "unknown", date(2020, 1, 3), date(2020, 1, 4))
                )
            assert unknown.value.diag.constraint_name == "coverage_data_type_known"
            conn.rollback()
            with pytest.raises(psycopg.errors.CheckViolation) as reversed_range:
                cur.execute(
                    coverage_sql, (instrument_id, "prices", date(2020, 1, 4), date(2020, 1, 3))
                )
            assert reversed_range.value.diag.constraint_name == "coverage_range_ordered"
            conn.rollback()
            with pytest.raises(psycopg.errors.ExclusionViolation) as overlap:
                cur.execute(
                    coverage_sql, (instrument_id, "prices", date(2020, 1, 2), date(2020, 1, 3))
                )
            assert overlap.value.diag.constraint_name == "coverage_no_overlap"
            conn.rollback()
            cur.execute(coverage_sql, (instrument_id, "prices", date(2020, 1, 3), date(2020, 1, 4)))
            cur.execute(
                "INSERT INTO acquisition_state "
                "(instrument_id, data_type, last_acquired_at, last_run_id, last_outcome) "
                "VALUES (%s, %s, now(), %s, %s)",
                (instrument_id, "reference", uuid4(), "written"),
            )
            cur.execute(
                "INSERT INTO acquisition_state "
                "(instrument_id, data_type, last_acquired_at, last_run_id, last_outcome) "
                "VALUES (%s, %s, now(), %s, %s)",
                (instrument_id, "fundamentals", uuid4(), "not_found"),
            )
            cur.execute(
                "INSERT INTO acquisition_state "
                "(instrument_id, data_type, last_acquired_at, last_run_id, last_outcome) "
                "VALUES (%s, %s, now(), %s, %s)",
                (instrument_id, "corporate_actions", uuid4(), "failed"),
            )
            conn.commit()
            cur.execute(
                "SELECT count(*) FROM coverage_segment WHERE instrument_id = %s", (instrument_id,)
            )
            assert cur.fetchone()[0] == 4
            cur.execute(
                "SELECT count(*) FROM coverage_segment "
                "WHERE instrument_id = %s AND data_type = 'corporate_actions'",
                (instrument_id,),
            )
            assert cur.fetchone()[0] == 0
            with pytest.raises(psycopg.errors.CheckViolation) as bad_state_type:
                cur.execute(
                    """INSERT INTO acquisition_state
                    (instrument_id, data_type, last_acquired_at, last_run_id, last_outcome)
                    VALUES (%s, 'bad_type', now(), %s, 'written')""",
                    (instrument_id, uuid4()),
                )
            assert bad_state_type.value.diag.constraint_name == "acquisition_state_data_type_known"
            conn.rollback()
            with pytest.raises(psycopg.errors.CheckViolation) as bad_state_outcome:
                cur.execute(
                    """INSERT INTO acquisition_state
                    (instrument_id, data_type, last_acquired_at, last_run_id, last_outcome)
                    VALUES (%s, 'prices', now(), %s, 'bad_outcome')""",
                    (instrument_id, uuid4()),
                )
            assert bad_state_outcome.value.diag.constraint_name == "acquisition_state_outcome_known"
            conn.rollback()
    finally:
        conn.close()
