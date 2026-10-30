"""T022 (CAP-002-E2-S3): one run of the fundamentals stage over a 3000-instrument roster.

Outside the test suite; a signal for CAP-002-E2-S7's volume test, not a gate. Run from the
component repo root with its virtualenv: .venv/bin/python <this file>.
"""

import time
from datetime import date

import psycopg
from testcontainers.community.postgres import PostgresContainer

from factorflow.classification import engine, line_items
from factorflow.classification.line_items import LineItem
from factorflow.db.migrate_main import MIGRATIONS_DIR
from factorflow.db.migrator import apply_pending, discover

N = 3000
D = date(2026, 10, 17)
KEYS = {name: f"t_{name}" for name in line_items.LINE_ITEMS}

SEED = """
INSERT INTO instrument (symbol, lifecycle)
SELECT 'S' || g, 'active' FROM generate_series(1, %(n)s) g;

INSERT INTO daily_bar (instrument_id, session_date, observed_on, value_hash, open_price,
                       high_price, low_price, close_price, volume)
SELECT i.instrument_id, d::date, d::date,
       sha256((i.instrument_id || ':' || d::date)::bytea), 10, 10, 10, 10 + (g %% 7), 1000
  FROM instrument i
 CROSS JOIN generate_series(0, 272) g
 CROSS JOIN LATERAL (SELECT date '2026-10-16' - g AS d) s;

INSERT INTO fundamental_observation (instrument_id, fiscal_period_end, fiscal_period,
                                     statement_type, observed_on, value_hash,
                                     provider_filing_date, payload)
SELECT i.instrument_id, p.period_end, 'Q' || (1 + q %% 4), t.statement_type,
       p.period_end + 15,
       sha256((i.instrument_id || ':' || p.period_end || ':' || t.statement_type)::bytea),
       p.period_end + 20,
       CASE t.statement_type
            WHEN 'balance_sheet' THEN jsonb_build_object(
                't_book_equity', (500 + q)::text, 't_shares_outstanding', '100')
            WHEN 'income_statement' THEN jsonb_build_object(
                't_net_income', (10 + q)::text, 't_diluted_eps', '1.5',
                't_revenue', (100 + q)::text)
            ELSE jsonb_build_object(
                't_operating_cash_flow', '30', 't_capital_expenditure', '-5')
       END
  FROM instrument i
 CROSS JOIN generate_series(0, 7) q
 CROSS JOIN LATERAL (SELECT (date '2026-09-30' - make_interval(months => 3 * q))::date
                             AS period_end) p
 CROSS JOIN (VALUES ('balance_sheet'), ('income_statement'), ('cash_flow_statement'))
            AS t (statement_type);

INSERT INTO acquisition_run (state, history_depth_years, started_at, ended_at)
VALUES ('succeeded', 5, now(), now());
ANALYZE;
"""


def main() -> None:
    for name, item in line_items.LINE_ITEMS.items():
        sign = -1 if name == "capital_expenditure" else 1
        line_items.LINE_ITEMS[name] = LineItem(item.label, item.statement_type, KEYS[name], sign)
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
                "SELECT (SELECT count(*) FROM daily_bar), (SELECT count(*) FROM "
                "fundamental_observation)"
            ).fetchone()
            print("daily_bar rows, fundamental_observation rows:", counts)
            run_id = conn.execute("SELECT run_id FROM acquisition_run").fetchone()[0]

            # EXPLAIN (ANALYZE, BUFFERS) of each statement, in one rolled-back transaction.
            set_id = conn.execute(
                "INSERT INTO classification_set (run_id, state, classification_date) "
                "VALUES (%s, 'building', %s) RETURNING set_id",
                (run_id, D),
            ).fetchone()[0]
            conn.commit()
            conn.execute("SET TRANSACTION ISOLATION LEVEL REPEATABLE READ")
            with conn.cursor() as cur:
                ctx = engine._read_context(cur, set_id)
            params = {
                "set_id": ctx.set_id,
                "active_ids": list(ctx.active_ids),
                "classification_date": ctx.classification_date,
                "latest_trading_day": ctx.latest_trading_day,
                "stale_months": 6,
                **engine._line_item_parameters(),
            }
            for label, sql, args in (
                ("statements.sql", engine._STATEMENTS_SQL, params),
                ("value_inputs.sql", engine._VALUE_INPUTS_SQL, params),
                ("growth_inputs.sql", engine._GROWTH_INPUTS_SQL, params),
                (
                    "insert_inputs.sql",
                    engine._INSERT_INPUTS_SQL,
                    {"set_id": ctx.set_id, "factors": ["value", "growth"]},
                ),
            ):
                plan = conn.execute("EXPLAIN (ANALYZE, BUFFERS) " + sql, args).fetchall()
                text = "\n".join(row[0] for row in plan)
                print(f"\n===== {label}\n{text}")
            conn.rollback()

            # The stage as the engine runs it, timed end to end.
            engine._STAGES[:] = [engine._fundamental_inputs_stage]
            started = time.monotonic()
            result = engine.build(conn, set_id, 300)
            elapsed = time.monotonic() - started
            rows = conn.execute(
                "SELECT status, count(*) FROM factor_input WHERE set_id = %s GROUP BY 1",
                (set_id,),
            ).fetchall()
            conn.commit()
            print(f"\nbuild {result.state} in {elapsed:.1f}s; factor_input by status: {rows}")


if __name__ == "__main__":
    main()
