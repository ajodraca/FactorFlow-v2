"""PostgreSQL run-journal constraints."""

import psycopg
import pytest


@pytest.mark.postgres
# Implements TC-COMP-009, TC-COMP-238, TC-COMP-254 through TC-COMP-259
def test_active_run_constraint(migrated_run_schema_connection: psycopg.Connection) -> None:
    with migrated_run_schema_connection.cursor() as cur:
        cur.execute(
            "SELECT column_name FROM information_schema.columns "
            "WHERE table_name = 'acquisition_run' ORDER BY ordinal_position"
        )
        assert [row[0] for row in cur.fetchall()] == [
            "run_id",
            "state",
            "history_depth_years",
            "requested_at",
            "started_at",
            "ended_at",
            "cancel_requested_at",
            "claimed_by",
            "heartbeat_at",
            "instruments_named",
            "instruments_written",
            "instruments_failed",
            "failure_reason",
        ]
        cur.execute("SELECT indexname FROM pg_indexes WHERE tablename = 'acquisition_run'")
        assert {row[0] for row in cur.fetchall()} >= {
            "idx_acquisition_run_single_active",
            "idx_acquisition_run_requested",
            "idx_acquisition_run_recent",
        }
        cur.execute(
            "SELECT column_name, column_default FROM information_schema.columns "
            "WHERE table_name = 'run_instrument_result' ORDER BY ordinal_position"
        )
        result_columns = dict(cur.fetchall())
        assert set(result_columns) == {
            "run_id",
            "instrument_id",
            "data_type",
            "outcome",
            "reason",
            "attempts",
            "completed_at",
        }
        assert result_columns["attempts"] == "1"
        assert result_columns["completed_at"] is not None
        cur.execute("SELECT indexname FROM pg_indexes WHERE tablename = 'run_instrument_result'")
        assert "idx_run_result_failures" in {row[0] for row in cur.fetchall()}
        with pytest.raises(psycopg.errors.CheckViolation) as unknown_state:
            cur.execute(
                "INSERT INTO acquisition_run (state, history_depth_years) VALUES ('unknown', 1)"
            )
        assert unknown_state.value.diag.constraint_name == "acquisition_run_state_known"
        migrated_run_schema_connection.rollback()
        with pytest.raises(psycopg.errors.CheckViolation) as depth:
            cur.execute(
                "INSERT INTO acquisition_run (state, history_depth_years) VALUES ('requested', 0)"
            )
        assert depth.value.diag.constraint_name == "acquisition_run_depth_positive"
        migrated_run_schema_connection.rollback()
        with pytest.raises(psycopg.errors.CheckViolation) as claim_missing:
            cur.execute(
                "INSERT INTO acquisition_run (state, history_depth_years) VALUES ('running', 1)"
            )
        assert claim_missing.value.diag.constraint_name == "acquisition_run_claim_agrees"
        migrated_run_schema_connection.rollback()
        with pytest.raises(psycopg.errors.CheckViolation) as inactive_claim:
            cur.execute(
                "INSERT INTO acquisition_run "
                "(state, history_depth_years, claimed_by, heartbeat_at) "
                "VALUES ('requested', 1, 'runner', now())"
            )
        assert inactive_claim.value.diag.constraint_name == "acquisition_run_claim_agrees"
        migrated_run_schema_connection.rollback()
        with pytest.raises(psycopg.errors.CheckViolation) as terminal_end:
            cur.execute(
                "INSERT INTO acquisition_run (state, history_depth_years) VALUES ('succeeded', 1)"
            )
        assert terminal_end.value.diag.constraint_name == "acquisition_run_terminal_has_end"
        migrated_run_schema_connection.rollback()
        with pytest.raises(psycopg.errors.CheckViolation) as nonterminal_end:
            cur.execute(
                "INSERT INTO acquisition_run (state, history_depth_years, ended_at) "
                "VALUES ('requested', 1, now())"
            )
        assert nonterminal_end.value.diag.constraint_name == "acquisition_run_terminal_has_end"
        migrated_run_schema_connection.rollback()
        cur.execute(
            "INSERT INTO instrument (symbol, lifecycle) VALUES ('ABC', 'active') "
            "RETURNING instrument_id"
        )
        instrument_id = cur.fetchone()[0]
        cur.execute(
            "INSERT INTO acquisition_run (state, history_depth_years) "
            "VALUES ('requested', 3) RETURNING run_id"
        )
        requested_run_id = cur.fetchone()[0]
        cur.execute(
            "INSERT INTO run_instrument_result "
            "(run_id, instrument_id, data_type, outcome, reason, attempts) "
            "VALUES (%s, %s, 'prices', 'failed', 'upstream timeout', 2)",
            (requested_run_id, instrument_id),
        )
        cur.execute(
            "SELECT history_depth_years FROM acquisition_run WHERE run_id = %s", (requested_run_id,)
        )
        assert cur.fetchone() == (3,)
        cur.execute(
            "SELECT data_type, outcome, reason, attempts "
            "FROM run_instrument_result WHERE run_id = %s",
            (requested_run_id,),
        )
        assert cur.fetchone() == ("prices", "failed", "upstream timeout", 2)
        migrated_run_schema_connection.commit()
        with pytest.raises(psycopg.errors.CheckViolation) as result_type:
            cur.execute(
                "INSERT INTO run_instrument_result (run_id, instrument_id, data_type, outcome) "
                "VALUES (%s, %s, 'unknown', 'written')",
                (requested_run_id, instrument_id),
            )
        assert result_type.value.diag.constraint_name == "run_result_data_type_known"
        migrated_run_schema_connection.rollback()
        with pytest.raises(psycopg.errors.CheckViolation) as result_outcome:
            cur.execute(
                "INSERT INTO run_instrument_result (run_id, instrument_id, data_type, outcome) "
                "VALUES (%s, %s, 'fundamentals', 'unknown')",
                (requested_run_id, instrument_id),
            )
        assert result_outcome.value.diag.constraint_name == "run_result_outcome_known"
        migrated_run_schema_connection.rollback()
        with pytest.raises(psycopg.errors.UniqueViolation):
            cur.execute(
                "INSERT INTO run_instrument_result (run_id, instrument_id, data_type, outcome) "
                "VALUES (%s, %s, 'prices', 'written')",
                (requested_run_id, instrument_id),
            )
        migrated_run_schema_connection.rollback()
        active_run_sql = (
            "INSERT INTO acquisition_run "
            "(state, history_depth_years, claimed_by, heartbeat_at) "
            "VALUES ('running', 1, %s, now())"
        )
        cur.execute(active_run_sql, ("runner",))
        migrated_run_schema_connection.commit()
        with pytest.raises(psycopg.errors.UniqueViolation):
            cur.execute(active_run_sql, ("runner2",))
        migrated_run_schema_connection.rollback()
