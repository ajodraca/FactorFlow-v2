"""T014 (CAP-002-E2-S4): one run of the momentum stage over a 3000-instrument roster.

Outside the test suite; a signal for CAP-002-E2-S7's volume test, not a gate. Each instrument
has 273 bars (design section 5) spread over 395 calendar days ending 2026-10-16, so every
window's boundaries resolve, four quarterly dividends, and every tenth one a 2-for-1 split.
Run from the component repo root with its virtualenv: .venv/bin/python <this file>.
"""

import re
import time
from datetime import date

import psycopg
from testcontainers.community.postgres import PostgresContainer

from factorflow.classification import constants, engine
from factorflow.db.migrate_main import MIGRATIONS_DIR
from factorflow.db.migrator import apply_pending, discover

N = 3000
D = date(2026, 10, 17)

SEED = """
INSERT INTO instrument (symbol, lifecycle)
SELECT concat('S', g), 'active' FROM generate_series(1, %(n)s) g;

INSERT INTO daily_bar (instrument_id, session_date, observed_on, value_hash, open_price,
                       high_price, low_price, close_price, volume)
SELECT i.instrument_id, s.d, s.d, sha256(convert_to(concat(i.instrument_id, ':', s.d), 'UTF8')),
       10, 10, 10, 50 + (g %% 13) + (i.instrument_id %% 7), 1000
  FROM instrument i
 CROSS JOIN generate_series(0, 272) g
 CROSS JOIN LATERAL (SELECT date '2026-10-16' - (g * 395 / 272) AS d) s;

INSERT INTO corporate_action (instrument_id, action_type, effective_on, observed_on, value_hash,
                              payload)
SELECT i.instrument_id, 'dividend', e.d, e.d,
       sha256(convert_to(concat(i.instrument_id, ':dividend:', e.d), 'UTF8')),
       jsonb_build_object('action_type', 'dividend', 'effective_on', e.d, 'cash_amount', '0.25')
  FROM instrument i
 CROSS JOIN generate_series(0, 3) q
 CROSS JOIN LATERAL (SELECT (date '2026-08-03' - make_interval(months => 3 * q))::date AS d) e;

INSERT INTO corporate_action (instrument_id, action_type, effective_on, observed_on, value_hash,
                              payload)
SELECT i.instrument_id, 'split', date '2026-05-04', date '2026-05-04',
       sha256(convert_to(concat(i.instrument_id, ':split'), 'UTF8')),
       jsonb_build_object('action_type', 'split', 'effective_on', '2026-05-04',
                          'split_from', '1', 'split_to', '2')
  FROM instrument i
 WHERE i.instrument_id %% 10 = 0;

INSERT INTO acquisition_run (state, history_depth_years, started_at, ended_at)
VALUES ('succeeded', 5, now(), now());
ANALYZE;
"""


def shorten(text: str) -> str:
    """Replace the 3000-element roster literal in a plan line with its length."""
    return re.sub(r"'\{[0-9,]{200,}\}'", "'{<3000 instrument ids>}'", text)


def main() -> None:
    with PostgresContainer("postgres:16") as container:
        url = container.get_connection_url(driver=None)
        with psycopg.connect(url) as conn:
            apply_pending(conn, discover(MIGRATIONS_DIR))
            conn.commit()
            started = time.monotonic()
            for statement in SEED.split(";\n"):
                if statement.strip():
                    conn.execute(statement, {"n": N})
            conn.commit()
            print(f"seeded in {time.monotonic() - started:.1f}s")
            counts = conn.execute(
                "SELECT (SELECT count(*) FROM daily_bar), (SELECT count(*) FROM corporate_action)"
            ).fetchone()
            print("daily_bar rows, corporate_action rows:", counts)
            run_id = conn.execute("SELECT run_id FROM acquisition_run").fetchone()[0]
            set_id = conn.execute(
                "INSERT INTO classification_set (run_id, state, classification_date) "
                "VALUES (%s, 'building', %s) RETURNING set_id",
                (run_id, D),
            ).fetchone()[0]
            conn.commit()

            # EXPLAIN (ANALYZE, BUFFERS) of momentum_inputs.sql in one rolled-back
            # transaction, after the fundamentals stage has created the inputs table.
            conn.execute("SET TRANSACTION ISOLATION LEVEL REPEATABLE READ")
            with conn.cursor() as cur:
                ctx = engine._read_context(cur, set_id)
            engine._fundamental_inputs_stage(conn, ctx)
            params = {
                "active_ids": list(ctx.active_ids),
                "classification_date": ctx.classification_date,
                "latest_trading_day": ctx.latest_trading_day,
                "momentum_lag_months": constants.MOMENTUM_LAG_MONTHS,
                "momentum_windows": list(constants.MOMENTUM_WINDOWS_MONTHS),
            }
            started = time.monotonic()
            plan = conn.execute(
                "EXPLAIN (ANALYZE, BUFFERS) " + engine._MOMENTUM_INPUTS_SQL, params
            ).fetchall()
            elapsed = time.monotonic() - started
            text = "\n".join(shorten(row[0]) for row in plan)
            print(f"\n===== momentum_inputs.sql ({elapsed:.2f}s under EXPLAIN ANALYZE)\n{text}")
            scans = sorted(set(re.findall(r"(Seq Scan|Index Scan|Index Only Scan|Bitmap Heap "
                                          r"Scan)[^\n]* on daily_bar", text)))
            print(f"\ndaily_bar access paths: {scans}")
            conn.rollback()

            # The two input stages as the engine runs them, timed end to end.
            engine._STAGES[:] = [engine._fundamental_inputs_stage, engine._momentum_inputs_stage]
            started = time.monotonic()
            result = engine.build(conn, set_id, 300)
            elapsed = time.monotonic() - started
            rows = conn.execute(
                "SELECT input_name, status, count(*) FROM factor_input "
                "WHERE set_id = %s AND factor = 'momentum' GROUP BY 1, 2 ORDER BY 1, 2",
                (set_id,),
            ).fetchall()
            conn.commit()
            print(f"\nbuild {result.state} in {elapsed:.1f}s; momentum rows by status: {rows}")


if __name__ == "__main__":
    main()
