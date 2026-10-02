-- Seed for tests/e2e/coverage-expansion.spec.ts (CAP-001-E6-S4-tasks T022).
-- A plain SQL script, never collected by Playwright. Columns follow
-- migrations/0001-0003. Three active instruments, unique to that spec, each
-- with reference and prices coverage over 2024-01-02..2024-01-05. CVA and CVB
-- have a bar on every day; CVC lacks 2024-01-04, so the trading-day set
-- (any instrument's bar) makes that CVC's one gap. Idempotent.

INSERT INTO instrument (symbol, lifecycle)
VALUES ('CVA', 'active'), ('CVB', 'active'), ('CVC', 'active')
ON CONFLICT DO NOTHING;

INSERT INTO coverage_segment (instrument_id, data_type, covered_from, covered_to)
SELECT i.instrument_id, t.data_type, DATE '2024-01-02', DATE '2024-01-05'
FROM instrument i
CROSS JOIN (VALUES ('reference'), ('prices')) AS t (data_type)
WHERE i.symbol IN ('CVA', 'CVB', 'CVC')
ON CONFLICT DO NOTHING;

INSERT INTO daily_bar (
    instrument_id, session_date, value_hash,
    open_price, high_price, low_price, close_price, volume
)
SELECT
    (SELECT instrument_id FROM instrument WHERE symbol = b.symbol),
    b.session_date,
    sha256((b.symbol || b.session_date::text)::bytea),
    100, 101, 99, 100.5, 1000
FROM (
    VALUES
        ('CVA', DATE '2024-01-02'), ('CVA', DATE '2024-01-03'),
        ('CVA', DATE '2024-01-04'), ('CVA', DATE '2024-01-05'),
        ('CVB', DATE '2024-01-02'), ('CVB', DATE '2024-01-03'),
        ('CVB', DATE '2024-01-04'), ('CVB', DATE '2024-01-05'),
        ('CVC', DATE '2024-01-02'), ('CVC', DATE '2024-01-03'),
        ('CVC', DATE '2024-01-05')
) AS b (symbol, session_date)
ON CONFLICT DO NOTHING;

INSERT INTO acquisition_state (
    instrument_id, data_type, last_acquired_at, last_run_id, last_outcome
)
SELECT instrument_id, 'prices', TIMESTAMPTZ '2024-01-05T22:14:03Z', gen_random_uuid(), 'written'
FROM instrument
WHERE symbol IN ('CVA', 'CVB', 'CVC')
ON CONFLICT DO NOTHING;
